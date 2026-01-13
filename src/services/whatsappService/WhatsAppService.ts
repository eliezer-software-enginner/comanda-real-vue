import axios from 'axios'

//pedido recebido no Whatsapp do lojista
export interface RecebimentoPedidoLojista {
  nomeCliente: string
  telefoneCliente: string
  telefoneLojista: string
  produtos: Array<{
    nome: string
    quantidade: number
    preco: number
  }>
  total: number
  observacoes?: string
}

export class WhatsAppService {
  private readonly backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9002'

  async simularRecebimentoPedido(whatsapp: string | undefined): Promise<void> {
    if (whatsapp == undefined || whatsapp.trim() === '')
      throw new Error(
        'Seu Whatsapp não foi definido: defina-o em Configurações > WhatsApp para Pedidos',
      )
    const pedido: RecebimentoPedidoLojista = {
      nomeCliente: 'Cliente Teste',
      telefoneCliente: '5532998008182',
      telefoneLojista: whatsapp,
      produtos: [
        {
          nome: 'Hambúrguer Clássico',
          quantidade: 2,
          preco: 25.9,
        },
        {
          nome: 'Batata Frita',
          quantidade: 1,
          preco: 12.5,
        },
        {
          nome: 'Refrigerante Coca-Cola',
          quantidade: 2,
          preco: 8.0,
        },
      ],
      total: 46.4,
      observacoes: 'Sem cebola no hambúrguer, por favor!',
    }
    try {
      await axios.post(`${this.backendUrl}/api/whatsapp/simular-pedido`, pedido)
    } catch (error) {
      console.error('Erro ao simular recebimento de pedido:', error)
      throw error
    }
  }

  //any por enquanto
  async enviarPedido(pedido: any): Promise<void> {
    try {
      await axios.post(`${this.backendUrl}/api/whatsapp/simular-pedido`, pedido)
    } catch (error) {
      console.error('Erro ao simular recebimento de pedido:', error)
      throw error
    }
  }
}
