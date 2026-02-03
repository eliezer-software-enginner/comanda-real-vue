import type { Endereco, HorariosFuncionamento } from './LojistaModel'

/**
 * Este DTO refere-se aos dados básicos do lojista antes de se tornar @LojistaModel
 */
export type LojistaDto = {
  instagram?: string
  nome: string
  categoria?: string
  whatsapp?: string
  fotoUrl?: string
  endereco?: Endereco
  id?: string
  slug?: string

  formasPagamento?: {
    dinheiro: boolean
    pix: boolean
    cartaoCredito: boolean
    cartaoDebito: boolean
    valeRefeicao: boolean
  }

  aceitaDelivery?: boolean
  taxaEntrega?: number
  pedidoMinimo?: number
  cepsAtendidos?: string[]

  /**@deprecated @since 7 de janeiro */
  horariosFuncionamento?: HorariosFuncionamento[]
  horarioFuncionamento?: {
    segunda?: DiaHorario | null
    terca?: DiaHorario | null
    quarta?: DiaHorario | null
    quinta?: DiaHorario | null
    sexta?: DiaHorario | null
    sabado?: DiaHorario | null
    domingo?: DiaHorario | null
  }
}

type DiaHorario = {
  abertura: string
  fechamento: string
}
