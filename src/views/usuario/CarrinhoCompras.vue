<template>
  <div>
    <v-toolbar flat color="white" class="border-b">
      <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="text-body-1 font-weight-bold text-center">Meu pedido</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <br />
    <div class="listaProdutos">
      <v-card v-for="(item, index) in carrinho" :key="item.id" flat outlined class="item-card">
        <div class="itemContainer">
          <!-- Imagem -->
          <div class="itemContainer">
            <v-avatar size="40" rounded="" class="mr-3 flex-shrink-0">
              <v-img :src="item.imagemUrl" cover></v-img>
            </v-avatar>
            <!-- Texto -->
            <div class="textContainer">
              <strong>
                {{ item.nome }}
              </strong>
              <span class="descricao">{{ item.descricao }}</span>
              <span class="price">
                R$ {{ (item.preco * item.quantidade).toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Stepper -->
          <div class="quantidadeContainer d-flex align-center">
            <v-icon size="small" :disabled="dialogExcluir"
              :color="Number(item.quantidade) === 1 ? 'error' : 'grey-darken-1'" @click="diminuirQuantidade(item)">
              {{ Number(item.quantidade) <= 1 ? 'mdi-delete-outline' : 'mdi-minus' }} </v-icon>
                <span class="px-2 text-body-2 font-weight-bold">
                  {{ item.quantidade }}
                </span>
                <v-icon size="small" color="grey-darken-3" @click="aumentarQuantidade(item)">mdi-plus</v-icon>
          </div>
        </div>
      </v-card>

      <v-btn variant="text" block color="secondary" class="text-none mt-4 font-weight-bold py-6" rounded="lg"
        @click="redirecionaAoCardapio()">
        <v-icon start>mdi-plus</v-icon>
        Adicionar mais itens
      </v-btn>

      <br />
      <v-dialog v-model="dialogExcluir" max-width="360" persistent class="dialog">
        <v-card class="pa-4 text-center" elevation="10" style="border-radius: 16px;">

          <v-card-title class="justify-center text-h6 font-weight-bold" style="color: #1f1f1f;">
            Excluir {{ produtoSelecionado?.nome }}?
          </v-card-title>
          <v-card-text class="text-body-2" style="color: #555;">
            Essa ação removerá o produto do carrinho.
            Deseja realmente continuar?
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-btn variant="outlined" color="secondary" class="px-6" @click="dialogExcluir = false">
              Cancelar
            </v-btn>
            <v-btn color="error" variant="flat" class="px-6" @click="excluirProduto">
              Sim, excluir
            </v-btn>

          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <div class="formaEntregaContainer">
      <h4>Como deseja receber seu pedido?</h4>

      <div class="tipoEntrega">
        <v-btn-toggle v-model="tipoEntrega" mandatory color="secondary">
          <v-btn value="entrega" class="flex-1" :variant="tipoEntrega === 'entrega' ? 'flat' : 'outlined'">
            <div class="d-flex flex-column align-center">
              <v-icon size="24" class="mb-1">mdi-moped</v-icon>
              <span>Entrega</span>
            </div>
          </v-btn>

          <v-btn value="retirada" class="flex-1" :variant="tipoEntrega === 'retirada' ? 'flat' : 'outlined'">
            <div class="d-flex flex-column align-center">
              <v-icon size="24" class="mb-1">mdi-store-outline</v-icon>
              <span>Retirada</span>
            </div>
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <div v-if="tipoEntrega === 'entrega'" class="mt-4" style="margin-left: 5%; margin-right: 5%;">
      <br/>
      <div class="headerInline">
        <h4 class="text-subtitle-1 font-weight-medium mb-0">Qual o seu endereço?</h4>
        <span class="text-error"
          style="letter-spacing: 1px; opacity: 0.8; font-size: 11px; font-weight:bold">
          * Obrigatório
        </span>
      </div>

      <div class="cursor-pointer text-secondary item-card linkEndereco" @click="dialogEndereco = true"
        style="gap: 4px;">
        <v-icon size="small" icon="mdi-map-marker-outline"></v-icon>
        <span style="text-decoration: underline; font-size: 0.9rem; font-weight: 500;">
          Selecionar o endereço de entrega
        </span>
      </div>
    </div>

    <v-dialog v-model="dialogEndereco" fullscreen transition="dialog-bottom-transition">
      <v-card>
        <!-- TOPO (como header de página) -->
        <v-toolbar color="secondary" dark>
          <v-btn icon @click="dialogEndereco = false">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <v-toolbar-title>Endereço de Entrega</v-toolbar-title>

          <v-spacer />
        </v-toolbar>

        <!-- CONTEÚDO -->
        <v-card-text class="pa-4">
          <p class="mb-4">
            Selecione ou cadastre um endereço de entrega.
          </p>

          <!-- Exemplo -->
          <v-list>
            <v-list-item>
              <v-list-item-title>
                Rua Exemplo, 123 - Centro
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- AÇÕES FIXAS NO RODAPÉ -->
        <v-card-actions class="pa-4">
          <v-btn block color="secondary" size="large" @click="dialogEndereco = false">
            Confirmar endereço
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <div class="btnFinalizar" @click="finalizarPedido">
      <span>Finalizar pedido <v-icon>mdi-arrow-right</v-icon></span>
      <span class="text-h6 font-weight-bold">TOTAL: R$ {{ precoTotalCarrinho.toFixed(2) }}</span>
    </div>
  </div>
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
      dialogExcluir: false,
      produtoSelecionado: null as ProdutoEmCarrinho | null,
      tipoEntrega: null,
      dialogEndereco: false,
      erroEntrega: false,
    }
  },

  computed: {
    precoTotalCarrinho() {
      return this.carrinho.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
      )
    }
  },

  mounted() {
    this.atualizarCarrinho()
  },

  methods: {
    validarEntrega() {
      if (!this.tipoEntrega) {
        this.erroEntrega = true
        return
      }
      this.erroEntrega = false
      // continua o fluxo
    },
    atualizarCarrinho() {
      this.carrinho = this.carrinhoService.listar()
    },

    aumentarQuantidade(item: ProdutoEmCarrinho) {
      this.carrinhoService.adicionarProduto(item)
      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },

    diminuirQuantidade(item: ProdutoEmCarrinho) {
      if (item.quantidade === 1) {
        this.produtoSelecionado = item
        this.dialogExcluir = true
        return
      }

      item.quantidade--
      localStorage.setItem(
        'produtos_json',
        JSON.stringify(this.carrinho)
      )

      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },
    excluirProduto() {
      if (!this.produtoSelecionado) return

      this.carrinhoService.removerProduto(this.produtoSelecionado.id)

      this.dialogExcluir = false
      this.produtoSelecionado = null

      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },
    redirecionaAoCardapio() {
      this.$router.push({
        name: 'cardapio',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
          id: this.$route.query.id
        }
      })
    },
    finalizarPedido() {

    }
  }
}
</script>


<style scoped>
:deep(.v-toolbar),
:deep(.v-toolbar__content) {
  background-color: #ffffff !important;
}

.listaProdutos {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Card de item com borda fina e arredondada */
.item-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
}

.dialog {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

.btnFinalizar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  font-weight: 600;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  z-index: 2;
  background-color: rgb(0, 145, 19);
}

.formaEntregaContainer {
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-left: 5%;
  align-items: center;
  background-color: #fbfbfb;
  padding-bottom: 15px;
  border-radius: 5px;
  border: 1px solid rgb(223, 223, 223)
}

.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s;
}

.cursor-pointer:hover {
  opacity: 0.7;
}
.headerInline{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.linkEndereco{
  padding: 10px;
}
</style>