export type PedidoModel = {
  id: string
  numero: number
  lojistaId: string
  tipoPagamento: 'dinheiro' | 'pix' | 'cartao-credito' | 'cartao-debito'
  itens: ItemPedido[]
  cliente: {
    nome: string
    telefone: string // WhatsApp
  }
  total: number
  dataCriacao: Date
  status: PedidoStatus
  dataInicioPreparo?: string
  dataInicioEnvio?: string

  tempoPreparoSegundos?: number
  tempoEnvioSegundos?: number
}

export type PedidoStatus = 'pendente' | 'em-preparo' | 'enviado' | 'concluido'

export type ItemPedido = {
  produtoId: string
  nome: string
  precoUnitario: number
  quantidade: number
  observacao?: string
}
