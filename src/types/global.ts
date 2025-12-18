import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'

export interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  categoria: string
  imagemUrl?: string
}

export interface Cardapio {
  id: string // lojaId
  nomeLoja: string
  fotoUrl?: string
  whatsapp?: string // Número do lojista para receber pedidos
  produtos: ProdutoModel[]
}

export interface ItemPedido {
  produtoId: string
  nome: string
  precoUnitario: number
  quantidade: number
  observacao?: string
}

export interface Pedido {
  id: string
  lojaId: string
  cliente: {
    nome: string
    telefone: string // WhatsApp
  }
  itens: ItemPedido[]
  total: number
  dataCriacao: Date
  status: 'pendente' | 'enviado'
}
