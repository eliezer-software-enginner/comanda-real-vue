<script setup lang="ts">
import type { Cardapio } from '@/types/global'
import { ref, watch } from 'vue'

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
    class="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
  >
    <h3 class="text-lg font-bold mb-4">Configurações da Loja</h3>

    <div>
      <label class="block text-sm font-medium text-gray-700">Nome da Loja</label>
      <input
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="nomeLoja"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">URL da Logo / Foto da Loja</label>
      <input
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="fotoUrl"
        placeholder="https://exemplo.com/logo.jpg"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">WhatsApp para Pedidos</label>
      <input
        type="tel"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="whatsapp"
        placeholder="5511999999999 (com código do país e DDD)"
      />
      <p class="mt-1 text-xs text-gray-500">Número que receberá as mensagens dos pedidos.</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700"> ID da Loja (Slug na URL) </label>
      <div class="mt-1 flex rounded-md shadow-sm">
        <span
          class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
        >
          /cardapio/
        </span>
        <input
          type="text"
          required
          class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm border"
          v-model="lojaId"
        />
      </div>
      <p class="mt-1 text-sm text-gray-500">Este será o link que você enviará aos clientes.</p>
    </div>

    <div class="pt-4">
      <button
        type="submit"
        class="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Salvar Configurações
      </button>
    </div>
  </form>
</template>
