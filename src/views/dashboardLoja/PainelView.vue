<script setup lang="ts">
import { onMounted, ref, useCssModule } from 'vue'

import ProductForm from '@/components/painel/ProductForm.vue'
import StoreSettings from '@/components/painel/StoreSettings.vue'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import type { Cardapio, Produto } from '@/types/global'
import MenuDisplay from '../../components/MenuDisplay.vue'

const styles = useCssModule()

const cardapioService = new ProdutosService()

// 1. Estado Reativo (ref)
const activeTab = ref<'produtos' | 'loja'>('produtos')
const loading = ref(false)
const initLoading = ref(true)
const message = ref('')

// Inicialização do estado base da loja
const cardapio = ref<Cardapio>({
  id: 'TESTE_DEV_LOJA',
  nomeLoja: 'Minha Loja',
  produtos: [],
})

const editingProduct = ref<Produto | null>(null)

// Crie a função para atribuir o valor ao ref
const setEditingProduct = (produto: Produto) => {
  editingProduct.value = produto
}

const isAddingProduct = ref(false)

// 2. Ciclo de Vida: Carregar dados iniciais (Substitui useEffect com array vazia)
onMounted(() => {
  const fetchInitialData = async () => {
    try {
      // Use o ID de loja fixo para carregar
      //  const data = await cardapioService.getCardapio(cardapio.value.id)
      const data = '' //TODO remover depois
      if (data) {
        cardapio.value = data
      } else {
        console.log('Nenhum cardápio encontrado, usando estado inicial.')
      }
    } catch (error: unknown) {
      console.error('Erro ao carregar cardápio:', error)
    } finally {
      initLoading.value = false
    }
  }
  fetchInitialData()
})

// 3. Handlers de Produto
const handleSaveProduct = (produto: Produto) => {
  const existsIndex = cardapio.value.produtos.findIndex((p) => p.id === produto.id)

  if (existsIndex !== -1) {
    // Edição: Substitui o produto existente
    // cardapio.value.produtos[existsIndex] = produto
  } else {
    // Criação: Adiciona novo produto
    //  cardapio.value.produtos.push(produto)
  }

  // Reseta estado do formulário
  editingProduct.value = null
  isAddingProduct.value = false
}

const handleDeleteProduct = (produtoId: string) => {
  if (confirm('Tem certeza que deseja remover este produto?')) {
    cardapio.value.produtos = cardapio.value.produtos.filter((p) => p.id !== produtoId)
  }
}

// 4. Handler de Configurações da Loja
const handleUpdateSettings = (settings: Partial<Cardapio>) => {
  // O Vue permite a fusão de objetos de forma reativa
  Object.assign(cardapio.value, settings)
}

// 5. Função de Salvamento (Firestore)
const saveToFirestore = async () => {
  loading.value = true
  message.value = ''
  try {
    // await cardapioService.salvarCardapio(cardapio.value)
    message.value = '✅ Alterações salvas com sucesso!'
  } catch (error) {
    console.error(error)
    message.value = '❌ Erro ao salvar alterações.'
  } finally {
    loading.value = false
    setTimeout(() => (message.value = ''), 3000)
  }
}

// 6. Função de formatação (para uso no template)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
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
            <a :href="`/cardapio/${cardapio.id}`" target="_blank" :class="styles.viewStoreLink">
              Ver Loja Online ↗
            </a>
            <button @click="saveToFirestore" :disabled="loading" :class="styles.saveButton">
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
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
            <button
              @click="activeTab = 'loja'"
              :class="[styles.tab, activeTab === 'loja' ? styles.tabActive : '']"
            >
              Configurações
            </button>
          </div>

          <div :class="styles.sidebarContent">
            <div v-if="activeTab === 'produtos'" :class="styles.productsTab">
              <div v-if="!isAddingProduct && !editingProduct">
                <button @click="isAddingProduct = true" :class="styles.addProductButton">
                  + Adicionar Novo Produto
                </button>

                <div :class="styles.productsList">
                  <p v-if="cardapio.produtos.length === 0" :class="styles.emptyProducts">
                    Nenhum produto cadastrado.
                  </p>

                  <div
                    v-for="produto in cardapio.produtos"
                    :key="produto.id"
                    :class="styles.productItem"
                  >
                    <div>
                      <div :class="styles.productItemName">{{ produto.nome }}</div>
                      <div :class="styles.productItemPrice">
                        {{ formatCurrency(produto.preco) }}
                      </div>
                    </div>
                    <div :class="styles.productItemActions">
                      <button @click="setEditingProduct(produto)" :class="styles.editButton">
                        Editar
                      </button>
                      <button @click="handleDeleteProduct(produto.id)" :class="styles.deleteButton">
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
              />
            </div>

            <StoreSettings
              v-if="activeTab === 'loja'"
              :cardapio="cardapio"
              :onSave="handleUpdateSettings"
            />
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

<style module src="./PainelView.module.css"></style>
