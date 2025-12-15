<script setup lang="ts">
import { onMounted, ref } from 'vue'
// Certifique-se de que os caminhos de importação estão corretos para o seu projeto Vue
import ProductForm from '@/components/painel/ProductForm.vue'
import StoreSettings from '@/components/painel/StoreSettings.vue'
import { getCardapio, saveCardapio } from '@/services/dbService'
import type { Cardapio, Produto } from '@/types/global'
import MenuDisplay from '../components/MenuDisplay.vue'

// 1. Estado Reativo (ref)
const activeTab = ref<'produtos' | 'loja'>('produtos')
const loading = ref(false)
const initLoading = ref(true)
const message = ref('')

// Inicialização do estado base da loja
const cardapio = ref<Cardapio>({
  id: 'loja_teste_1',
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
      const data = await getCardapio(cardapio.value.id)
      if (data) {
        cardapio.value = data
      } else {
        console.log('Nenhum cardápio encontrado, usando estado inicial.')
      }
    } catch (error) {
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
    cardapio.value.produtos[existsIndex] = produto
  } else {
    // Criação: Adiciona novo produto
    cardapio.value.produtos.push(produto)
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
    // Salva o objeto cardapio atualizado
    await saveCardapio(cardapio.value)
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
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <div v-if="initLoading" class="flex justify-center items-center min-h-screen text-gray-500">
      Carregando painel...
    </div>

    <div v-else class="flex flex-col flex-1">
      <header class="bg-white shadow-sm z-20 sticky top-0">
        <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 class="text-xl font-bold text-gray-800">Painel do Lojista</h1>
          <div class="flex items-center gap-4">
            <a
              :href="`/cardapio/${cardapio.id}`"
              target="_blank"
              class="text-blue-600 hover:underline text-sm"
            >
              Ver Loja Online ↗
            </a>
            <button
              @click="saveToFirestore"
              :disabled="loading"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-bold"
            >
              {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <aside
          class="w-full md:w-1/3 lg:w-[400px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col"
        >
          <div class="flex border-b border-gray-200">
            <button
              @click="activeTab = 'produtos'"
              :class="[
                'flex-1 py-3 text-sm font-medium',
                activeTab === 'produtos'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              Produtos
            </button>
            <button
              @click="activeTab = 'loja'"
              :class="[
                'flex-1 py-3 text-sm font-medium',
                activeTab === 'loja'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700',
              ]"
            >
              Configurações
            </button>
          </div>

          <div class="p-4 flex-1">
            <div v-if="activeTab === 'produtos'" class="space-y-4">
              <div v-if="!isAddingProduct && !editingProduct">
                <button
                  @click="isAddingProduct = true"
                  class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  + Adicionar Novo Produto
                </button>

                <div class="space-y-2 mt-4">
                  <p
                    v-if="cardapio.produtos.length === 0"
                    class="text-center text-gray-400 text-sm py-4"
                  >
                    Nenhum produto cadastrado.
                  </p>

                  <div
                    v-for="produto in cardapio.produtos"
                    :key="produto.id"
                    class="border border-gray-200 rounded p-3 flex justify-between items-center bg-gray-50"
                  >
                    <div>
                      <div class="font-medium text-gray-800">{{ produto.nome }}</div>
                      <div class="text-xs text-gray-500">
                        {{ formatCurrency(produto.preco) }}
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        @click="setEditingProduct(produto)"
                        class="text-blue-500 text-sm hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        @click="handleDeleteProduct(produto.id)"
                        class="text-red-500 text-sm hover:underline"
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
              'p-3 text-center text-sm',
              message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
            ]"
          >
            {{ message }}
          </div>
        </aside>

        <main class="flex-1 bg-gray-100 overflow-y-auto relative hidden md:block">
          <div class="absolute inset-0 p-8 flex justify-center">
            <div
              class="w-full max-w-[375px] h-[812px] bg-white rounded-[3rem] shadow-2xl border-8 border-gray-800 overflow-hidden relative"
            >
              <div
                class="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-xl z-30"
              ></div>

              <div class="h-full overflow-y-auto no-scrollbar bg-gray-50">
                <MenuDisplay :cardapio="cardapio" :is-preview="true" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
