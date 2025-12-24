<script setup lang="ts">
import logger from '@/plugins/logs'
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import { Utils } from '@/utils/Utils'
import { computed, onMounted, ref, useCssModule, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const lojistaId = computed(() => route.params.id as string)
const styles = useCssModule()

const categoriaService = new CategoriaService(lojistaId.value)
const categoriaList: Ref<CategoriaModel[]> = ref([])

onMounted(async () => {
  try {
    categoriaList.value = await categoriaService.getListaBy({ campo: 'nome', ordem: 'crescente' })
    logger.info('categorias recuperadas', {
      label: 'CategoriasView',
      dado: {
        categoriaList,
      },
    })
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

// 4. Função de Submissão
async function handleSubmit(e: Event) {
  e.preventDefault()

  if (categoriaList.value == null) return

  try {
    await categoriaService.atualizarEmLote(categoriaList.value!)
  } catch (e: any) {
    alert(e.message)
  }
}

function adicionarLinha() {
  // Inicializa o array caso esteja undefined
  if (categoriaList.value == undefined) {
    return
  }

  categoriaList.value.push({
    id: Utils.gerarUUID(),
    nome: '',
    lojistaId: lojistaId.value,
    status: 'ativo',
    dtCriacao: new Date(),
  })
}

function removerLinha(index: number) {
  categoriaList.value.splice(index, 1)
}
</script>

<template>
  <form v-if="categoriaList" @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">Categorias</h3>

    <div :class="styles.formGroup">
      <div :class="styles.labelHeader">
        <label>Minhas categorias</label>
        <button type="button" @click="adicionarLinha" :class="styles.btnAdd">+ Adicionar</button>
      </div>

      <div v-for="(cat, index) in categoriaList" :key="index" :class="styles.horarioRow">
        <div :class="styles.timeInputGroup">
          <span>Nome:</span>
          <input v-model="cat.nome" required />
        </div>

        <button
          type="button"
          @click="removerLinha(index)"
          :class="styles.btnDelete"
          title="Remover horário"
        >
          ✕
        </button>
      </div>

      <p v-if="!categoriaList?.length" :class="styles.emptyMsg">Nenhuma categoria criada.</p>
    </div>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar categorias</button>
    </div>
  </form>

  <div v-else class="p-8 text-center text-gray-500">Carregando categorias...</div>
</template>

<style module src="./ConfiguracoesView.module.css"></style>
