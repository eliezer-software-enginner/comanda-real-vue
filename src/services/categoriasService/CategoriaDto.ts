/**
 * Este DTO refere-se aos dados básicos do lojista antes de se tornar @CategoriaModel
 */
export interface CategoriaDto {
  nome: string
  lojistaId: string
  id?: string
}
