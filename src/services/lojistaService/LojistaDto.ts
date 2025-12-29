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

  horariosFuncionamento?: HorariosFuncionamento[]
  horarioFuncionamento?: {
    segunda?: { abertura: string; fechamento: string } | null
    terca?: { abertura: string; fechamento: string } | null
    quarta?: { abertura: string; fechamento: string } | null
    quinta?: { abertura: string; fechamento: string } | null
    sexta?: { abertura: string; fechamento: string } | null
    sabado?: { abertura: string; fechamento: string } | null
    domingo?: { abertura: string; fechamento: string } | null
  }
}
