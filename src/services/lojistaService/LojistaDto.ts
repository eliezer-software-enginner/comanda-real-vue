import type { HorariosFuncionamento } from './LojistaModel'

export type LojistaDto = {
  nome: string
  whatsapp?: string
  id?: string
  slug?: string
  horariosFuncionamento?: HorariosFuncionamento[]
}
