<template>
  <v-container :class="$style.menuContainer">
    <div
      v-for="grupo in agruparProdutos"
      :key="grupo.categoriaId"
      :id="`categoria-${grupo.categoriaId}`"
      :ref="(el) => setCategoryRef(grupo.categoriaId, el as HTMLElement | null)"
      class="categoria-section"
    >
      <!-- Título da categoria -->
      <div :class="$style.categoriaTitle">
        {{ grupo.categoriaNome }}
      </div>

      <div v-if="!grupo.produtos || grupo.produtos.length === 0" :class="$style.semProdutos">
        Nenhum produto disponível nesta categoria.
      </div>
      <div
        v-else
        v-for="product in grupo.produtos"
        :key="product.id"
        :class="$style.productRow"
        @click="onProductClick(product)"
      >
        <div :class="$style.productInfo">
          <div :class="$style.productName">
            {{ product.nome }}
          </div>

          <div :class="$style.productDescricao">
            {{ product.descricao }}
          </div>

          <div :class="$style.productPreco">
            <strong style="color: #2bb673"> R$ {{ Number(product.preco).toFixed(2) }} </strong>
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
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import type { PropType } from 'vue'

type Grupo = {
  categoriaId: string
  categoriaNome: string
  produtos: ProdutoModel[]
}

export default {
  name: 'CardapioProdutos',
  props: {
    products: {
      type: Array as PropType<ProdutoModel[]>,
      required: true,
    },
    categorias: {
      type: Array as PropType<CategoriaModel[]>,
      required: true,
    },
    onProductClick: {
      type: Function as PropType<(product: ProdutoModel) => void>,
      default: () => {},
    },
    onCategoryVisible: {
      type: Function as PropType<(categoriaId: string) => void>,
      default: undefined,
    },
  },

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
              if (this.onCategoryVisible) {
                this.onCategoryVisible(categoria)
              }
            }
          })
        },
        {
          rootMargin: '-40% 0px -50% 0px',
          threshold: 0,
        },
      )
    },
  },

  computed: {
    agruparProdutos(): Grupo[] {
      const grupos: Grupo[] = []
      for (let categoria of this.categorias) {
        const categoriaId = categoria.id

        const produtosFiltrados = this.products.filter((p) => p.categoriaId === categoriaId)
        grupos.push({
          categoriaId: categoriaId,
          categoriaNome: categoria.nome,
          produtos: produtosFiltrados,
        })
      }
      return grupos
    },
  },
}
</script>
<style module src="./Cardapio.module.css"></style>
