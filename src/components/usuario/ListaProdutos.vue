<template>
  <div class="listaProdutos">
    <v-card
      v-for="item in carrinho"
      :key="item.id"
      flat
      outlined
      class="item-card"
    >
      <div class="itemContainer">
        <!-- Produto -->
        <div class="itemContainer">
          <v-avatar size="40" class="mr-3">
            <v-img :src="item.imagemUrl" cover />
          </v-avatar>

          <div class="textContainer">
            <strong>{{ item.nome }}</strong>
            <span class="descricao">{{ item.descricao }}</span>
            <span class="price">
              R$ {{ (item.preco * item.quantidade).toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Quantidade -->
        <div class="quantidadeContainer d-flex align-center">
          <v-icon
            size="small"
            :color="item.quantidade === 1 ? 'error' : 'grey-darken-1'"
            @click="handleDiminuir(item)"
          >
            {{ item.quantidade === 1 ? 'mdi-delete-outline' : 'mdi-minus' }}
          </v-icon>

          <span style="font-weight:bold;">
            {{ item.quantidade }}
          </span>

          <v-icon
            size="small"
            color="grey-darken-3"
            @click="$emit('aumentar', item)"
          >
            mdi-plus
          </v-icon>
        </div>
      </div>
    </v-card>

    <!-- Dialog -->
    <v-dialog v-model="dialogExcluir" max-width="360" persistent class="dialog">
      <v-card class="pa-4 text-center" style="border-radius: 16px;">
        <v-card-title class="text-h6 font-weight-bold">
          Excluir {{ produtoSelecionado?.nome }}?
        </v-card-title>

        <v-card-text class="text-body-2">
          Essa ação removerá o produto do carrinho.
          Deseja realmente continuar?
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn variant="outlined" @click="cancelarExclusao">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="confirmarExclusao">
            Sim, excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-btn
      variant="text"
      block
      color="secondary"
      class="mt-4 py-6 font-weight-bold"
      @click="$emit('adicionar-mais')"
    >
      <v-icon start>mdi-plus</v-icon>
      Adicionar mais itens
    </v-btn>
  </div>
</template>

<script lang="ts">
import type { ProdutoEmCarrinho } from '@/services/carrinhoService/CarrinhoModel';
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'ListaProdutos',

  props: {
    carrinho: {
      type: Array as PropType<ProdutoEmCarrinho[]>,
      required: true,
    },
  },

  emits: ['aumentar', 'diminuir', 'confirmar-exclusao', 'adicionar-mais'],

  data() {
    return {
      dialogExcluir: false,
      produtoSelecionado: null as ProdutoEmCarrinho | null,
    }
  },

  methods: {
    handleDiminuir(item: ProdutoEmCarrinho) {
      if (item.quantidade === 1) {
        this.produtoSelecionado = item
        this.dialogExcluir = true
        return
      }

      this.$emit('diminuir', item)
    },

    confirmarExclusao() {
      if (!this.produtoSelecionado) return

      this.$emit('confirmar-exclusao', this.produtoSelecionado)
      this.dialogExcluir = false
      this.produtoSelecionado = null
    },

    cancelarExclusao() {
      this.dialogExcluir = false
      this.produtoSelecionado = null
    },
  },
})
</script>

<style scoped>
    .listaProdutos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Card de item com borda fina e arredondada */
.item-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  max-width: 100% !important;
  overflow: hidden !important;
  margin-bottom: 16px !important;
  /* Aumenta espaçamento entre cards */
}



.itemContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  gap: 15px;
}

.descricao {
  font-size: small;
  padding-top: 5px;
  padding-bottom: 10px;
}

.price {
  font-weight: 600;
  font-size: 13px;
  color: rgb(56, 56, 56);
}

/* Seletor de quantidade no estilo cinza claro da Goomer */
.quantidadeContainer {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 2px;
  height: 30px;
  gap: 10px
}

.textContainer {
  display: flex;
  flex-direction: column;
}

.goomer-radio :deep(.v-selection-control) {
  width: 100%;
  justify-content: space-between;
  flex-direction: row-reverse;
}

.v-btn {
  box-shadow: none !important;
}

.v-container {
  padding-bottom: 100px !important;
}
.dialog {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>