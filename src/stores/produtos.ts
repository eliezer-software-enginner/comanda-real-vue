import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ProdutoModel,
  ProdutoStatus,
  ProdutoTipo,
} from '@/services/produtosService/ProdutosModel'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import logger from '@/plugins/logs'

export const useProdutosStore = defineStore('produtos', () => {
  // Estado
  const produtos = ref<ProdutoModel[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isProdutosLoaded = computed(() => produtos.value.length > 0)
  const produtosAtivos = computed(() => produtos.value.filter((p) => p.status === 'ativo'))
  const produtosPorCategoria = computed(() => {
    const agrupados: Record<string, ProdutoModel[]> = {}
    produtos.value.forEach((produto) => {
      if (!agrupados[produto.categoriaId]) {
        agrupados[produto.categoriaId] = []
      }
      agrupados[produto.categoriaId].push(produto)
    })
    return agrupados
  })

  // Ações
  async function fetchProdutos(lojistaId: string): Promise<void> {
    if (!lojistaId) {
      error.value = 'ID do lojista não fornecido'
      return
    }

    // Se já tem produtos carregados, não busca novamente
    if (produtos.value.length > 0 && produtos.value[0]?.lojistaId === lojistaId) {
      logger.info('Produtos já carregados no cache', { lojistaId })
      return
    }

    try {
      loading.value = true
      error.value = null

      // Verifica se é o lojista de teste e tenta buscar do localStorage primeiro
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Buscando produtos do lojista de teste no localStorage', { lojistaId })

        const produtosTeste = localStorage.getItem('produtos-teste')
        if (produtosTeste) {
          try {
            const data = JSON.parse(produtosTeste) as ProdutoModel[]
            produtos.value = data

            logger.info('Produtos de teste carregados do localStorage com sucesso', {
              lojistaId,
              total: data.length,
            })
            return
          } catch (parseErr) {
            logger.warn('Erro ao parsear produtos do lojista de teste do localStorage', {
              lojistaId,
              erro: parseErr,
            })
          }
        }

        logger.info('Produtos de teste não encontrados no localStorage, carregando do Firebase', {
          lojistaId,
        })
      }

      logger.info('Buscando produtos do lojista no Firebase', { lojistaId })

      const service = new ProdutosService(lojistaId)
      const data = await service.getLista()

      produtos.value = data

      logger.info('Produtos carregados com sucesso', {
        lojistaId,
        total: data.length,
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos'
      error.value = errorMessage

      logger.error('Erro ao buscar produtos', {
        lojistaId,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function criarProduto(produto: ProdutoDto): Promise<ProdutoModel> {
    try {
      loading.value = true
      error.value = null

      logger.info('Criando novo produto', {
        lojistaId: produto.lojistaId,
        nome: produto.nome,
      })

      const lojistaId = produto.lojistaId

      // Verifica se é o lojista de teste
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Criando produto do lojista de teste no localStorage')

        const novoProduto: ProdutoModel = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          lojistaId,
          categoriaId: produto.categoriaId,
          nome: produto.nome,
          descricao: produto.descricao,
          preco: produto.preco,
          imagemUrl: produto.imagemUrl,
          vendas: 0,
          dtCriacao: new Date(),
          status: 'ativo',
          tipo: produto.tipo,
          adicionaisIds: produto.adicionaisIds,
          acompanhamentosIds: produto.acompanhamentosIds,
        }

        produtos.value.push(novoProduto)

        // Salva no localStorage
        localStorage.setItem('produtos-teste', JSON.stringify(produtos.value))

        logger.info('Produto de teste criado com sucesso no localStorage', {
          produtoId: novoProduto.id,
          nome: novoProduto.nome,
        })

        return novoProduto
      } else {
        const service = new ProdutosService(lojistaId)
        const produtoModel = await service.criar(produto)
        produtos.value.push(produtoModel)

        logger.info('Produto criado com sucesso no Firebase', {
          produtoId: produtoModel.id,
          nome: produtoModel.nome,
        })

        return produtoModel
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto'
      error.value = errorMessage

      logger.error('Erro ao criar produto', {
        lojistaId: produto.lojistaId,
        nome: produto.nome,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function atualizarProduto(produto: ProdutoModel): Promise<void> {
    try {
      loading.value = true
      error.value = null

      logger.info('Atualizando produto', {
        produtoId: produto.id,
        nome: produto.nome,
      })

      // Verifica se é o lojista de teste
      if (produto.lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Atualizando produto do lojista de teste no localStorage')

        const index = produtos.value.findIndex((p) => p.id === produto.id)
        if (index !== -1) {
          produtos.value[index] = produto

          // Salva no localStorage
          localStorage.setItem('produtos-teste', JSON.stringify(produtos.value))

          logger.info('Produto de teste atualizado com sucesso no localStorage', {
            produtoId: produto.id,
            nome: produto.nome,
          })
        } else {
          throw new Error('Produto não encontrado')
        }
      } else {
        const service = new ProdutosService(produto.lojistaId)
        await service.atualizar(produto)

        const index = produtos.value.findIndex((p) => p.id === produto.id)
        if (index !== -1) {
          produtos.value[index] = produto
        }

        logger.info('Produto atualizado com sucesso no Firebase', {
          produtoId: produto.id,
          nome: produto.nome,
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto'
      error.value = errorMessage

      logger.error('Erro ao atualizar produto', {
        produtoId: produto.id,
        nome: produto.nome,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  async function excluirProduto(produtoId: string, lojistaId: string): Promise<void> {
    try {
      loading.value = true
      error.value = null

      logger.info('Excluindo produto', { produtoId })

      // Verifica se é o lojista de teste
      if (lojistaId === 'TESTE_DEV_LOJA') {
        logger.info('Excluindo produto do lojista de teste no localStorage')

        produtos.value = produtos.value.filter((p) => p.id !== produtoId)

        // Salva no localStorage
        localStorage.setItem('produtos-teste', JSON.stringify(produtos.value))

        logger.info('Produto de teste excluído com sucesso no localStorage', {
          produtoId,
        })
      } else {
        const service = new ProdutosService(lojistaId)
        await service.excluir(produtoId)

        produtos.value = produtos.value.filter((p) => p.id !== produtoId)

        logger.info('Produto excluído com sucesso no Firebase', {
          produtoId,
        })
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto'
      error.value = errorMessage

      logger.error('Erro ao excluir produto', {
        produtoId,
        erro: err,
      })

      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  function clearProdutos(): void {
    produtos.value = []
    error.value = null
    loading.value = false

    logger.info('Store de produtos limpo')
  }

  function setLoading(loadingState: boolean): void {
    loading.value = loadingState
  }

  return {
    // Estado
    produtos,
    loading,
    error,

    // Getters
    isProdutosLoaded,
    produtosAtivos,
    produtosPorCategoria,

    // Ações
    fetchProdutos,
    criarProduto,
    atualizarProduto,
    excluirProduto,
    clearProdutos,
    setLoading,
  }
})
