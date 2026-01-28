<template>
  <div class="home-page">
    <HeaderLoja
      v-if="lojista"
      :lojista="lojista"
      :categorias="categorias"
      :selectedcategoria="selectedcategoria"
      :onHeaderClick="goToSobreLoja"
      :onCategoriaSelecionada="scrollToCategory"
      :estaAberta="estaAberta"
    />
    <Cardapio
      :products="products"
      :categorias="categorias"
      :onProductClick="goToDetalhesProduto"
      :onCategoryVisible="onCategoryVisible"
    />
  </div>
  <div class="carrinho-fixo" v-if="qtdItensCarrinho > 0" @click="irParaCarrinho()">
    <div class="carrinho-conteudo">
      <div class="d-flex align-center">
        <v-badge :content="qtdItensCarrinho" overlap bordered>
          <v-icon size="26">mdi-cart</v-icon>
        </v-badge>
      </div>

      <span class="text-button text-none"> Ver carrinho </span>
      <strong> R$ {{ totalCarrinho.toFixed(2).replace('.', ',') }} </strong>
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
import { useLojistaStore } from '@/stores/lojista'

export default {
  name: 'HomeCardapio',
  data() {
    return {
      qtdItensCarrinho: 0,
      products: [] as ProdutoModel[],
      categorias: [] as CategoriaModel[],
      selectedcategoria: '' as string,
      slug: '',
      lojista: null as LojistaModel | null,
      totalCarrinho: 0,
    }
  },
  components: {
    Cardapio,
    HeaderLoja,
  },

  setup() {
    const lojistaStore = useLojistaStore()

    return {
      useLojistaStore: () => lojistaStore,
    }
  },
  async mounted() {
    // Tenta obter o ID do lojista do store primeiro, senão busca pelo slug
    const lojistaStore = this.useLojistaStore()
    let lojistaId = lojistaStore.lojistaId

    if (!lojistaId) {
      // Se não há lojista no store, busca ID pelo slug da URL
      const estabelecimentoSlug = this.$route.query.estabelecimento as string
      if (estabelecimentoSlug) {
        const idFromSlug = await this.getLojistaIdPorSlug(estabelecimentoSlug)
        if (idFromSlug) {
          lojistaId = idFromSlug
        }
      }
    }

    if (lojistaId) {
      await this.carregarDadosLoja(lojistaId)
    }

    this.atualizarDadosCarrinho()

    // Escuta atualizações do carrinho
    window.addEventListener('carrinho-atualizado', this.atualizarDadosCarrinho)
  },

  beforeUnmount() {
    // Remove o listener ao destruir o componente
    window.removeEventListener('carrinho-atualizado', this.atualizarDadosCarrinho)
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

  computed: {
    diaAtual(): string {
      const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
      return dias[new Date().getDay()]!
    },

    estaAberta() {
      if (!this.lojista || !this.lojista.horarioFuncionamento) return false

      const hoje = this.lojista.horarioFuncionamento[
        this.diaAtual as keyof typeof this.lojista.horarioFuncionamento
      ] as any

      if (!hoje) return false

      const agora = new Date()
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

      const [hA, mA] = hoje.abertura.split(':')
      const [hF, mF] = hoje.fechamento.split(':')

      const abertura = Number(hA) * 60 + Number(mA)
      const fechamento = Number(hF) * 60 + Number(mF)

      return minutosAgora >= abertura && minutosAgora <= fechamento
    },
  },

  methods: {
    atualizarDadosCarrinho() {
      this.totalCarrinho = new CarrinhoService().calcularTotal()
      this.qtdItensCarrinho = new CarrinhoService().quantidadeItens()
    },

    async getLojistaIdPorSlug(slug: string): Promise<string | null> {
      try {
        logger.info('buscando lojista a partir da slug (nome da lanchonete)', {
          slug: slug,
        })
        const lojistaService = new LojistaService()
        return await lojistaService.getId_aPartirDaSlug(slug)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar lojista'
        throw new Error(errorMessage)
      }
    },

    async carregarDadosLoja(lojistaId: string) {
      try {
        const listaCategoria = await new CategoriaService(lojistaId).getLista()
        logger.info('id do lojista recuperado com sucesso', {
          id: lojistaId,
          categorias: listaCategoria,
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
        const y = el.getBoundingClientRect().top + window.pageYOffset - offset

        window.scrollTo({
          top: y,
          behavior: 'smooth',
        })
      }

      this.selectedcategoria = categoriaId
    },

    onCategoryVisible(categoriaId: string) {
      this.selectedcategoria = categoriaId
    },

    goToSobreLoja() {
      this.$router.push({
        name: 'sobre',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
        },
      })
    },

    goToDetalhesProduto(product: ProdutoModel) {
      this.$router.push({
        name: 'detalhes',
        params: { id: product.id },
        query: {
          estabelecimento: this.$route.query.estabelecimento,
        },
      })
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar lojista'
        throw new Error(errorMessage)
      }
    },
    async getLojista(lojaId: string) {
      try {
        const lojistaService = new LojistaService()
        return await lojistaService.getData(lojaId)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar lojista'
        throw new Error(errorMessage)
      }
    },
    irParaCarrinho() {
      this.$router.push({
        name: 'carrinho',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
        },
      })
    },
  },
}
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
