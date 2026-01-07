<template>
  <v-container v-if="produto" fluid class="pa-0 container-produto">
    <v-row class="pb-4">
      <!-- Imagem do Produto -->
      <v-col cols="12" class="pa-0">
        <img :src="produto?.imagemUrl" class="imagem-produto" />
      </v-col>

      <!-- Nome e Descrição -->
      <v-col cols="12" class="mt-4 px-4 text-wrap">
        <h2 class="titulo-produto">
          {{ produto?.nome }}
        </h2>
        <p class="descricao-produto">
          {{ produto?.descricao }}
        </p>
      </v-col>

      <!-- Preço -->
      <v-col>
        <h3 class="d-flex align-center" style="color: green; font-weight: bold; margin: 0">
          <span v-if="produto?.preco != null"> R$ {{ Number(produto.preco).toFixed(2) }} </span>
          <span v-else>R$</span>
        </h3>
      </v-col>

      <!-- Colocar os diferentes ifs, dependendo do
       tipo de informação que tem no produto -->

      <!-- Observação -->
      <v-col cols="12">
        <div class="d-flex align-center mb-2">
          <h3 style="font-weight: 600; color: #1f1f1f">
            <v-icon color="primary" class="mr-2">mdi-chat-outline</v-icon> Alguma observação?
          </h3>
        </div>

        <div class="observacao-wrapper">
          <textarea
            v-model="observacao"
            placeholder="Digite aqui (opcional)"
            maxlength="140"
            rows="2"
          ></textarea>
        </div>
      </v-col>
      <!-- ✅ BARRA FIXA FORA DO v-row -->
      <div class="barra-fixa">
        <div class="controle-quantidade">
          <v-icon
            small
            class="icone-quantidade"
            @click="quantidade--"
            :class="{ desabilitado: quantidade <= 1 }"
          >
            mdi-minus
          </v-icon>

          <span class="quantidade">{{ quantidade }}</span>

          <v-icon small class="icone-quantidade" @click="quantidade++"> mdi-plus </v-icon>
        </div>

        <v-btn color="primary" outlined small class="btn-adicionar" @click="adicionarAoCarrinho()">
          <v-icon left small>mdi-cart-outline</v-icon>
          Adicionar
          <span class="ml-1" style="font-weight: normal" v-if="precoTotal != 'NaN'">
            R$ {{ precoTotal }}
          </span>
          <span v-else>R$</span>
        </v-btn>
      </div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import type { Carrinho } from '@/services/carrinhoService/CarrinhoModel'
import { CarrinhoService } from '@/services/carrinhoService/CarrinhoService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'

export default {
  data() {
    return {
      quantidade: 1,
      produto: {} as ProdutoModel,
      observacao: '',
      carrinho: [] as Carrinho[],
    }
  },

  computed: {
    precoTotal() {
      return (this.produto.preco * this.quantidade).toFixed(2)
    },
  },

  async mounted() {
    const produtosService = new ProdutosService(this.$route.query.id as string)
    this.produto = await produtosService.getById(this.$route.params.id as string)
  },
  methods: {
    async adicionarAoCarrinho() {
      new CarrinhoService().adicionarProduto(this.produto, this.quantidade)
      this.$router.push({
        name: 'cardapio',
        params: { id: this.produto.id },
        query: {
          estabelecimento: this.$route.query.estabelecimento,
          id: this.$route.query.id,
        },
      })
    },
  },
}
</script>

<style scoped>
.container-produto {
  width: 93%;
  min-height: 100vh;
  padding-bottom: 110px;
  box-sizing: border-box;
  background-color: rgb(255, 255, 255);
}

.observacao-wrapper textarea {
  width: 93%;
  border: none;
  outline: none;
  resize: none;
  background-color: #f9f9f9;
  border-radius: 10px;
  border: 1px solid rgb(216, 216, 216);
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  line-height: 1.4;
}

.imagem-produto {
  width: 100%;
  max-height: 240px;
  object-fit: cover;
}

.barra-fixa {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 55px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background-color: #fcfcfc;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.12);
  z-index: 3000;
  border-radius: 12px 12px 0 0;
}

.controle-quantidade {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #ff0303;
  padding: 4px 8px;
  border-radius: 15px;
}

.quantidade {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
  font-size: 0.95rem;
}

.btn-adicionar {
  text-transform: none;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.95rem;
}

.desabilitado {
  opacity: 0.4;
  pointer-events: none;
}
</style>
