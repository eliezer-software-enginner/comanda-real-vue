/**
 * Este DTO refere-se aos dados básicos do lojista antes de se tornar @ProdutoModel
 */
export interface ProdutoDto {
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  lojistaId: string
  categoriaId: string
  id?: string
}
