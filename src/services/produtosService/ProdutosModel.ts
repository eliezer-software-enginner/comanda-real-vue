export interface ProdutoModel {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagemUrl: string
  lojistaId: string
  vendas: number
  dtCriacao: Date
  status: ProdutoStatus
}

export type ProdutoStatus = 'ativo' | 'arquivado' | 'excluido' | 'suspenso'
