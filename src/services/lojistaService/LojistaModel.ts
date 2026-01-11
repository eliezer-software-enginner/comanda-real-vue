export interface LojistaModel {
  id: string

  nomeLoja: string
  categoria: string
  whatsapp: string
  slug: string
  dtCriacao: Date
  status: StatusLoja
  /**@deprecated @since 7 de janeiro */
  horariosFuncionamento?: HorariosFuncionamento[]
  fotoUrl: string

  endereco: Endereco

  /**
   * Analisar posteriormente
   */
  //coloquei como possivel undefined, porque pode ser que não esteja definido ainda
  horarioFuncionamento?: {
    segunda?: { abertura: string; fechamento: string } | null
    terca?: { abertura: string; fechamento: string } | null
    quarta?: { abertura: string; fechamento: string } | null
    quinta?: { abertura: string; fechamento: string } | null
    sexta?: { abertura: string; fechamento: string } | null
    sabado?: { abertura: string; fechamento: string } | null
    domingo?: { abertura: string; fechamento: string } | null
  }

  formasPagamento: {
    dinheiro: boolean
    pix: boolean
    cartaoCredito: boolean
    cartaoDebito: boolean
    valeRefeicao: boolean
  }

  aceitaDelivery: boolean
  taxaEntrega: number
  pedidoMinimo: number
  instagram: string //considerar um lugar mais apropriado
}

type StatusLoja = 'ativo' | 'excluido' | 'suspenso'

/**@deprecated @since 7 de janeiro */
export type HorariosFuncionamento = {
  de: string
  ate: string
}

export type Endereco = {
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  complemento?: string
}
