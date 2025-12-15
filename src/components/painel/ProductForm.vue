<script setup lang="ts">
import type { Produto } from '@/types/global'
import { ref, watch } from 'vue'

// 1. Definição de Props (Tipagem com TS)
interface ProductFormProps {
  onSave: (produto: Produto) => void
  onCancel: () => void
  initialData?: Produto
}
const props = defineProps<ProductFormProps>()

// 2. Estado (ref)
// Inicializa os refs com os dados iniciais, se existirem
const nome = ref(props.initialData?.nome || '')
const descricao = ref(props.initialData?.descricao || '')
// Converte o preço numérico para string para o input (Vue 3/Vite aceita o toString() diretamente no ref)
const preco = ref(props.initialData?.preco.toString() || '')
const categoria = ref(props.initialData?.categoria || '')
const imagemUrl = ref(props.initialData?.imagemUrl || '')

// 3. Monitorar `initialData` (Necessário se o formulário for reutilizado na mesma página para editar itens diferentes)
watch(
  () => props.initialData,
  (newData) => {
    nome.value = newData?.nome || ''
    descricao.value = newData?.descricao || ''
    preco.value = newData?.preco.toString() || ''
    categoria.value = newData?.categoria || ''
    imagemUrl.value = newData?.imagemUrl || ''
  },
  { deep: true },
)

// 4. Função de Submissão
const handleSubmit = (e: Event) => {
  e.preventDefault()

  // Tratamento do preço (substitui vírgula por ponto para garantir o parseFloat)
  const precoNumerico = parseFloat(preco.value.replace(',', '.'))

  const novoProduto: Produto = {
    id: props.initialData?.id || `prod_${Date.now()}`,
    nome: nome.value,
    descricao: descricao.value,
    preco: precoNumerico,
    categoria: categoria.value,
    imagemUrl: imagemUrl.value,
  }
  props.onSave(novoProduto)
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
  >
    <h3 class="text-lg font-bold mb-4">{{ initialData ? 'Editar Produto' : 'Novo Produto' }}</h3>

    <div>
      <label class="block text-sm font-medium text-gray-700">Nome do Produto</label>
      <input
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="nome"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Descrição</label>
      <textarea
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="descricao"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Preço (R$)</label>
        <input
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          v-model="preco"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Categoria</label>
        <input
          type="text"
          required
          placeholder="Ex: Lanches"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          v-model="categoria"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">URL da Imagem</label>
      <input
        type="url"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
        v-model="imagemUrl"
        placeholder="https://exemplo.com/imagem.jpg"
      />
    </div>

    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        @click="onCancel"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
      >
        Salvar Produto
      </button>
    </div>
  </form>
</template>
