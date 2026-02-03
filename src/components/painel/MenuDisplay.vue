<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'

import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { useLojistaStore } from '../../stores/lojista'
import Cardapio from '../usuario/Cardapio.vue'
import HeaderLoja from '../usuario/HeaderLoja.vue'

// const styles = useCssModule()

const lojistaStore = useLojistaStore()

const lojista = lojistaStore.lojista!
const lojistaId = lojistaStore.lojistaId!

const categoriaService = new CategoriaService(lojistaId)
const produtoService = new ProdutosService(lojistaId)

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
  categorias.value = await categoriaService.getLista()
  selectedcategoria.value = categorias.value[0]?.id!

  produtos.value = await produtoService.getLista()
})

const diaAtual = computed(() => {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  return dias[new Date().getDay()]!
})

const estaAberta = computed(() => {
  const hoje =
    lojista.horarioFuncionamento?.[diaAtual.value as keyof typeof lojista.horarioFuncionamento]

  if (!hoje) return false

  const agora = new Date()
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

  const [hA, mA] = hoje.abertura.split(':')
  const [hF, mF] = hoje.fechamento.split(':')

  const abertura = Number(hA) * 60 + Number(mA)
  const fechamento = Number(hF) * 60 + Number(mF)

  return minutosAgora >= abertura && minutosAgora <= fechamento
})

const onCategoryVisible = (categoriaId: string) => {
  selectedcategoria.value = categoriaId
}
</script>

<template>
  <div class="container">
    <HeaderLoja
      v-if="lojista"
      :lojista="lojista"
      :categorias="categorias"
      :selectedcategoria="selectedcategoria"
      :onHeaderClick="() => {}"
      :estaAberta="estaAberta"
    />

    <Cardapio
      :products="produtos"
      :categorias="categorias"
      :onProductClick="() => {}"
      :onCategoryVisible="onCategoryVisible"
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
