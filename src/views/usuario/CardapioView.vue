<template>
  <div>
    <div v-if="loading" :class="$style.loading">
      Carregando cardápio...
    </div>

    <div v-else-if="!cardapio" :class="$style.notFound">
      <h1 :class="$style.notFoundTitle">Loja não encontrada</h1>
      <RouterLink to="/" :class="$style.backLink"> Voltar para Home </RouterLink>
    </div>

    <MenuDisplay v-else :cardapio="cardapio" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CardapioService } from '@/services/CardapioService'
import type { Cardapio } from '@/types/global'
import MenuDisplay from '@/components/MenuDisplay.vue'

export default defineComponent({
  name: 'CardapioView',

  components: {
    MenuDisplay
  },

  data() {
    return {
      cardapio: null as Cardapio | null,
      loading: true,
    }
  },

  methods: {
    async loadCardapio(lojaId: string) {
      this.loading = true
      try {
        const cardapioService = new CardapioService()
        const data = await cardapioService.getCardapio(lojaId)
        this.cardapio = data
      } catch(error:any) {
        console.error(error)
        alert(error.message)
      } finally {
        this.loading = false
      }
    }
  },

  mounted() {
    this.loadCardapio(this.$route.params.id as string)
  }
})

</script>

<style module src="./CardapioView.module.css"></style>

