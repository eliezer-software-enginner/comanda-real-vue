<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
// Importações de tipagem e serviços (assumindo que o caminho é src/services/dbService, etc.)
import { getCardapio } from '@/services/CardapioService'
import type { Cardapio } from '@/types/global'
import MenuDisplay from '../components/MenuDisplay.vue'

// 1. Acesso aos parâmetros de Rota
const route = useRoute()
const id = ref(route.params.id as string)

// 2. Estado
const cardapio = ref<Cardapio | null>(null)
const loading = ref(true)

// 3. Função de Carregamento
const loadCardapio = async (lojaId: string) => {
  loading.value = true
  try {
    const data = await getCardapio(lojaId)
    cardapio.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 4. Ciclo de Vida: Carregar na montagem
onMounted(() => {
  if (id.value) {
    loadCardapio(id.value)
  }
})

// 5. Opcional: Monitorar mudança de ID (se a rota puder mudar sem recarregar a página)
watch(
  () => route.params.id,
  (newId) => {
    id.value = newId as string
    if (id.value) {
      loadCardapio(id.value)
    }
  },
)
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center min-h-screen text-gray-500">
      Carregando cardápio...
    </div>

    <div v-else-if="!cardapio" class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Loja não encontrada</h1>
      <RouterLink to="/" class="text-blue-600 underline"> Voltar para Home </RouterLink>
    </div>

    <MenuDisplay v-else :cardapio="cardapio" />
  </div>
</template>
