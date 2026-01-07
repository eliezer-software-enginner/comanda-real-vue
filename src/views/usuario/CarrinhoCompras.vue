<template>
  <v-container class="pa-0 bg-grey-lighten-4 fill-height align-start">
    <v-toolbar flat color="white" class="border-b">
      <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="text-body-1 font-weight-bold text-center">Meu pedido</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <div class="pa-4 w-100 bg-white">
      <v-card
        v-for="(item, index) in carrinho"
        :key="item.id"
        flat
        outlined
        class="mb-3 pa-3 item-card"
      >
        <div class="d-flex align-center">
          <v-avatar size="60" rounded="lg" class="mr-3">
            <v-img :src="item.imagemUrl" cover></v-img>
          </v-avatar>

          <div class="flex-grow-1">
            <h4 class="text-body-2 font-weight-bold mb-1">{{ item.nome }}</h4>
            <p class="text-body-2 mb-0">R$ {{ item.preco.toFixed(2) }}</p>
          </div>

          <div class="stepper-goomer">
            <v-btn icon variant="text" size="x-small" @click="diminuirQuantidade(item)">
              <v-icon :color="item.quantidade === 1 ? 'red' : 'grey-darken-1'">
                {{ item.quantidade === 1 ? 'mdi-delete-outline' : 'mdi-minus' }}
              </v-icon>
            </v-btn>
            <span class="px-2 text-body-2 font-weight-bold">{{ item.quantidade }}</span>
            <v-btn icon variant="text" size="x-small" @click="aumentarQuantidade(item)">
              <v-icon color="grey-darken-3">mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>

      <v-btn
        variant="outlined"
        block
        color="green-darken-2"
        class="text-none mt-4 font-weight-bold py-6"
        rounded="lg"
        @click="voltarAoCardapio"
      >
        <v-icon left>mdi-plus-circle-outline</v-icon>
        Adicionar mais itens
      </v-btn>

      <!-- Resumo do pedido -->
      <v-card flat class="mt-4 pa-4 resumo-card">
        <h5 class="text-body-1 font-weight-bold mb-3">Resumo do pedido</h5>

        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">Subtotal</span>
          <span class="text-body-2">R$ {{ precoTotalCarrinho.toFixed(2) }}</span>
        </div>

        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-2">Taxa de entrega</span>
          <span class="text-body-2">R$ {{ taxaEntrega.toFixed(2) }}</span>
        </div>

        <v-divider class="my-2"></v-divider>

        <div class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-regular">Total</span>
          <span class="text-h6 font-weight-bold green--text">
            R$ {{ (precoTotalCarrinho + taxaEntrega).toFixed(2) }}
          </span>
        </div>
      </v-card>

      <!-- Campo de observação do pedido -->
      <v-textarea
        v-model="observacaoPedido"
        label="Observações do pedido (opcional)"
        placeholder="Ex: Sem cebola, ponto da carne, etc."
        rows="3"
        class="mt-4"
        outlined
        dense
      ></v-textarea>
    </div>

    <!-- Footer fixo com botão de finalizar -->
    <v-footer app color="white" class="pa-4 border-t elevation-4">
      <v-btn
        block
        color="#008a00"
        size="x-large"
        class="text-none text-white font-weight-bold"
        rounded="lg"
        :disabled="carrinho.length === 0"
        @click="finalizarPedido"
      >
        <v-icon left>mdi-whatsapp</v-icon>
        Fazer pedido pelo WhatsApp
        <v-spacer></v-spacer>
        <span class="text-body-2">R$ {{ (precoTotalCarrinho + taxaEntrega).toFixed(2) }}</span>
      </v-btn>
    </v-footer>
  </v-container>
</template>

<script lang="ts">
import type { ProdutoEmCarrinho } from '@/services/carrinhoService/CarrinhoModel'
import { CarrinhoService } from '@/services/carrinhoService/CarrinhoService'

export default {
  data() {
    return {
      carrinho: [] as ProdutoEmCarrinho[],
      taxaEntrega: 2,
      carrinhoService: new CarrinhoService(),
      observacaoPedido: '',
    }
  },

  computed: {
    precoTotalCarrinho() {
      return this.carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0)
    },

    totalComTaxa() {
      return this.precoTotalCarrinho + this.taxaEntrega
    },

    whatsappMessage() {
      if (this.carrinho.length === 0) return ''

      let message = `🛒 *NOVO PEDIDO*\n\n`
      message += `*Itens do pedido:*\n`

      this.carrinho.forEach((item, index) => {
        message += `${index + 1}. ${item.nome} - ${item.quantidade}x - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      })

      message += `\n*Subtotal:* R$ ${this.precoTotalCarrinho.toFixed(2)}`
      message += `\n*Taxa de entrega:* R$ ${this.taxaEntrega.toFixed(2)}`
      message += `\n*TOTAL:* R$ ${this.totalComTaxa.toFixed(2)}`

      if (this.observacaoPedido.trim()) {
        message += `\n\n*Observações:* ${this.observacaoPedido}`
      }

      return message
    },
  },

  mounted() {
    this.atualizarCarrinho()

    // Escuta atualizações do carrinho
    window.addEventListener('carrinho-atualizado', this.atualizarCarrinho)
  },

  beforeUnmount() {
    window.removeEventListener('carrinho-atualizado', this.atualizarCarrinho)
  },

  methods: {
    atualizarCarrinho() {
      this.carrinho = this.carrinhoService.listar()
    },

    aumentarQuantidade(item: ProdutoEmCarrinho) {
      this.carrinhoService.adicionarProduto(item)
      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },

    diminuirQuantidade(item: ProdutoEmCarrinho) {
      this.carrinhoService.diminuirQuantidade(item.id)
      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },

    voltarAoCardapio() {
      this.$router.push({
        name: 'cardapio',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
          id: this.$route.query.id,
        },
      })
    },

    finalizarPedido() {
      if (this.carrinho.length === 0) {
        alert('Seu carrinho está vazio!')
        return
      }

      // Obtém o WhatsApp do lojista (poderia vir do serviço ou rota)
      const whatsappLojista = (this.$route.query.whatsapp as string) || '5511999999999'

      // Formata o número para o WhatsApp
      const whatsappFormatted = whatsappLojista.replace(/\D/g, '')

      // Codifica a mensagem para URL
      const encodedMessage = encodeURIComponent(this.whatsappMessage)

      // Constrói a URL do WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappFormatted}?text=${encodedMessage}`

      // Abre o WhatsApp em nova aba
      window.open(whatsappUrl, '_blank')

      // Opcional: limpar carrinho após finalizar
      // this.carrinhoService.esvaziarCarrinho()
      // this.atualizarCarrinho()
    },
  },
}
</script>

<style scoped>
/* Card de item com borda fina e arredondada */
.item-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
}

/* Seletor de quantidade no estilo cinza claro da Goomer */
.stepper-goomer {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

/* Card de resumo do pedido */
.resumo-card {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}

/* Remove sombras excessivas do Vuetify para um look flat */
.v-btn {
  box-shadow: none !important;
}

/* Espaçamento para o footer fixo não cobrir o conteúdo */
.v-container {
  padding-bottom: 120px !important;
}

/* Animação suave para o footer */
.v-footer {
  transition: all 0.3s ease;
}

/* Estilo para botão desabilitado */
.v-btn--disabled {
  opacity: 0.6 !important;
  background-color: #cccccc !important;
}

/* Melhorias no textarea */
.v-textarea fieldset {
  border-radius: 12px;
}

/* Responsividade */
@media (max-width: 600px) {
  .v-container {
    padding-bottom: 140px !important;
  }
}
</style>
