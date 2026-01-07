<template>
  <v-container
    class="pa-0 bg-grey-lighten-4 fill-height align-start"
    style="max-width: 100%; overflow-x: hidden"
  >
    <v-toolbar flat color="white" class="border-b">
      <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="text-body-1 font-weight-bold text-center">Meu pedido</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <div
      class="pa-4 bg-white"
      style="width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden"
    >
      <v-card v-for="item in carrinho" :key="item.id" flat outlined class="mb-3 pa-3 item-card">
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
        size="large"
        class="text-none text-white font-weight-bold"
        rounded="lg"
        :disabled="carrinho.length === 0"
        @click="finalizarPedido"
      >
        <v-icon left size="20">mdi-whatsapp</v-icon>
        Fazer pedido
        <v-spacer></v-spacer>
        <span class="text-body-2 font-weight-medium"
          >R$ {{ (precoTotalCarrinho + taxaEntrega).toFixed(2) }}</span
        >
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
/* Prevenir overflow horizontal */
.v-container {
  max-width: 100vw !important;
  overflow-x: hidden !important;
  padding-bottom: 100px !important;
}

/* Garantir que não ultrapasse o viewport */
* {
  box-sizing: border-box;
}

/* Container de conteúdo com contenção adequada */
.pa-4.bg-white {
  max-width: 100% !important;
  overflow-x: hidden !important;
  padding-top: 24px !important; /* Adiciona mais espaço no topo */
}

/* Card de item com borda fina e arredondada */
.item-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  max-width: 100% !important;
  overflow: hidden !important;
  margin-bottom: 16px !important; /* Aumenta espaçamento entre cards */
}

/* Seletor de quantidade no estilo cinza claro da Goomer */
.stepper-goomer {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
  flex-shrink: 0;
}

/* Garantir que textos não quebrem layout */
.d-flex {
  max-width: 100%;
  flex-wrap: nowrap;
}

/* Avatar com tamanho fixo */
.v-avatar {
  flex-shrink: 0;
}

/* Área de texto com quebra adequada */
.flex-grow-1 {
  min-width: 0; /* Permite que o texto encolha se necessário */
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

/* Ajuste no Radio Group para ocupar o card todo */
.goomer-radio :deep(.v-selection-control) {
  width: 100%;
  justify-content: space-between;
  flex-direction: row-reverse;
}

/* Remove sombras excessivas do Vuetify para um look flat */
.v-btn {
  box-shadow: none !important;
}

/* Responsividade */
@media (max-width: 600px) {
  .v-container {
    padding-bottom: 120px !important;
  }

  .item-card {
    margin-bottom: 8px !important;
  }

  .stepper-goomer {
    margin-left: 8px;
  }
}

/* Evitar rolagem horizontal */
html,
body {
  overflow-x: hidden;
}

/* Para dispositivos muito pequenos */
@media (max-width: 360px) {
  .d-flex {
    flex-wrap: wrap;
  }

  .stepper-goomer {
    width: 100%;
    margin-top: 8px;
    justify-content: center;
  }

  .v-avatar {
    width: 50px !important;
    height: 50px !important;
  }

  .v-footer .v-btn {
    font-size: 0.9rem !important;
    padding: 0 16px !important;
    height: 52px !important;
  }

  .v-footer .v-btn .v-icon {
    font-size: 18px !important;
  }

  .v-footer .v-btn .text-body-2 {
    font-size: 0.85rem !important;
  }
}

/* Para dispositivos pequenos */
@media (max-width: 400px) {
  .v-footer .v-btn {
    font-size: 0.95rem !important;
  }
}

/* Botão principal de WhatsApp */
.v-footer .v-btn {
  height: 56px !important;
  min-height: 56px !important;
  border-radius: 16px !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  text-transform: none !important;
  letter-spacing: -0.3px !important;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 0 20px !important;
  white-space: nowrap !important;
}

.v-footer .v-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 32px rgba(37, 211, 102, 0.4) !important;
}

.v-footer .v-btn:active {
  transform: translateY(0) !important;
}
</style>
