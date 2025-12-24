<template>
  <div class="home-page">
    <HeaderLoja />
    <div class="categories-wrapper">
      <div
        v-for="(categoria, index) in categories"
        :key="index"
        class="categoria-item"
        :class="{ active: selectedcategoria === categoria.id }"
        @click="scrollToCategory(categoria.id)"
      >
        {{ categoria.label }}
      </div>
    </div>
    <Cardapio :products="products" @category-visible="selectedcategoria = $event" />
  </div>

  <v-footer app class="white--text" style="background-color: #fff">
    <v-container class="pa-0">
      <v-row no-gutters justify="space-around" align="center">
        <!-- Ícone Início -->
        <v-col class="text-center">
          <v-icon color="black">mdi-home</v-icon>
          <div class="text-caption" style="color: black">Início</div>
        </v-col>

        <!-- Ícone Pedidos -->
        <v-col class="text-center">
          <v-icon color="black">mdi-receipt-text</v-icon>
          <div class="text-caption" style="color: black">Pedidos</div>
        </v-col>

        <!-- Ícone Perfil -->
        <v-col class="text-center">
          <v-icon color="black">mdi-account</v-icon>
          <div class="text-caption" style="color: black">Perfil</div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
import Cardapio from '@/components/usuario/Cardapio.vue'
import HeaderLoja from '@/components/usuario/HeaderLoja.vue'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { Product } from '@/services/Produto'
import { ProdutosService } from '@/services/produtosService/ProdutosService'

export default {
  name: 'HomeCardapio',
  data() {
    return {
      products: [] as Product[],
      selectedcategoria: undefined as string | undefined,
      slug: '',
    }
  },
  components: {
    Cardapio,
    HeaderLoja,
  },

  async mounted() {},

  computed: {
    categories() {
      const categorias = new Set<string>()

      this.products.forEach((product) => {
        if (product.categoria) {
          categorias.add(product.categoria)
        }
      })

      return Array.from(categorias).map((categoria) => ({
        id: categoria,
        label: categoria,
      }))
    },
  },

  watch: {
    // Observa mudanças na query da URL
    '$route.query.estabelecimento': {
      async handler(newSlug) {
        if (newSlug) {
          await this.carregarDadosLoja(newSlug as string)
        }
      },
      immediate: true, // Isso substitui a necessidade de chamar no mounted()
    },

    categories(newCategories) {
      if (newCategories.length && !this.selectedcategoria) {
        this.selectedcategoria = newCategories[0].id
      }
    },
  },

  methods: {
    async carregarDadosLoja(slug: string) {
      try {
        const lojistaService = new LojistaService()
        const lojistaId = await lojistaService.getId_aPartirDaSlug(slug)

        if (!lojistaId) {
          throw new Error('Nenhuma lanchonete encontrada com o nome: ' + slug)
        }

        await this.getProducts(lojistaId)
      } catch (e: any) {
        alert(e.message)
      }
    },

    scrollToCategory(categoriaId: string) {
      const el = document.getElementById(`categoria-${categoriaId}`)

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }

      this.selectedcategoria = categoriaId
    },
    async getProducts(lojaId: string): Promise<void> {
      try {
        const produtosService = new ProdutosService(lojaId)
        const data = await produtosService.getLista()
        this.products = data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          categoria: item.categoria,
          imagemUr: item.imagemUr,
        }))
      } catch (error: any) {
        console.error(error)
        alert(error.message)
      }
    },
  },
}
</script>

<style scoped>
.home-page {
  margin-top: 15px;
  background-color: rgb(235, 235, 235);
}
.categories-wrapper {
  position: sticky;
  top: 0.5px;
  z-index: 100;
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background-color: #ffffff;
  overflow-x: auto;
  border-bottom: 1px solid #e5e7eb;
}

/* Item */
.categoria-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: #f3f4f6;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover */
.categoria-item:hover {
  background-color: #e5e7eb;
}

/* Ativo */
.categoria-item.active {
  background-color: #2bb673;
  color: #ffffff;
}

.categoria-item.active v-icon {
  color: #ffffff;
}

/* Remove scrollbar visual (opcional) */
.categories-wrapper::-webkit-scrollbar {
  display: none;
}
</style>
