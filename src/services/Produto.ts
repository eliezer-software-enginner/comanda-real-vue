export interface Product {
  id: string | number
  nome: string
  preco: number
  descricao?: string
  categoria: string
  imagemUrl?: string
}
