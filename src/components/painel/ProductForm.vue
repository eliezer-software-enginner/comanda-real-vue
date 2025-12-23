<script setup lang="ts">
import logger from '@/plugins/logs'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { nextTick, onMounted, ref, useCssModule, watch } from 'vue'
// 1. Importar o hook da biblioteca
import { useCurrencyInput } from 'vue-currency-input'

interface ProductFormProps {
  onSave: (produto: ProdutoModel) => void
  onCancel: () => void
  initialData?: ProdutoModel
  lojistaId: string
}

const styles = useCssModule()

const props = defineProps<ProductFormProps>()

const service = new ProdutosService(props.lojistaId)
const categoriasService = new CategoriaService(props.lojistaId)

// 2. Estado (ref)
const nome = ref(props.initialData?.nome || '')
const descricao = ref(props.initialData?.descricao || '')

const categoriaId = ref(props.initialData?.categoriaId || '')
const imagemUrl = ref(props.initialData?.imagemUrl || '')
const subindoImagem = ref(false)

const categorias = ref<CategoriaModel[]>([])

// 3. Configuração do Currency Input
const { inputRef, numberValue, setValue } = useCurrencyInput({
  currency: 'BRL',
  locale: 'pt-BR',
  precision: 2,
  valueRange: { min: 0 },
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
})

onMounted(async () => {
  logger.info('carregando produto', { label: 'ProdutoForm', dado: props.initialData })
  try {
    const lista = await categoriasService.getLista()
    categorias.value = lista
    logger.info('categorias carregadas', { label: 'ProdutoForm', total: lista.length })
  } catch (error) {
    logger.error('Erro ao carregar categorias', { error })
  }

  logger.info('carregando produto', { label: 'ProdutoForm', dado: props.initialData })
})

watch(
  () => props.initialData,
  async (newData) => {
    nome.value = newData?.nome || ''
    descricao.value = newData?.descricao || ''
    categoriaId.value = newData?.categoriaId || ''
    imagemUrl.value = newData?.imagemUrl || ''

    if (newData?.preco != null) {
      await nextTick() //aqui eu garanto que o input vai estar disponivel para receber um value
      setValue(newData.preco)
    }
  },
  { immediate: true },
)

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    try {
      subindoImagem.value = true
      const url = await service.uploadImagem(props.lojistaId, file)
      imagemUrl.value = url
    } catch (e) {
      alert('Erro ao subir imagem')
    } finally {
      subindoImagem.value = false
    }
  }
}

// 5. Função de Submissão simplificada (não precisa mais de replace)
const handleSubmit = (e: Event) => {
  e.preventDefault()

  const novoProduto: ProdutoModel = {
    id: props.initialData?.id || `prod_${Date.now()}`,
    nome: nome.value,
    descricao: descricao.value,
    preco: numberValue.value == null ? 0 : numberValue.value,
    categoriaId: categoriaId.value,
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
      <label>Descrição (Opcional)</label>
      <textarea rows="3" v-model="descricao" />
    </div>

    <div :class="styles.gridCols2">
      <div :class="styles.formGroup">
        <label>Preço (R$)</label>
        <input ref="inputRef" type="text" required placeholder="0,00" />
      </div>

      <div :class="styles.formGroup">
        <label>Categoria</label>
        <select v-model="categoriaId" required>
          <option value="" disabled selected>Selecione uma categoria</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome }}
          </option>
        </select>
      </div>
      <!-- <div :class="styles.formGroup">
        <label>Categoria</label>
        <input type="text" required placeholder="Ex: Lanches" v-model="categoria" />
      </div> -->
    </div>

    <div :class="styles.formGroup">
      <label>Imagem do Produto</label>

      <div v-if="imagemUrl" class="mb-2">
        <img :src="imagemUrl" style="width: 100px; height: 100px; object-fit: cover" />
      </div>

      <input type="file" accept="image/*" @change="handleFileChange" :disabled="subindoImagem" />
      <p v-if="subindoImagem">Subindo imagem...</p>
    </div>

    <div :class="styles.actions">
      <button type="button" @click="onCancel" :class="styles.cancelButton">Cancelar</button>
      <button v-if="!subindoImagem" type="submit" :class="styles.saveButton">Salvar Produto</button>
    </div>
  </form>
</template>

<style module src="./ProductForm.module.css"></style>
