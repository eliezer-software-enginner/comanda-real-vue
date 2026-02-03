<script setup lang="ts">
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import { useLojistaStore } from '@/stores/lojista'
import { Utils } from '@/utils/Utils'
import { computed, useCssModule } from 'vue'
import { useCategoriasStore } from '../../stores/categorias'

// Store do lojista
const lojistaStore = useLojistaStore()
const lojistaId = computed(() => lojistaStore.lojistaId)
const styles = useCssModule()

const categoriaStore = useCategoriasStore()
const categoriaList = computed(() => categoriaStore.categorias)

// 4. Função de Submissão
async function handleSubmit(e: Event) {
  e.preventDefault()

  if (categoriaList.value == null) return

  try {
    await categoriaStore.atualizarEmLote(categoriaList.value!)
  } catch (e: any) {
    alert(e.message)
  }
}

function adicionarLinha() {
  // Inicializa o array caso esteja undefined
  if (categoriaList.value == undefined) {
    return
  }

  const novaCategoria = {
    id: Utils.gerarUUID(),
    nome: '',
    lojistaId: lojistaId.value!,
    status: 'ativo' as const,
    dtCriacao: new Date(),
  }

  // Adiciona à lista temporária (será salva no handleSubmit)
  categoriaList.value.push(novaCategoria)
}

async function excluir(categoria: CategoriaModel, index: number) {
  try {
    // Para categorias já existentes no Firebase/LocalStorage, usa o método de exclusão
    if (categoria.id && !categoria.id.startsWith('temp_')) {
      await categoriaStore.excluirCategoria(categoria.id, lojistaId.value!)
    } else {
      // Para categorias temporárias (adicionadas localmente), apenas remove da lista
      categoriaList.value.splice(index, 1)
    }
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <form v-if="categoriaList" @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">Gestão de Categorias</h3>

    <section :class="styles.section">
      <div :class="styles.labelHeader">
        <label>Categorias Ativas</label>
        <button type="button" @click="adicionarLinha" :class="styles.btnAdd">
          <span>+</span> Adicionar Nova
        </button>
      </div>

      <div v-if="categoriaList.length > 0">
        <div v-for="(cat, index) in categoriaList" :key="cat.id" :class="styles.categoriaRow">
          <div :class="styles.inputGroup">
            <span>Nome da Categoria</span>
            <input v-model="cat.nome" placeholder="Ex: Pizzas, Bebidas..." required />
          </div>

          <button
            type="button"
            @click="excluir(cat, index)"
            :class="styles.btnDelete"
            title="Remover categoria"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>

      <div v-else :class="styles.emptyMsg">
        Nenhuma categoria criada ainda. Clique em "Adicionar" para começar.
      </div>
    </section>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar Alterações</button>
    </div>
  </form>

  <div v-else class="p-8 text-center text-gray-500">Carregando categorias...</div>
</template>

<style module src="./CategoriasView.module.css"></style>
