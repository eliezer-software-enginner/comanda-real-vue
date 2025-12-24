<script setup lang="ts">
import { computed, onMounted, ref, useCssModule } from 'vue'

import ProductForm from '@/components/painel/ProductForm.vue'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { useRoute } from 'vue-router'
import MenuDisplay from '../../components/MenuDisplay.vue'

const styles = useCssModule()

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const cardapioService = new ProdutosService(lojistaId.value)

// 1. Estado Reativo (ref)
const activeTab = ref<'produtos' | 'loja'>('produtos')
const loading = ref(false)
const initLoading = ref(true)
const message = ref('')

// Inicialização do estado base da loja
const cardapio = ref<ProdutoModel[]>([])

const editingProduct = ref<ProdutoModel | null>(null)

// Crie a função para atribuir o valor ao ref
const setEditingProduct = (produto: ProdutoModel) => {
  editingProduct.value = produto
}

const isAddingProduct = ref(false)

onMounted(() => {
  const fetchInitialData = async () => {
    try {
      // Use o ID de loja fixo para carregar
      const lista = await cardapioService.getLista()
      cardapio.value = lista
    } catch (error: unknown) {
      console.error('Erro ao carregar cardápio:', error)
    } finally {
      initLoading.value = false
    }
  }
  fetchInitialData()
})

// 3. Handlers de Produto
async function handleSaveProduct(produto: ProdutoModel) {
  const existsIndex = cardapio.value.findIndex((p) => p.id === produto.id)

  try {
    if (existsIndex !== -1) {
      // Edição: Substitui o produto existente
      await cardapioService.atualizar(produto)
      cardapio.value[existsIndex] = produto
    } else {
      // Criação: Adiciona novo produto
      await cardapioService.criar({
        categoriaId: produto.categoriaId,
        descricao: produto.descricao,
        imagemUrl: produto.imagemUrl,
        lojistaId: produto.lojistaId,
        nome: produto.nome,
        preco: produto.preco,
      })
      cardapio.value.push(produto)
    }
  } catch (e: any) {
    console.error(e)
    alert(e)
  } finally {
    // Reseta estado do formulário
    editingProduct.value = null
    isAddingProduct.value = false
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
            <a :href="`/cardapio/${lojistaId}`" target="_blank" :class="styles.viewStoreLink">
              Ver Loja Online ↗
            </a>
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
                :onCancel="
                  () => {
                    isAddingProduct = false
                    editingProduct = null
                  }
                "
                :lojista-id="lojistaId"
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
