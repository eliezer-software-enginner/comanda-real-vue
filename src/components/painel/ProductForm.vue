<script setup lang="ts">
import logger from '@/plugins/logs'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
import type { ProdutoModel, ProdutoTipo } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { nextTick, onMounted, ref, useCssModule, watch } from 'vue'
// 1. Importar o hook da biblioteca
import { useCurrencyInput } from 'vue-currency-input'

interface ProductFormProps {
  onSave: (produto: ProdutoDto) => void
  onEditar: (produto: ProdutoModel) => void
  onCancel: () => void
  initialData?: ProdutoModel
  lojistaId: string
  isModoEdicao: boolean
  categorias: CategoriaModel[]
}

const styles = useCssModule()

const props = defineProps<ProductFormProps>()

const service = new ProdutosService(props.lojistaId)

// 2. Estado (ref)
const nome = ref(props.initialData?.nome || '')
const descricao = ref(props.initialData?.descricao || '')
const categoriaId = ref(props.initialData?.categoriaId || '')
const imagemUrl = ref(props.initialData?.imagemUrl || '')
const subindoImagem = ref(false)

const tiposProduto = ref(ProdutosService.TiposParaLista())
const tipoSelecionado = ref<ProdutoTipo>(props.initialData?.tipo || 'principal')

// 3. Estados para acompanhamentos
const acompanhamentosDisponiveis = ref<ProdutoModel[]>([])
const acompanhamentosSelecionadosIds = ref<string[]>(props.initialData?.acompanhamentosIds || [])
const carregandoAdicionaisEAcompanhamentos = ref(false)

const adicionaisDisponiveis = ref<ProdutoModel[]>([])
const adicionaisSelecionadosIds = ref<string[]>(props.initialData?.adicionaisIds || [])

// 4. Configuração do Currency Input
const { inputRef, numberValue, setValue } = useCurrencyInput({
  currency: 'BRL',
  locale: 'pt-BR',
  precision: 2,
  valueRange: { min: 0 },
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
})

async function carregarAcompanhamentosEAdicionaisDisponiveis() {
  if (props.lojistaId) {
    try {
      carregandoAdicionaisEAcompanhamentos.value = true
      acompanhamentosDisponiveis.value = await service.getListaAcompanhamentosGeral()
      adicionaisDisponiveis.value = await service.getListaAdicionaisGeral()
    } catch (error) {
      console.error('Erro ao carregar acompanhamentos ou adicionais:', error)
      acompanhamentosDisponiveis.value = []
      adicionaisDisponiveis.value = []
    } finally {
      carregandoAdicionaisEAcompanhamentos.value = false
    }
  }
}

// 6. Função para alternar seleção de acompanhamento
function toggleAcompanhamento(acompanhamentoId: string) {
  const index = acompanhamentosSelecionadosIds.value.indexOf(acompanhamentoId)
  if (index > -1) {
    // Remover se já estiver selecionado
    acompanhamentosSelecionadosIds.value.splice(index, 1)
  } else {
    // Adicionar se não estiver selecionado
    acompanhamentosSelecionadosIds.value.push(acompanhamentoId)
  }
}

function toggleAdicional(adicionalId: string) {
  const index = adicionaisSelecionadosIds.value.indexOf(adicionalId)
  if (index > -1) {
    // Remover se já estiver selecionado
    adicionaisSelecionadosIds.value.splice(index, 1)
  } else {
    // Adicionar se não estiver selecionado
    adicionaisSelecionadosIds.value.push(adicionalId)
  }
}

function isAcompanhamentoSelecionado(acompanhamentoId: string): boolean {
  return acompanhamentosSelecionadosIds.value.includes(acompanhamentoId)
}
function isAdicionalSelecionado(adicionalId: string): boolean {
  return adicionaisSelecionadosIds.value.includes(adicionalId)
}

watch(
  () => props.initialData,
  async (newData) => {
    nome.value = newData?.nome || ''
    descricao.value = newData?.descricao || ''
    categoriaId.value = newData?.categoriaId || ''
    imagemUrl.value = newData?.imagemUrl || ''

    // Atualizar acompanhamentos selecionados
    acompanhamentosSelecionadosIds.value = newData?.acompanhamentosIds || []
    adicionaisSelecionadosIds.value = newData?.adicionaisIds || []

    if (newData?.preco != null) {
      await nextTick() //aqui eu garanto que o input vai estar disponivel para receber um value
      setValue(newData.preco)
    }
  },
  { immediate: true },
)

// 8. Carregar acompanhamentos quando o componente for montado
onMounted(() => {
  carregarAcompanhamentosEAdicionaisDisponiveis()
})

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

const handleSubmit = (e: Event) => {
  e.preventDefault()

  if (props.isModoEdicao) {
    //TODO trocar isso por um mapper
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
      tipo: tipoSelecionado.value,
      adicionaisIds: adicionaisSelecionadosIds.value,
      acompanhamentosIds: acompanhamentosSelecionadosIds.value,
    }

    logger.info('Produto em modo de edição', { dado: novoProduto })
    props.onEditar(novoProduto)
    return
  }

  const novoProduto: ProdutoDto = {
    id: props.initialData?.id || `prod_${Date.now()}`,
    nome: nome.value,
    descricao: descricao.value,
    preco: numberValue.value == null ? 0 : numberValue.value,
    categoriaId: categoriaId.value,
    imagemUrl: imagemUrl.value,
    lojistaId: props.lojistaId,
    tipo: tipoSelecionado.value,
    adicionaisIds: adicionaisSelecionadosIds.value,
    acompanhamentosIds: acompanhamentosSelecionadosIds.value, // Usar os acompanhamentos selecionados
  }

  logger.info('Produto em modo de criação', { dado: novoProduto })
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
    </div>

    <div :class="styles.formGroup">
      <label>Imagem do Produto</label>

      <div v-if="imagemUrl" class="mb-2">
        <img :src="imagemUrl" style="width: 100px; height: 100px; object-fit: cover" />
      </div>

      <input type="file" accept="image/*" @change="handleFileChange" :disabled="subindoImagem" />
      <p v-if="subindoImagem">Subindo imagem...</p>
    </div>

    <div :class="styles.formGroup">
      <label>Seu produto é:</label>
      <br />
      <v-radio-group v-model="tipoSelecionado">
        <v-radio v-for="tipo in tiposProduto" :key="tipo" :label="tipo" :value="tipo"></v-radio>
      </v-radio-group>
    </div>

    <!-- Seção de Acompanhamentos -->
    <div :class="styles.formGroup" v-if="tipoSelecionado === 'principal'">
      <label>Acompanhamentos</label>
      <p class="text-sm text-gray-600 mb-2">
        Selecione os acompanhamentos disponíveis para este produto
      </p>

      <div v-if="carregandoAdicionaisEAcompanhamentos" class="text-center py-4">
        <p>Carregando acompanhamentos...</p>
      </div>

      <div
        v-else-if="acompanhamentosDisponiveis.length === 0"
        class="text-center py-4 border rounded"
      >
        <p class="text-gray-500">Nenhum acompanhamento cadastrado ainda.</p>
      </div>

      <div v-else class="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
        <div
          v-for="acompanhamento in acompanhamentosDisponiveis"
          :key="acompanhamento.id"
          class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          :class="{ 'bg-blue-50': isAcompanhamentoSelecionado(acompanhamento.id) }"
          @click="toggleAcompanhamento(acompanhamento.id)"
        >
          <div :class="styles.checkboxWrapper">
            <div>
              <img
                v-if="acompanhamento.imagemUrl"
                :src="acompanhamento.imagemUrl"
                :alt="acompanhamento.nome"
                :class="styles.imgItem"
              />

              <p class="text-sm font-medium text-gray-900 truncate">{{ acompanhamento.nome }}</p>
              <p class="text-xs text-gray-500 truncate">R$ {{ acompanhamento.preco.toFixed(2) }}</p>
            </div>

            <input
              type="checkbox"
              :checked="isAcompanhamentoSelecionado(acompanhamento.id)"
              @click.stop
              @change="toggleAcompanhamento(acompanhamento.id)"
              :class="styles.checkbox"
            />
          </div>
        </div>
      </div>

      <div v-if="acompanhamentosSelecionadosIds.length > 0" class="mt-3">
        <p class="text-sm font-medium text-gray-700">
          {{ acompanhamentosSelecionadosIds.length }} acompanhamento(s) selecionado(s)
        </p>
      </div>
    </div>

    <!-- Seção de Adicionais -->
    <div :class="styles.formGroup" v-if="tipoSelecionado === 'principal'">
      <label>Adicionais</label>
      <p class="text-sm text-gray-600 mb-2">
        Selecione os adicionais disponíveis para este produto
      </p>

      <div v-if="carregandoAdicionaisEAcompanhamentos" class="text-center py-4">
        <p>Carregando adicionais...</p>
      </div>

      <div v-if="adicionaisDisponiveis.length === 0" class="text-center py-4 border rounded">
        <p class="text-gray-500">Nenhum adicional cadastrado ainda.</p>
      </div>

      <div v-else class="space-y-2 max-h-60 overflow-y-auto p-2 border rounded">
        <div
          v-for="adicional in adicionaisDisponiveis"
          :key="adicional.id"
          class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          :class="{ 'bg-blue-50': isAdicionalSelecionado(adicional.id) }"
          @click="toggleAdicional(adicional.id)"
        >
          <div :class="styles.checkboxWrapper">
            <div>
              <img
                v-if="adicional.imagemUrl"
                :src="adicional.imagemUrl"
                :alt="adicional.nome"
                :class="styles.imgItem"
              />
              <p class="text-sm font-medium text-gray-900 truncate">{{ adicional.nome }}</p>
              <p class="text-xs text-gray-500 truncate">R$ {{ adicional.preco.toFixed(2) }}</p>
            </div>

            <input
              type="checkbox"
              :checked="isAdicionalSelecionado(adicional.id)"
              @click.stop
              @change="toggleAdicional(adicional.id)"
              :class="styles.checkbox"
            />
          </div>
        </div>
      </div>

      <div v-if="adicionaisSelecionadosIds.length > 0" class="mt-3">
        <p class="text-sm font-medium text-gray-700">
          {{ adicionaisSelecionadosIds.length }} adicional selecionado(s)
        </p>
      </div>
    </div>

    <div :class="styles.actions">
      <button type="button" @click="onCancel" :class="styles.cancelButton">Cancelar</button>
      <button v-if="!subindoImagem" type="submit" :class="styles.saveButton">Salvar Produto</button>
    </div>
  </form>
</template>

<style module src="./ProductForm.module.css"></style>
