import type { HorariosFuncionamento } from './LojistaModel'

/**
 * Este DTO refere-se aos dados básicos do lojista antes de se tornar @LojistaModel
 */
export type LojistaDto = {
  nome: string
  whatsapp?: string
  id?: string
  slug?: string
  horariosFuncionamento?: HorariosFuncionamento[]
}
