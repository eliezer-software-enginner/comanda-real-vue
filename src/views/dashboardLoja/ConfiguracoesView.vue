<script setup lang="ts">
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import { computed, onMounted, ref, useCssModule, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const styles = useCssModule()
const service = new LojistaService()

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
    await service.atualizar(inputData.value!)
  } catch (e: any) {
    alert(e.message)
  }
}

function adicionarHorario() {
  if (!inputData.value) return

  // Inicializa o array caso esteja undefined
  if (!inputData.value.horariosFuncionamento) {
    inputData.value.horariosFuncionamento = []
  }

  inputData.value.horariosFuncionamento.push({ de: '08:00', ate: '18:00' })
}

function removerHorario(index: number) {
  inputData.value?.horariosFuncionamento?.splice(index, 1)
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
      <div :class="styles.labelHeader">
        <label>Horários de Funcionamento</label>
        <button type="button" @click="adicionarHorario" :class="styles.btnAdd">+ Adicionar</button>
      </div>

      <div
        v-for="(horario, index) in inputData.horariosFuncionamento"
        :key="index"
        :class="styles.horarioRow"
      >
        <div :class="styles.timeInputGroup">
          <span>De:</span>
          <input type="time" v-model="horario.de" required />
        </div>

        <div :class="styles.timeInputGroup">
          <span>Até:</span>
          <input type="time" v-model="horario.ate" required />
        </div>

        <button
          type="button"
          @click="removerHorario(index)"
          :class="styles.btnDelete"
          title="Remover horário"
        >
          ✕
        </button>
      </div>

      <p v-if="!inputData.horariosFuncionamento?.length" :class="styles.emptyMsg">
        Nenhum horário configurado.
      </p>
    </div>

    <div :class="styles.formGroup">
      <label>URL da Logo / Foto da Loja</label>
      <input type="url" v-model="inputData.logoUrl" placeholder="https://exemplo.com/logo.jpg" />
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp para Pedidos</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.formGroup">
      <label>Sua url final (exemplo: minha-lanchonete)</label>
      <input v-model="inputData.slug" placeholder="exemplo: minha-lanchonete" />
    </div>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar Configurações</button>
    </div>
  </form>

  <div v-else class="p-8 text-center text-gray-500">Carregando configurações...</div>
</template>

<style module src="./ConfiguracoesView.module.css"></style>
