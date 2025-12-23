export interface ProdutoModel {
  id: string
  lojistaId: string
  categoriaId: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  vendas: number
  dtCriacao: Date
  status: ProdutoStatus
}

export type ProdutoStatus = 'ativo' | 'arquivado' | 'excluido' | 'suspenso'
