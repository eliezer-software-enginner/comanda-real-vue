export type PedidoModel = {
  id: string
  lojistaId: string
  tipoPagamento: 'dinheiro' | 'pix' | 'cartao-credito' | 'cartao-debito'
  itens: ItemPedido[]
  cliente: {
    nome: string
    telefone: string // WhatsApp
  }
  total: number
  dataCriacao: Date
  status: 'pendente' | 'em-preparo' | 'enviado'
}

export type ItemPedido = {
  produtoId: string
  nome: string
  precoUnitario: number
  quantidade: number
  observacao?: string
}
