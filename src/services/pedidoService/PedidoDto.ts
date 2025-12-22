import type { Cliente, ItemPedido, TipoPagamento } from './PedidoModel'

export type PedidoDto = {
  lojistaId: string
  tipoPagamento: TipoPagamento
  itens: ItemPedido[]
  cliente: Cliente
}
