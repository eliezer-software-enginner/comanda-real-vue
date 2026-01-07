import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import logger from '@/plugins/logs'

export const useLojistaStore = defineStore('lojista', () => {
  // Estado
  const lojista = ref<LojistaModel | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLojistaLoaded = computed(() => lojista.value !== null)
  const lojistaId = computed(() => lojista.value?.id)
  const nomeLoja = computed(() => lojista.value?.nomeLoja || '')
  const estaAberta = computed(() => {
    if (!lojista.value) return false

    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
    const hoje = dias[new Date().getDay()]

    const horarioHoje =
      lojista.value.horarioFuncionamento?.[hoje as keyof typeof lojista.value.horarioFuncionamento]

    if (!horarioHoje) return false

    const agora = new Date()
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

    const [hAbertura, mAbertura] = horarioHoje.abertura.split(':')
    const [hFechamento, mFechamento] = horarioHoje.fechamento.split(':')

    const abertura = Number(hAbertura) * 60 + Number(mAbertura)
    const fechamento = Number(hFechamento) * 60 + Number(mFechamento)

    return minutosAgora >= abertura && minutosAgora <= fechamento
  })

  // Ações
  async function fetchLojista(lojistaId: string): Promise<void> {
    if (!lojistaId) {
      error.value = 'ID do lojista não fornecido'
      return
    }

    // Se já tem dados em cache e for o mesmo ID, não busca novamente
    if (lojista.value && lojista.value.id === lojistaId) {
      logger.info('Lojista já carregado no cache', { lojistaId })
      return
    }

    try {
      loading.value = true
      error.value = null

      logger.info('Buscando dados do lojista', { lojistaId })

      const service = new LojistaService()
      const data = await service.getById(lojistaId)

      lojista.value = data

      logger.info('Lojista carregado com sucesso', {
        lojistaId,
        nomeLoja: data.nomeLoja,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar lojista'
      error.value = errorMessage

      logger.error('Erro ao buscar lojista', {
        lojistaId,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function updateLojista(data: Partial<LojistaModel>): Promise<void> {
    if (!lojista.value) {
      error.value = 'Nenhum lojista carregado para atualizar'
      return
    }

    try {
      loading.value = true
      error.value = null

      logger.info('Atualizando dados do lojista', { lojistaId: lojista.value.id })

      const service = new LojistaService()
      const updatedData = { ...lojista.value, ...data }

      await service.atualizar(updatedData)
      lojista.value = updatedData

      logger.info('Lojista atualizado com sucesso', {
        lojistaId: lojista.value.id,
        nomeLoja: updatedData.nomeLoja,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar lojista'
      error.value = errorMessage

      logger.error('Erro ao atualizar lojista', {
        lojistaId: lojista.value.id,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function clearLojista(): void {
    lojista.value = null
    error.value = null
    loading.value = false

    logger.info('Store do lojista limpo')
  }

  function setLoading(loadingState: boolean): void {
    loading.value = loadingState
  }

  return {
    // Estado
    lojista,
    loading,
    error,

    // Getters
    isLojistaLoaded,
    lojistaId,
    nomeLoja,
    estaAberta,

    // Ações
    fetchLojista,
    updateLojista,
    clearLojista,
    setLoading,
  }
})
