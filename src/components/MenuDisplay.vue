<script setup lang="ts">
import { computed, ref } from 'vue'

import { ZapProcessor } from '@/services/zapProcessor'
import type { Cardapio, ItemPedido, Pedido, Produto } from '@/types/global'

// 1. Definição de Props (Tipagem com TS)
interface MenuDisplayProps {
  cardapio: Cardapio
  isPreview?: boolean
}
const props = withDefaults(defineProps<MenuDisplayProps>(), {
  isPreview: false,
})

// 2. Estado (ref)
const carrinho = ref<ItemPedido[]>([])
const isCheckoutOpen = ref(false)
const clienteNome = ref('')
const clienteTelefone = ref('')
const enviando = ref(false)

// 3. Funções e Métodos
const addToCart = (produto: Produto) => {
  // 1. Tenta encontrar o item existente (retorna o objeto ou undefined)
  const existingItem = carrinho.value.find((item) => item.produtoId === produto.id)

  if (existingItem) {
    // 2. Se o item existir, o TypeScript sabe que é um ItemPedido, e não undefined.
    //    Alterar a propriedade de um objeto dentro de um 'ref' funciona porque o Vue o rastreia.
    existingItem.quantidade += 1
  } else {
    // 3. Se não existir, adiciona o novo item.
    carrinho.value.push({
      produtoId: produto.id,
      nome: produto.nome,
      precoUnitario: produto.preco,
      quantidade: 1,
    })
  }
}
const removeFromCart = (produtoId: string) => {
  carrinho.value = carrinho.value.filter((item) => item.produtoId !== produtoId)
}

// 4. Propriedade Computada (Computed)
const totalCarrinho = computed(() => {
  return carrinho.value.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0)
})

// 5. Checkout
const handleCheckout = async (e: Event) => {
  e.preventDefault() // Evita recarga padrão do form

  if (props.isPreview) {
    alert('Modo de visualização: Pedido não será enviado.')
    return
  }

  enviando.value = true
  try {
    const pedido: Pedido = {
      id: `pedido_${Date.now()}`,
      lojaId: props.cardapio.id,
      cliente: {
        nome: clienteNome.value,
        telefone: clienteTelefone.value,
      },
      itens: carrinho.value,
      total: totalCarrinho.value,
      dataCriacao: new Date(),
      status: 'pendente',
    }

    const destino = props.cardapio.whatsapp || '5511999999999'
    await ZapProcessor.enviarPedido(pedido, destino)

    alert('Pedido enviado com sucesso! (Veja o console)')
    carrinho.value = [] // Limpa o carrinho
    isCheckoutOpen.value = false
  } catch (error) {
    console.error(error)
    alert('Erro ao enviar pedido.')
  } finally {
    enviando.value = false
  }
}

// 6. Função de Formatação (para uso no template)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-24 relative">
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <img
            v-if="cardapio.fotoUrl"
            :src="cardapio.fotoUrl"
            alt="Logo da Loja"
            class="w-12 h-12 rounded-full object-cover border border-gray-100 bg-gray-200"
            @error="
              (e) => {
                console.error('Erro ao carregar imagem:', cardapio.fotoUrl)
                // 1. Verifica se e.currentTarget existe (não é null)
                if (e.currentTarget) {
                  // 2. Faz o assertion de tipo para garantir que o TS saiba que é um HTMLImageElement
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }
              }
            "
          />
          <h1 class="text-xl font-bold text-gray-900">{{ cardapio.nomeLoja }}</h1>
        </div>
        <button
          v-if="carrinho.length > 0"
          @click="isCheckoutOpen = true"
          class="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
        >
          Ver Sacola ({{ carrinho.length }})
        </button>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div
        v-for="produto in cardapio.produtos"
        :key="produto.id"
        class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4"
      >
        <div
          v-if="produto.imagemUrl"
          class="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0 bg-cover bg-center"
          :style="{ backgroundImage: `url(${produto.imagemUrl})` }"
        />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="font-semibold text-lg text-gray-800">{{ produto.nome }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ produto.descricao }}</p>
          </div>
          <div class="flex justify-between items-end mt-2">
            <span class="font-bold text-gray-900">
              {{ formatCurrency(produto.preco) }}
            </span>
            <button
              @click="addToCart(produto)"
              class="text-blue-600 font-medium text-sm hover:underline"
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="carrinho.length > 0 && !isCheckoutOpen"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:hidden z-20"
    >
      <button
        @click="isCheckoutOpen = true"
        class="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex justify-between px-6"
      >
        <span>Ver Sacola</span>
        <span>{{ formatCurrency(totalCarrinho) }}</span>
      </button>
    </div>

    <div
      v-if="isCheckoutOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div class="p-6 flex-1">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Sua Sacola</h2>
            <button @click="isCheckoutOpen = false" class="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <p v-if="carrinho.length === 0" class="text-center text-gray-500 py-8">
            Sua sacola está vazia.
          </p>

          <div v-else class="space-y-4 mb-8">
            <div
              v-for="(item, idx) in carrinho"
              :key="item.produtoId + '-' + idx"
              class="flex justify-between items-center bg-gray-50 p-3 rounded"
            >
              <div>
                <div class="font-medium text-gray-900">{{ item.nome }}</div>
                <div class="text-sm text-gray-500">
                  {{ item.quantidade }}x {{ formatCurrency(item.precoUnitario) }}
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-semibold text-gray-800">
                  {{ formatCurrency(item.precoUnitario * item.quantidade) }}
                </span>
                <button
                  @click="removeFromCart(item.produtoId)"
                  class="text-red-500 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              </div>
            </div>
            <div
              class="pt-4 border-t border-gray-200 flex justify-between items-center text-lg font-bold text-gray-900"
            >
              <span>Total</span>
              <span>{{ formatCurrency(totalCarrinho) }}</span>
            </div>
          </div>

          <form v-if="carrinho.length > 0" @submit="handleCheckout" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
              <input
                required
                type="text"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                v-model="clienteNome"
                placeholder="Ex: Maria"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp</label>
              <input
                required
                type="tel"
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                v-model="clienteTelefone"
                placeholder="Ex: 11999999999"
              />
            </div>
            <button
              type="submit"
              :disabled="enviando"
              class="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 mt-4"
            >
              {{
                enviando
                  ? 'Enviando...'
                  : isPreview
                    ? 'Simular Pedido'
                    : 'Finalizar Pedido pelo WhatsApp'
              }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
