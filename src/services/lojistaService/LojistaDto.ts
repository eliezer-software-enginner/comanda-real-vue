import type { HorariosFuncionamento } from './LojistaModel'

export type LojistaDto = {
  nome: string
  whatsapp?: string
  id?: string
  horariosFuncionamento?: HorariosFuncionamento[]
}
