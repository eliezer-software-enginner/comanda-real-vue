import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CategoriaModel, CategoriaStatus } from '@/services/categoriasService/CategoriaModel'
import type { CategoriaDto } from '@/services/categoriasService/CategoriaDto'
import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import logger from '@/plugins/logs'

export const useCategoriasStore = defineStore('categorias', () => {
  // Estado
  const categorias = ref<CategoriaModel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isCategoriasLoaded = computed(() => categorias.value.length > 0)
  const categoriasAtivas = computed(() => categorias.value.filter((c) => c.status === 'ativo'))
  const categoriasPorId = computed(() => {
    const mapa: Record<string, CategoriaModel> = {}
    categorias.value.forEach((categoria) => {
      mapa[categoria.id] = categoria
    })
    return mapa
  })

  // Ações
  async function fetchCategorias(lojistaId: string): Promise<void> {
    if (!lojistaId) {
      error.value = 'ID do lojista não fornecido'
      return
    }

    // Se já tem categorias carregadas, não busca novamente
    if (categorias.value.length > 0 && categorias.value[0]?.lojistaId === lojistaId) {
      logger.info('Categorias já carregadas no cache', { lojistaId })
      return
    }

    try {
      loading.value = true
      error.value = null

      // Verifica se é o lojista de teste e tenta buscar do localStorage primeiro
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Buscando categorias do lojista de teste no localStorage', { lojistaId })

        const categoriasTeste = localStorage.getItem('categorias-teste')
        if (categoriasTeste) {
          try {
            const data = JSON.parse(categoriasTeste) as CategoriaModel[]
            categorias.value = data

            logger.info('Categorias de teste carregadas do localStorage com sucesso', {
              lojistaId,
              total: data.length,
            })
            return
          } catch (parseErr) {
            logger.warn('Erro ao parsear categorias do lojista de teste do localStorage', {
              lojistaId,
              erro: parseErr,
            })
          }
        }

        logger.info('Categorias de teste não encontradas no localStorage, carregando do Firebase', {
          lojistaId,
        })
      }

      logger.info('Buscando categorias do lojista no Firebase', { lojistaId })

      const service = new CategoriaService(lojistaId)
      const data = await service.getLista()

      categorias.value = data

      logger.info('Categorias carregadas com sucesso', {
        lojistaId,
        total: data.length,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar categorias'
      error.value = errorMessage

      logger.error('Erro ao buscar categorias', {
        lojistaId,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function criarCategoria(categoria: CategoriaDto): Promise<CategoriaModel> {
    try {
      loading.value = true
      error.value = null

      logger.info('Criando nova categoria', {
        lojistaId: categoria.lojistaId,
        nome: categoria.nome,
      })

      const lojistaId = categoria.lojistaId

      // Verifica se é o lojista de teste
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Criando categoria do lojista de teste no localStorage')

        const novaCategoria: CategoriaModel = {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lojistaId,
          nome: categoria.nome,
          dtCriacao: new Date(),
          status: 'ativo',
        }

        categorias.value.push(novaCategoria)

        // Salva no localStorage
        localStorage.setItem('categorias-teste', JSON.stringify(categorias.value))

        logger.info('Categoria de teste criada com sucesso no localStorage', {
          categoriaId: novaCategoria.id,
          nome: novaCategoria.nome,
        })

        return novaCategoria
      } else {
        const service = new CategoriaService(lojistaId)
        const categoriaModel = await service.criar(categoria)
        categorias.value.push(categoriaModel)

        logger.info('Categoria criada com sucesso no Firebase', {
          categoriaId: categoriaModel.id,
          nome: categoriaModel.nome,
        })

        return categoriaModel
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria'
      error.value = errorMessage

      logger.error('Erro ao criar categoria', {
        lojistaId: categoria.lojistaId,
        nome: categoria.nome,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function atualizarCategoria(categoria: CategoriaModel): Promise<void> {
    try {
      loading.value = true
      error.value = null

      logger.info('Atualizando categoria', {
        categoriaId: categoria.id,
        nome: categoria.nome,
      })

      // Verifica se é o lojista de teste
      if (categoria.lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Atualizando categoria do lojista de teste no localStorage')

        const index = categorias.value.findIndex((c) => c.id === categoria.id)
        if (index !== -1) {
          categorias.value[index] = categoria

          // Salva no localStorage
          localStorage.setItem('categorias-teste', JSON.stringify(categorias.value))

          logger.info('Categoria de teste atualizada com sucesso no localStorage', {
            categoriaId: categoria.id,
            nome: categoria.nome,
          })
        } else {
          throw new Error('Categoria não encontrada')
        }
      } else {
        const service = new CategoriaService(categoria.lojistaId)
        await service.atualizar(categoria)

        const index = categorias.value.findIndex((c) => c.id === categoria.id)
        if (index !== -1) {
          categorias.value[index] = categoria
        }

        logger.info('Categoria atualizada com sucesso no Firebase', {
          categoriaId: categoria.id,
          nome: categoria.nome,
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria'
      error.value = errorMessage

      logger.error('Erro ao atualizar categoria', {
        categoriaId: categoria.id,
        nome: categoria.nome,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function excluirCategoria(categoriaId: string, lojistaId: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      logger.info('Excluindo categoria', { categoriaId })

      // Verifica se é o lojista de teste
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Excluindo categoria do lojista de teste no localStorage')

        categorias.value = categorias.value.filter((c) => c.id !== categoriaId)

        // Salva no localStorage
        localStorage.setItem('categorias-teste', JSON.stringify(categorias.value))

        logger.info('Categoria de teste excluída com sucesso no localStorage', {
          categoriaId,
        })
      } else {
        const service = new CategoriaService(lojistaId)
        await service.excluir(categoriaId)

        categorias.value = categorias.value.filter((c) => c.id !== categoriaId)

        logger.info('Categoria excluída com sucesso no Firebase', {
          categoriaId,
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria'
      error.value = errorMessage

      logger.error('Erro ao excluir categoria', {
        categoriaId,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function clearCategorias(): void {
    categorias.value = []
    error.value = null
    loading.value = false

    logger.info('Store de categorias limpo')
  }

  function setLoading(loadingState: boolean): void {
    loading.value = loadingState
  }

  // Função para inicializar categorias padrão para o lojista de teste
  async function inicializarCategoriasTeste(lojistaId: string): Promise<void> {
    if (lojistaId !== 'TESTE_DEV_LOJA' || categorias.value.length > 0) {
      return
    }

    const categoriasPadrao = [
      { nome: 'Lanches', lojistaId },
      { nome: 'Bebidas', lojistaId },
      { nome: 'Porções', lojistaId },
      { nome: 'Sobremesas', lojistaId },
    ]

    try {
      for (const categoriaData of categoriasPadrao) {
        await criarCategoria(categoriaData)
      }

      logger.info('Categorias padrão de teste criadas com sucesso', {
        lojistaId,
        total: categoriasPadrao.length,
      })
    } catch (error) {
      logger.error('Erro ao criar categorias padrão de teste', {
        lojistaId,
        erro: error,
      })
    }
  }

  return {
    // Estado
    categorias,
    loading,
    error,

    // Getters
    isCategoriasLoaded,
    categoriasAtivas,
    categoriasPorId,

    // Ações
    fetchCategorias,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    clearCategorias,
    setLoading,
    inicializarCategoriasTeste,
  }
})
