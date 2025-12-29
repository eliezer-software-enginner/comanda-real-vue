import type { ProdutoTipo } from './ProdutosModel'

/**
 * Este DTO refere-se aos dados básicos do produto antes de se tornar @ProdutoModel
 */
export interface ProdutoDto {
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  lojistaId: string
  categoriaId: string
  id?: string
  tipo: ProdutoTipo
}
