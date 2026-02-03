<script setup lang="ts">
import { computed, onMounted, ref, useCssModule } from 'vue'

import ProductForm from '@/components/painel/ProductForm.vue'
import logger from '@/plugins/logs'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { WhatsAppService } from '@/services/whatsappService/WhatsAppService'
import { useLojistaStore } from '@/stores/lojista'
import { useProdutosStore } from '@/stores/produtos'
import MenuDisplay from '../../components/painel/MenuDisplay.vue'

const styles = useCssModule()

// Stores
const lojistaStore = useLojistaStore()
const produtosStore = useProdutosStore()

const lojistaId = computed(() => lojistaStore.lojistaId!)

const categoriasService = new CategoriaService(lojistaId.value)
const lojistaService = new LojistaService()
const whatsAppService = new WhatsAppService()

// 1. Estado Reativo (ref)
const activeTab = ref<'produtos' | 'loja'>('produtos')
const initLoading = ref(true)
const message = ref('')
const slug = ref('')

// Inicialização do estado base da loja
const categorias = ref<CategoriaModel[]>([])

const isModoEdicao = ref(false)
const editingProduct = ref<ProdutoModel | null>(null)

// Crie a função para atribuir o valor ao ref
const setEditingProduct = (produto: ProdutoModel) => {
  editingProduct.value = produto
  isModoEdicao.value = true
}

const isAddingProduct = ref(false)

// Usar produtos do store
const cardapio = computed(() => produtosStore.produtos)

onMounted(async () => {
  const fetchInitialData = async () => {
    try {
      // Carregar produtos usando o store
      await produtosStore.fetchProdutos(lojistaId.value)

      slug.value = (await lojistaService.getData(lojistaId.value))?.slug || 'erro-slug'
      categorias.value = await categoriasService.getLista()

      logger.info('Dados iniciais carregados', {
        label: 'ProdutosView',
        produtosTotal: produtosStore.produtos.length,
      })
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
    await produtosStore.criarProduto(produto)
    logger.info('Produto criado com sucesso', { nome: produto.nome })
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
    await produtosStore.atualizarProduto(produto)
    logger.info('Produto atualizado com sucesso', { nome: produto.nome })
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
      await produtosStore.excluirProduto(produtoId, lojistaId.value)
      logger.info('Produto excluído com sucesso', { produtoId })
    } catch (e: any) {
      alert(e.message)
    }
  }
}

function copiarLink() {
  const montarUrl = `http://localhost:5173/cardapio?estabelecimento=${slug.value}`

  navigator.clipboard.writeText(montarUrl)
  alert('Url copiada: ' + montarUrl)
}

async function simularRecebimentoPedido() {
  try {
    await whatsAppService.simularRecebimentoPedido(lojistaStore.lojista?.whatsapp)
    alert('Pedido simulado enviado com sucesso! Verifique seu WhatsApp.')
    logger.info('', {
      label: 'ProdutosView',
      info: 'Pedido simulado enviado com sucesso! Verifique seu WhatsApp.',
    })
  } catch (error) {
    logger.error('Erro ao simular pedido', {
      error: error,
    })
    alert('Erro ao simular pedido. Tente novamente.')
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
                query: { estabelecimento: slug },
              }"
              target="_blank"
              :class="styles.viewStoreLink"
            >
              Ver Loja Online ↗
            </router-link>

            <span :class="styles.viewStoreLink" v-on:click="copiarLink()">
              Copiar link da loja
            </span>

            <span :class="styles.viewStoreLink" v-on:click="simularRecebimentoPedido()">
              Simular recebimento de pedido
            </span>
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
              <!-- <div :class="styles.phoneNotch"></div> -->

              <div :class="styles.phoneContent">
                <MenuDisplay :cardapio="cardapio" :is-preview="true" :categorias="categorias" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style module src="./ProdutosView.module.css"></style>
