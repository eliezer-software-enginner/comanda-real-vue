<script setup lang="ts">
import type { Cardapio } from '@/types/global'
import { ref, useCssModule, watch } from 'vue'

const styles = useCssModule()

// 1. Definição de Props (Tipagem com TS)
interface StoreSettingsProps {
  cardapio: Cardapio
  onSave: (settings: Partial<Cardapio>) => void
}
const props = defineProps<StoreSettingsProps>()

// 2. Estado (ref)
const nomeLoja = ref(props.cardapio.nomeLoja)
const lojaId = ref(props.cardapio.id)
const fotoUrl = ref(props.cardapio.fotoUrl || '')
const whatsapp = ref(props.cardapio.whatsapp || '')

// 3. Monitorar a prop `cardapio` para atualizar o estado local se ela mudar
watch(
  () => props.cardapio,
  (newCardapio) => {
    nomeLoja.value = newCardapio.nomeLoja
    lojaId.value = newCardapio.id
    fotoUrl.value = newCardapio.fotoUrl || ''
    whatsapp.value = newCardapio.whatsapp || ''
  },
  { deep: true },
)

// 4. Função de Submissão
const handleSubmit = (e: Event) => {
  e.preventDefault()

  props.onSave({
    nomeLoja: nomeLoja.value,
    id: lojaId.value,
    fotoUrl: fotoUrl.value,
    whatsapp: whatsapp.value,
  })
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    :class="styles.form"
  >
    <h3 :class="styles.title">Configurações da Loja</h3>

    <div :class="styles.formGroup">
      <label>Nome da Loja</label>
      <input
        type="text"
        required
        v-model="nomeLoja"
      />
    </div>

    <div :class="styles.formGroup">
      <label>URL da Logo / Foto da Loja</label>
      <input
        type="url"
        v-model="fotoUrl"
        placeholder="https://exemplo.com/logo.jpg"
      />
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp para Pedidos</label>
      <input
        type="tel"
        v-model="whatsapp"
        placeholder="5511999999999 (com código do país e DDD)"
      />
      <p :class="styles.helpText">Número que receberá as mensagens dos pedidos.</p>
    </div>

    <div :class="styles.formGroup">
      <label>ID da Loja (Slug na URL) </label>
      <div :class="styles.inputGroup">
        <span
          :class="styles.inputPrefix"
        >
          /cardapio/
        </span>
        <input
          type="text"
          required
          v-model="lojaId"
        />
      </div>
      <p :class="styles.helpText">Este será o link que você enviará aos clientes.</p>
    </div>

    <div :class="styles.submitSection">
      <button
        type="submit"
        :class="styles.submitButton"
      >
        Salvar Configurações
      </button>
    </div>
  </form>
</template>

<style module src="./StoreSettings.module.css"></style>

