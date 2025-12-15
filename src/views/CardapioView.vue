<script setup lang="ts">
import { onMounted, ref, useCssModule, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
// Importações de tipagem e serviços (assumindo que o caminho é src/services/dbService, etc.)
import { CardapioService } from '@/services/CardapioService'
import type { Cardapio } from '@/types/global'
import MenuDisplay from '../components/MenuDisplay.vue'

const styles = useCssModule()

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
    const cardapioService = new CardapioService()
    const data = await cardapioService.getCardapio(lojaId)
    cardapio.value = data
  } catch (error: any) {
    console.error(error)
    alert(error.message)
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
    <div v-if="loading" :class="styles.loading">
      Carregando cardápio...
    </div>

    <div v-else-if="!cardapio" :class="styles.notFound">
      <h1 :class="styles.notFoundTitle">Loja não encontrada</h1>
      <RouterLink to="/" :class="styles.backLink"> Voltar para Home </RouterLink>
    </div>

    <MenuDisplay v-else :cardapio="cardapio" />
  </div>
</template>

<style module src="./CardapioView.module.css"></style>

