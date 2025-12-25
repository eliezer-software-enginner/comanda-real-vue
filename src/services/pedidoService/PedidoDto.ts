import type { Cliente, ItemPedido, TipoPagamento } from './PedidoModel'

/**
 * Este DTO refere-se aos dados básicos do pedido antes de se tornar @PedidoModel
 */
export type PedidoDto = {
  lojistaId: string
  tipoPagamento: TipoPagamento
  itens: ItemPedido[]
  cliente: Cliente
}
