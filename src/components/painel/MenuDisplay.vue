<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'

import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { useRoute } from 'vue-router'
import Cardapio from '../usuario/Cardapio.vue'
import HeaderLoja from '../usuario/HeaderLoja.vue'

// const styles = useCssModule()

const route = useRoute()

const lojistaId = computed(() => route.params.id as string)
const lojistaService = new LojistaService()
const categoriaService = new CategoriaService(lojistaId.value)
const produtoService = new ProdutosService(lojistaId.value)

const lojista: Ref<LojistaModel | null> = ref(null)
const categorias: Ref<CategoriaModel[]> = ref([])
const produtos: Ref<ProdutoModel[]> = ref([])
const selectedcategoria = ref('')

interface MenuDisplayProps {
  cardapio: ProdutoModel[]
  isPreview?: boolean
}
const props = withDefaults(defineProps<MenuDisplayProps>(), {
  isPreview: false,
})

onMounted(async () => {
  lojista.value = await lojistaService.getById(lojistaId.value)
  categorias.value = await categoriaService.getLista()
  selectedcategoria.value = categorias.value[0]?.id!

  produtos.value = await produtoService.getLista()
})
</script>

<template>
  <div class="container">
    <HeaderLoja v-if="lojista" :lojista="lojista" />
    <div class="categories-wrapper">
      <div
        v-for="(categoria, index) in categorias"
        :key="index"
        class="categoria-item"
        :class="{ active: selectedcategoria === categoria.id }"
      >
        {{ categoria.nome }}
      </div>
    </div>
    <Cardapio
      :products="produtos"
      :categorias="categorias"
      @category-visible="selectedcategoria = $event"
    />
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f9fafb;
  padding-bottom: 6rem;
  position: relative;
}
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
