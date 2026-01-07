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
      >
        Adicionar mais itens
      </v-btn>

      <div class="d-flex justify-space-between align-center mt-6 mb-4">
        <span class="text-h6 font-weight-regular">Total</span>
        <span class="text-h6 font-weight-bold">R$ {{ precoTotalCarrinho.toFixed(2) }}</span>
      </div>
    </div>

    <!-- <v-footer app color="white" class="pa-4 border-t">
      <v-btn
        block
        color="#008a00"
        size="x-large"
        class="text-none text-white font-weight-bold"
        rounded="lg"
        @click="finalizarPedido"
      >
        Fazer pedido
        <v-spacer></v-spacer>
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </v-footer> -->
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
    }
  },

  computed: {
    precoTotalCarrinho() {
      return this.carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0)
    },
  },

  mounted() {
    this.atualizarCarrinho()
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
    finalizarPedido() {},
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

/* Espaçamento para o footer fixo não cobrir o conteúdo */
.v-container {
  padding-bottom: 100px !important;
}
</style>
