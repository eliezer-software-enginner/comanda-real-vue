export type PedidoModel = {
  id: string
  numero: number
  lojistaId: string
  tipoPagamento: TipoPagamento
  itens: ItemPedido[]
  cliente: Cliente
  total: number
  dataCriacao: Date
  status: PedidoStatus
  dataInicioPreparo?: string
  dataInicioEnvio?: string

  tempoPreparoSegundos?: number
  tempoEnvioSegundos?: number
}

export type TipoPagamento = 'dinheiro' | 'pix' | 'cartao-credito' | 'cartao-debito'

export type Cliente = {
  nome: string
  telefone: string // WhatsApp
}

export type PedidoStatus =
  | 'pendente'
  | 'em-preparo'
  | 'enviado'
  | 'pagamento-pendente'
  | 'concluido'

export type Intervalo = '24H' | '7dias' | '30dias'

export type ItemPedido = {
  produtoId: string
  nome: string
  precoUnitario: number
  quantidade: number
  observacao?: string
}
