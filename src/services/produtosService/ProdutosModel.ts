export interface ProdutoModel {
  id: string
  nome: string
  descricao: string
  preco: string
  categoria: string
  imagemUrl?: string
  lojistaId: string
  vendas: number
}
