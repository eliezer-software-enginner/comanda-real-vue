export interface LojistaModel {
  id: string
  nome: string
  logoUrl: string
  whatsapp: string
  slug: string
  dtCriacao: Date
  status: StatusLoja
  horariosFuncionamento?: HorariosFuncionamento[]
}

type StatusLoja = 'ativo' | 'excluido' | 'suspenso'
export type HorariosFuncionamento = {
  de: string
  ate: string
}
