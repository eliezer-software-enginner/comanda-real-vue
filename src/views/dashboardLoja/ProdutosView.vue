<script setup lang="ts">
import { computed, onMounted, ref, useCssModule } from 'vue'

import ProductForm from '@/components/painel/ProductForm.vue'
import logger from '@/plugins/logs'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { useRoute } from 'vue-router'
import MenuDisplay from '../../components/painel/MenuDisplay.vue'

const styles = useCssModule()

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const cardapioService = new ProdutosService(lojistaId.value)
const categoriasService = new CategoriaService(lojistaId.value)
const lojistaService = new LojistaService()

// 1. Estado Reativo (ref)
const activeTab = ref<'produtos' | 'loja'>('produtos')
const loading = ref(false)
const initLoading = ref(true)
const message = ref('')
const slug = ref('')

// Inicialização do estado base da loja
const cardapio = ref<ProdutoModel[]>([])
const categorias = ref<CategoriaModel[]>([])

const isModoEdicao = ref(false)
const editingProduct = ref<ProdutoModel | null>(null)

// Crie a função para atribuir o valor ao ref
const setEditingProduct = (produto: ProdutoModel) => {
  editingProduct.value = produto
  isModoEdicao.value = true
}

const isAddingProduct = ref(false)

onMounted(() => {
  const fetchInitialData = async () => {
    try {
      // Use o ID de loja fixo para carregar
      const lista = await cardapioService.getLista()
      cardapio.value = lista

      slug.value = (await lojistaService.getData(lojistaId.value))?.slug || 'erro-slug'
      categorias.value = await categoriasService.getLista()

      logger.info('categorias carregadas', { label: 'ProdutoForm', total: lista.length })
    } catch (error: unknown) {
      logger.error('Erro ao carregar os dados iniciais', error)
    } finally {
      initLoading.value = false
    }
  }
  fetchInitialData()
})

async function handleSaveProduct(produto: ProdutoDto) {
  try {
    const produtoModel = await cardapioService.criar(produto)
    cardapio.value.push(produtoModel)
  } catch (e: any) {
    console.error(e)
    alert(e)
  } finally {
    // Reseta estado do formulário
    editingProduct.value = null
    isAddingProduct.value = false
    isModoEdicao.value = false
  }
}

async function handleEditProduct(produto: ProdutoModel) {
  try {
    const existsIndex = cardapio.value.findIndex((p) => p.id === produto.id)
    if (existsIndex !== -1) {
      // Edição: Substitui o produto existente
      await cardapioService.atualizar(produto)
      cardapio.value[existsIndex] = produto
    }
  } catch (e: any) {
    console.error(e)
    alert(e)
  } finally {
    // Reseta estado do formulário
    editingProduct.value = null
    isAddingProduct.value = false
    isModoEdicao.value = false
  }
}

async function handleExcluirProduto(produtoId: string) {
  if (confirm('Tem certeza que deseja remover este produto? Id: ' + produtoId)) {
    try {
      await cardapioService.excluir(produtoId)
      cardapio.value = cardapio.value.filter((p) => p.id !== produtoId)
    } catch (e: any) {
      alert(e.message)
    }
  }
}
</script>

<template>
  <div :class="styles.container">
    <div v-if="initLoading" :class="styles.loading">Carregando painel...</div>

    <div v-else :class="styles.content">
      <header :class="styles.header">
        <div :class="styles.headerContent">
          <h1 :class="styles.headerTitle">Painel do Lojista</h1>
          <div :class="styles.headerActions">
            <router-link
              :to="{
                name: 'cardapio',
                query: { estabelecimento: slug, id: lojistaId },
              }"
              target="_blank"
              :class="styles.viewStoreLink"
            >
              Ver Loja Online ↗
            </router-link>
          </div>
        </div>
      </header>

      <div :class="styles.mainContent">
        <aside :class="styles.sidebar">
          <div :class="styles.tabs">
            <button
              @click="activeTab = 'produtos'"
              :class="[styles.tab, activeTab === 'produtos' ? styles.tabActive : '']"
            >
              Produtos
            </button>
            <!-- <button
              @click="activeTab = 'loja'"
              :class="[styles.tab, activeTab === 'loja' ? styles.tabActive : '']"
            >
              Configurações
            </button> -->
          </div>

          <div :class="styles.sidebarContent">
            <div v-if="activeTab === 'produtos'" :class="styles.productsTab">
              <div v-if="!isAddingProduct && !editingProduct">
                <button @click="isAddingProduct = true" :class="styles.addProductButton">
                  + Adicionar Novo Produto
                </button>

                <div :class="styles.productsList">
                  <p v-if="cardapio.length === 0" :class="styles.emptyProducts">
                    Nenhum produto cadastrado.
                  </p>

                  <div v-for="produto in cardapio" :key="produto.id" :class="styles.productItem">
                    <div>
                      <div :class="styles.productItemName">{{ produto.nome }}</div>
                      <div :class="styles.productItemPrice">
                        <!-- {{ formatCurrency(produto.preco) }} -->
                        {{ produto.preco }}
                      </div>
                    </div>
                    <div :class="styles.productItemActions">
                      <button @click="setEditingProduct(produto)" :class="styles.editButton">
                        Editar
                      </button>
                      <button
                        @click="handleExcluirProduto(produto.id)"
                        :class="styles.deleteButton"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <ProductForm
                v-else
                :initial-data="editingProduct || undefined"
                :onSave="handleSaveProduct"
                :onEditar="handleEditProduct"
                :isModoEdicao="isModoEdicao"
                :onCancel="
                  () => {
                    isAddingProduct = false
                    editingProduct = null
                  }
                "
                :lojista-id="lojistaId"
                :categorias="categorias"
              />
            </div>
          </div>

          <div
            v-if="message"
            :class="[
              styles.message,
              message.includes('✅') ? styles.messageSuccess : styles.messageError,
            ]"
          >
            {{ message }}
          </div>
        </aside>

        <main :class="styles.preview">
          <div :class="styles.previewInner">
            <div :class="styles.phoneFrame">
              <div :class="styles.phoneNotch"></div>

              <div :class="styles.phoneContent">
                <MenuDisplay :cardapio="cardapio" :is-preview="true" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style module src="./ProdutosView.module.css"></style>
