<script setup lang="ts">
import { computed, ref, useCssModule } from 'vue'

import { ZapProcessor } from '@/services/zapProcessor'
import type { Cardapio, ItemPedido, Pedido, Produto } from '@/types/global'

const styles = useCssModule()

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
  <div :class="styles.container">
    <header :class="styles.header">
      <div :class="styles.headerContent">
        <div :class="styles.logoContainer">
          <img
            v-if="cardapio.fotoUrl"
            :src="cardapio.fotoUrl"
            alt="Logo da Loja"
            :class="styles.logo"
            @error="
              (e) => {
                console.error('Erro ao carregar imagem:', cardapio.fotoUrl)
                if (e.currentTarget) {
                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                }
              }
            "
          />
          <h1 :class="styles.storeName">{{ cardapio.nomeLoja }}</h1>
        </div>
        <button
          v-if="carrinho.length > 0"
          @click="isCheckoutOpen = true"
          :class="styles.cartButton"
        >
          Ver Sacola ({{ carrinho.length }})
        </button>
      </div>
    </header>

    <main :class="styles.main">
      <div
        v-for="produto in cardapio.produtos"
        :key="produto.id"
        :class="styles.productCard"
      >
        <div
          v-if="produto.imagemUrl"
          :class="styles.productImage"
          :style="{ backgroundImage: `url(${produto.imagemUrl})` }"
        />
        <div :class="styles.productInfo">
          <div>
            <h3 :class="styles.productName">{{ produto.nome }}</h3>
            <p :class="styles.productDescription">{{ produto.descricao }}</p>
          </div>
          <div :class="styles.productFooter">
            <span :class="styles.productPrice">
              {{ formatCurrency(produto.preco) }}
            </span>
            <button
              @click="addToCart(produto)"
              :class="styles.addButton"
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="carrinho.length > 0 && !isCheckoutOpen"
      :class="styles.floatingCartBar"
    >
      <button
        @click="isCheckoutOpen = true"
        :class="styles.floatingCartButton"
      >
        <span>Ver Sacola</span>
        <span>{{ formatCurrency(totalCarrinho) }}</span>
      </button>
    </div>

    <div
      v-if="isCheckoutOpen"
      :class="styles.modalOverlay"
    >
      <div
        :class="styles.modalContent"
      >
        <div :class="styles.modalBody">
          <div :class="styles.modalHeader">
            <h2 :class="styles.modalTitle">Sua Sacola</h2>
            <button @click="isCheckoutOpen = false" :class="styles.closeButton">
              ✕
            </button>
          </div>

          <p v-if="carrinho.length === 0" :class="styles.emptyCart">
            Sua sacola está vazia.
          </p>

          <div v-else :class="styles.cartItems">
            <div
              v-for="(item, idx) in carrinho"
              :key="item.produtoId + '-' + idx"
              :class="styles.cartItem"
            >
              <div>
                <div :class="styles.cartItemName">{{ item.nome }}</div>
                <div :class="styles.cartItemDetails">
                  {{ item.quantidade }}x {{ formatCurrency(item.precoUnitario) }}
                </div>
              </div>
              <div :class="styles.cartItemActions">
                <span :class="styles.cartItemPrice">
                  {{ formatCurrency(item.precoUnitario * item.quantidade) }}
                </span>
                <button
                  @click="removeFromCart(item.produtoId)"
                  :class="styles.removeButton"
                >
                  Remover
                </button>
              </div>
            </div>
            <div
              :class="styles.cartTotal"
            >
              <span>Total</span>
              <span>{{ formatCurrency(totalCarrinho) }}</span>
            </div>
          </div>

          <form v-if="carrinho.length > 0" @submit="handleCheckout" :class="styles.checkoutForm">
            <div :class="styles.formGroup">
              <label>Seu Nome</label>
              <input
                required
                type="text"
                v-model="clienteNome"
                placeholder="Ex: Maria"
              />
            </div>
            <div :class="styles.formGroup">
              <label>Seu WhatsApp</label>
              <input
                required
                type="tel"
                v-model="clienteTelefone"
                placeholder="Ex: 11999999999"
              />
            </div>
            <button
              type="submit"
              :disabled="enviando"
              :class="styles.submitButton"
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

<style module src="./MenuDisplay.module.css"></style>

