<template>
  <v-container :class="$style.menuContainer">
    <div
      v-for="categoria in groupedProducts"
      :key="categoria.name"
      :id="`categoria-${categoria.name}`"
      :ref="el => setCategoryRef(categoria.name, el as HTMLElement | null)"
      class="categoria-section"
    >

      <!-- Título da categoria -->
      <div :class="$style.categoriaTitle">
        {{ categoria.name }}
      </div>

      <!-- Produtos -->
      <div
        v-for="product in categoria.items"
        :key="product.id"
        :class="$style.productRow"
        @click="$router.push({ name: 'detailProduct', params: { id: product.id } })"
      >
        <div :class="$style.productInfo">
          <div :class="$style.productName">
            {{ product.nome }}
          </div>

          <div :class="$style.productDescricao">
            {{ product.descricao }}
          </div>

          <div :class="$style.productPreco">
            <strong style="color: #2bb673">R$ {{ Number(product.preco).toFixed(2) }}</strong>
          </div>
        </div>
        <div v-if="product.imagemUrl" :class="$style.productImagemUrl">
          <v-img :src="product.imagemUrl" width="72" height="72" class="rounded" />
        </div>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import type { Product } from '@/services/Produto'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel';

export default {
  name: 'CardapioProdutos',

  //eu marquei esse Product como depreciado, pois ele tá errado mesmo
  //usa ProdutoModel ao invés dele
  props: {
    products: {
      type: Array as () => ProdutoModel[],
      required: true,
    },
  },

  emits: ['category-visible'],

  data() {
    return {
      observer: null as IntersectionObserver | null,
      categoryRefs: {} as Record<string, HTMLElement>,
    }
  },

  mounted() {
    this.initObserver()
  },

  beforeUnmount() {
    this.observer?.disconnect()
  },

  methods: {
    setCategoryRef(name: string, el: HTMLElement | null) {
      if (el && this.observer) {
        this.categoryRefs[name] = el
        this.observer.observe(el)
      }
    },

    initObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const categoria = entry.target.id.replace('categoria-', '')
              this.$emit('category-visible', categoria)
            }
          })
        },
        {
          rootMargin: '-40% 0px -50% 0px',
          threshold: 0,
        }
      )
    },
  },

  computed: {
    groupedProducts(): { name: string; items: ProdutoModel[] }[] {
      const groups: Record<string, ProdutoModel[]> = {}

      console.log(this.products)
      this.products.forEach((product) => {
        if (!groups[product.categoriaId]) {
          groups[product.categoriaId] = []
        }
        groups[product.categoriaId]!.push(product)
      })

      return Object.keys(groups).map((key) => ({
        name: key,
        items: groups[key]!,
      }))
    },
  },
}
</script>
<style module src="./Cardapio.module.css"></style>
