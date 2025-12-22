<script setup lang="ts">
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { ref, useCssModule, watch } from 'vue'

const styles = useCssModule()

// 1. Definição de Props (Tipagem com TS)
interface ProductFormProps {
  onSave: (produto: ProdutoModel) => void
  onCancel: () => void
  initialData?: ProdutoModel
  lojistaId: string
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
const subindoImagem = ref(false)
const inputImagem = ref<HTMLInputElement | null>(null)

const service = new ProdutosService(props.lojistaId)

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

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]

    try {
      subindoImagem.value = true
      // Chamamos o método que criamos no passo 2
      const url = await service.uploadImagem(props.lojistaId, file)
      imagemUrl.value = url
    } catch (e) {
      alert('Erro ao subir imagem')
    } finally {
      subindoImagem.value = false
    }
  }
}

// 4. Função de Submissão
const handleSubmit = (e: Event) => {
  e.preventDefault()

  // Tratamento do preço (substitui vírgula por ponto para garantir o parseFloat)
  const precoNumerico = parseFloat(preco.value.replace(',', '.'))

  const novoProduto: ProdutoModel = {
    id: props.initialData?.id || `prod_${Date.now()}`,
    nome: nome.value,
    descricao: descricao.value,
    preco: precoNumerico,
    categoria: categoria.value,
    imagemUrl: imagemUrl.value,
    lojistaId: props.lojistaId,
    dtCriacao: new Date(),
    status: 'ativo',
    vendas: 0,
  }
  props.onSave(novoProduto)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">{{ initialData ? 'Editar Produto' : 'Novo Produto' }}</h3>

    <div :class="styles.formGroup">
      <label>Nome do Produto</label>
      <input type="text" required v-model="nome" />
    </div>

    <div :class="styles.formGroup">
      <label>Descrição</label>
      <textarea rows="3" v-model="descricao" />
    </div>

    <div :class="styles.gridCols2">
      <div :class="styles.formGroup">
        <label>Preço (R$)</label>
        <input type="number" step="0.01" required v-model="preco" />
      </div>
      <div :class="styles.formGroup">
        <label>Categoria</label>
        <input type="text" required placeholder="Ex: Lanches" v-model="categoria" />
      </div>
    </div>

    <div :class="styles.formGroup">
      <label>Imagem do Produto</label>

      <div v-if="imagemUrl" class="mb-2">
        <img :src="imagemUrl" style="width: 100px; height: 100px; object-fit: cover" />
      </div>

      <input type="file" accept="image/*" @change="handleFileChange" :disabled="subindoImagem" />
      <p v-if="subindoImagem">Subindo imagem...</p>
    </div>
    <!-- 
    <div :class="styles.formGroup">
      <label>URL da Imagem</label>
      <input type="url" v-model="imagemUrl" placeholder="https://exemplo.com/imagem.jpg" />
    </div> -->

    <div :class="styles.actions">
      <button type="button" @click="onCancel" :class="styles.cancelButton">Cancelar</button>
      <button v-if="!subindoImagem" type="submit" :class="styles.saveButton">Salvar Produto</button>
    </div>
  </form>
</template>

<style module src="./ProductForm.module.css"></style>
