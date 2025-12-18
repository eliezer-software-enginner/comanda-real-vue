import type { PedidoModel } from './pedidoService/PedidoModel'

export class ZapProcessor {
  /**
   * Simula o envio de um pedido para o WhatsApp.
   * Em produção, isso chamaria uma API externa (ex: Twilio, Evolution API).
   */
  static async enviarPedido(pedido: PedidoModel, whatsappDestino: string): Promise<boolean> {
    console.log('--- SIMULAÇÃO DE ENVIO ZAP ---')
    console.log(`DESTINO: ${whatsappDestino}`)
    console.log('PAYLOAD:', JSON.stringify(pedido, null, 2))
    console.log('------------------------------')

    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log('✅ Pedido enviado com sucesso para a fila de processamento simulada.')
    return true
  }
}
