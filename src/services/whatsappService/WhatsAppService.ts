import axios from 'axios'

export interface PedidoSimuladoDto {
  lojistaId: string
  nomeCliente: string
  produtos: Array<{
    nome: string
    quantidade: number
    preco: number
  }>
  total: number
  observacoes?: string
}

export class WhatsAppService {
  private readonly backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

  async simularRecebimentoPedido(pedido: PedidoSimuladoDto): Promise<void> {
    try {
      await axios.post(`${this.backendUrl}/api/whatsapp/simular-pedido`, pedido)
    } catch (error) {
      console.error('Erro ao simular recebimento de pedido:', error)
      throw error
    }
  }
}