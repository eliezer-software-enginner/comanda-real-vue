<template>
  <div class="home-page">
    <HeaderLoja v-if="lojista" :lojista="lojista" :categorias="categorias" :selectedcategoria="selectedcategoria"
      @categoria-selecionada="scrollToCategory" />
    <Cardapio :products="products" :categorias="categorias" @category-visible="selectedcategoria = $event" />
  </div>
  <div class="carrinho-fixo" v-if="qtdItensCarrinho > 0" @click="irParaCarrinho()"">
    <div class=" carrinho-conteudo">
    <div class="d-flex align-center">
      <v-badge :content="qtdItensCarrinho" overlap bordered>
        <v-icon size="26">mdi-cart</v-icon>
      </v-badge>
    </div>


    <span class="text-button text-none">
      Ver carrinho
    </span>
    <strong>
      R$ {{ totalCarrinho.toFixed(2).replace('.', ',') }}
    </strong>
  </div>
  </div>

  <!-- <v-footer app class="white--text" style="background-color: #fff">
    <v-container class="pa-0">
      <v-row no-gutters justify="space-around" align="center">
        <v-col class="text-center">
          <v-icon color="black">mdi-home</v-icon>
          <div class="text-caption" style="color: black">Início</div>
        </v-col>

        <v-col class="text-center">
          <v-icon color="black">mdi-receipt-text</v-icon>
          <div class="text-caption" style="color: black">Pedidos</div>
        </v-col>

        <v-col class="text-center">
          <v-icon color="black">mdi-account</v-icon>
          <div class="text-caption" style="color: black">Perfil</div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer> -->
</template>

<script lang="ts">
import Cardapio from '@/components/usuario/Cardapio.vue'
import HeaderLoja from '@/components/usuario/HeaderLoja.vue'
import logger from '@/plugins/logs'
import { CarrinhoService } from '@/services/carrinhoService/CarrinhoService'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'

export default {
  name: 'HomeCardapio',
  data() {
    return {
      qtdItensCarrinho:  0,
      products: [] as ProdutoModel[],
      categorias: [] as CategoriaModel[],
      selectedcategoria: '' as string,
      slug: '',
      lojista: null as LojistaModel | null,
      totalCarrinho: 0
    }
  },
  components: {
    Cardapio,
    HeaderLoja,
  },
  async mounted() {
    await this.carregarDadosLoja(this.$route.query.id as string)
    this.totalCarrinho = new CarrinhoService().calcularTotal()
    this.qtdItensCarrinho = new CarrinhoService().quantidadeItens()
  },

  // watch: {
  //   // Observa mudanças na query da URL
  //   '$route.query.estabelecimento': {
  //     async handler(newSlug) {
  //       if (newSlug) {
  //         await this.carregarDadosLoja(newSlug as string)
  //       }
  //     },
  //     immediate: true, // Isso substitui a necessidade de chamar no mounted()
  //   },

  //   categories(newCategories) {
  //     if (newCategories.length && !this.selectedcategoria) {
  //       this.selectedcategoria = newCategories[0].id
  //     }
  //   },
  // },

  methods: {
    async carregarDadosLoja(lojistaId: string) {
      try {
        const listaCategoria = await new CategoriaService(lojistaId).getLista()
        logger.info("id do lojista recuperado com sucesso", {
          id: lojistaId,
          categorias: listaCategoria
        })

        this.categorias = listaCategoria
        this.lojista = await this.getLojista(lojistaId)
        this.products = await this.getProducts(lojistaId)
      } catch (e: any) {
        alert(e.message)
      }
    },

    scrollToCategory(categoriaId: string) {
      const el = document.getElementById(`categoria-${categoriaId}`)
      const offset = 56 

      if (el) {
        const y =
          el.getBoundingClientRect().top + window.pageYOffset - offset

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        })
      }

      this.selectedcategoria = categoriaId
    },

    //tipagem em retorno de função é opcional tá
    //a categoria no produto deve ser o mesmo nome
    //  das categorias pro scrol funcionar
    //tá, categoria tem o campo "nome" é só pegar ele e já deve dar
    //eu acho ;)
    async getProducts(lojaId: string): Promise<ProdutoModel[]> {
      try {
        const produtosService = new ProdutosService(lojaId)
        return await produtosService.getLista()

      } catch (error: any) {
        throw new Error(error.message)
      }
    },
    async getLojista(lojaId: string) {
      try {
        const lojistaService = new LojistaService()
        return await lojistaService.getData(lojaId)
      } catch (error: any) {
        throw new Error(error.message)
      }
    },
    irParaCarrinho() {
      this.$router.push({
        name: 'carrinho',
        //,params: { id: product.id },
        query: {
          estabelecimento: this.$route.query.estabelecimento,
          id: this.$route.query.id
        }
      })
    }
  }
};
</script>

<style scoped>
.home-page {
  margin-top: 15px;
  background-color: rgb(235, 235, 235);
}

.carrinho-fixo {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background-color: #1c8a54;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.carrinho-conteudo {
  width: 100%;
  max-width: 600px;
  padding: 0 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
