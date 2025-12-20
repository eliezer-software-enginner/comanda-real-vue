export interface ProdutoModel {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagemUrl?: string
  lojistaId: string
  contador: number
}
