<script setup lang="ts">
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import { computed, onMounted, ref, useCssModule, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const styles = useCssModule()
const service = new LojistaService()

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const inputData: Ref<LojistaModel | undefined> = ref(undefined)

onMounted(async () => {
  try {
    const data = await service.getData(lojistaId.value)

    if (data) {
      console.log(data)
      inputData.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

// 4. Função de Submissão
async function handleSubmit(e: Event) {
  e.preventDefault()

  alert(lojistaId.value)
  if (inputData.value == null) return

  try {
    await service.atualizar(lojistaId.value, inputData.value!)
  } catch (e: any) {
    alert(e.message)
  }
}
</script>

<template>
  <form v-if="inputData" @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">Configurações da Loja</h3>

    <div :class="styles.formGroup">
      <label>Nome da Loja</label>
      <input type="text" required v-model="inputData.nome" />
    </div>

    <div :class="styles.formGroup">
      <label>URL da Logo / Foto da Loja</label>
      <input type="url" v-model="inputData.logoUrl" placeholder="https://exemplo.com/logo.jpg" />
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp para Pedidos</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar Configurações</button>
    </div>
  </form>

  <div v-else class="p-8 text-center text-gray-500">Carregando configurações...</div>
</template>

<style module src="./ConfiguracoesView.module.css"></style>
