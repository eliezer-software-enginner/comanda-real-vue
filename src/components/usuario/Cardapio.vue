<template>
  <v-container :class="$style.menuContainer">
    <div v-for="categoria in groupedProducts" :key="categoria.name">

      <!-- Título da categoria -->
      <div :class="$style.categoriaTitle">
        {{ categoria.name }}
      </div>

      <!-- Produtos -->
      <div v-for="product in categoria.items" :key="product.id" :class="$style.productRow"
        @click="$router.push({ name: 'detailProduct', params: { id: product.id } })">
        <div :class="$style.productInfo">
          <div :class="$style.productName">
            {{ product.nome }}
          </div>

          <div :class="$style.productDescricao">
            {{ product.descricao }}
          </div>

          <div :class="$style.productPreco">
            <strong style="color: #2bb673;">R$ {{ product.preco.toFixed(2) }}</strong>
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
import type { Product } from '@/services/Produto';
import { ProdutosService } from '@/services/produtosService/ProdutosService';

export default {
  name: "CardapioProdutos",
  data() {
    return {
      products: [] as Product[],
    };
  },
  computed: {
    groupedProducts(): { name: string; items: Product[] }[] {
      const groups: Record<string, Product[]> = {}

      this.products.forEach((product) => {
        if (!groups[product.categoria]) {
          groups[product.categoria] = []
        }
        groups[product.categoria]!.push(product)
      })

      return Object.keys(groups).map((key) => ({
        name: key,
        items: groups[key]!,
      }))
    },
  },

  mounted() {
    this.getProducts(this.$route.params.id as string)
  },
  methods: {
    async getProducts(lojaId: string): Promise<void> {
      try {
        const produtosService = new ProdutosService(lojaId)
        const data = await produtosService.getLista(lojaId)
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

};
</script>
<style module src='./Cardapio.module.css'></style>
