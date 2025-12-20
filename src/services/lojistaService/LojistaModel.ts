export interface LojistaModel {
  id: string
  nome: string
  logoUrl: string
  whatsapp: string
  slug: string
  dtCriacao: Date
  status: StatusLoja
}

type StatusLoja = 'ativo' | 'excluido' | 'suspenso'
