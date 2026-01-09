import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import logger from '@/plugins/logs'
import type { PedidoModel } from '@/services/pedidoService/PedidoModel'

export class ExportService {
  private readonly label = 'ExportService'

  async gerarPDF(pedido: PedidoModel): Promise<Blob> {
    const method = 'gerarPDF'
    try {
      logger.info(this.label, method, 'Iniciando geração de PDF', { pedidoId: pedido.id })

      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let yPosition = 20

      // Cabeçalho
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      const titleText = 'Comanda Real'
      const titleWidth = pdf.getTextWidth(titleText)
      // @ts-ignore
      pdf.text(titleText, (pageWidth - titleWidth) / 2, yPosition)

      yPosition += 15
      pdf.setFontSize(16)
      const pedidoText = `Pedido #${pedido.numero}`
      const pedidoWidth = pdf.getTextWidth(pedidoText)
      // @ts-ignore
      pdf.text(pedidoText, (pageWidth - pedidoWidth) / 2, yPosition)

      // Informações do cliente
      yPosition += 20
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      // @ts-ignore
      pdf.text(`Cliente: ${pedido.cliente.nome}`, 20, yPosition)
      yPosition += 8
      // @ts-ignore
      pdf.text(`Telefone: ${pedido.cliente.telefone}`, 20, yPosition)

      // Data e status
      yPosition += 8
      // @ts-ignore
      pdf.text(`Data: ${new Date(pedido.dataCriacao).toLocaleString('pt-BR')}`, 20, yPosition)
      yPosition += 8
      // @ts-ignore
      pdf.text(`Status: ${this.formatarStatus(pedido.status)}`, 20, yPosition)
      yPosition += 8
      // @ts-ignore
      pdf.text(`Pagamento: ${this.formatarTipoPagamento(pedido.tipoPagamento)}`, 20, yPosition)

      // Linha separadora
      yPosition += 12
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 10

      // Itens do pedido
      pdf.setFont('helvetica', 'bold')
      // @ts-ignore
      pdf.text('Itens do Pedido:', 20, yPosition)
      yPosition += 10

      pdf.setFont('helvetica', 'normal')
      pedido.itens.forEach((item, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        // @ts-ignore
        pdf.text(`${item.quantidade}x ${item.nome}`, 20, yPosition)
        yPosition += 6

        if (item.observacao) {
          pdf.setFontSize(10)
          // @ts-ignore
          pdf.text(`Obs: ${item.observacao}`, 25, yPosition)
          yPosition += 6
          pdf.setFontSize(12)
        }

        // @ts-ignore
        pdf.text(`R$ ${item.precoUnitario.toFixed(2)} cada`, 25, yPosition)
        yPosition += 8
      })

      // Total
      yPosition += 10
      pdf.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 10
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      const totalText = `Total: R$ ${pedido.total.toFixed(2)}`
      const totalWidth = pdf.getTextWidth(totalText)
      // @ts-ignore
      pdf.text(totalText, pageWidth - totalWidth - 20, yPosition)

      // Tempos de preparo/envio (se existirem)
      if (pedido.tempoPreparoSegundos || pedido.tempoEnvioSegundos) {
        yPosition += 20
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')

        if (pedido.tempoPreparoSegundos) {
          // @ts-ignore
          pdf.text(
            `Tempo de preparo: ${this.formatarTempo(pedido.tempoPreparoSegundos)}`,
            20,
            yPosition,
          )
          yPosition += 6
        }

        if (pedido.tempoEnvioSegundos) {
          // @ts-ignore
          pdf.text(
            `Tempo de envio: ${this.formatarTempo(pedido.tempoEnvioSegundos)}`,
            20,
            yPosition,
          )
          yPosition += 6
        }

        if (pedido.tempoEnvioSegundos) {
          pdf.text(
            `Tempo de envio: ${this.formatarTempo(pedido.tempoEnvioSegundos)}`,
            20,
            yPosition,
          )
          yPosition += 6
        }
      }

      logger.info(this.label, method, 'PDF gerado com sucesso', { pedidoId: pedido.id })
      return pdf.output('blob')
    } catch (error) {
      logger.error(this.label, method, 'Erro ao gerar PDF', { error, pedidoId: pedido.id })
      throw new Error('Não foi possível gerar o PDF do pedido')
    }
  }

  async gerarPNG(pedido: PedidoModel): Promise<Blob> {
    const method = 'gerarPNG'
    try {
      logger.info(this.label, method, 'Iniciando geração de PNG', { pedidoId: pedido.id })

      // Criar elemento HTML temporário
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '400px'
      container.style.padding = '20px'
      container.style.backgroundColor = 'white'
      container.style.fontFamily = 'Arial, sans-serif'
      container.style.fontSize = '12px'

      container.innerHTML = this.criarTemplateHTML(pedido)
      document.body.appendChild(container)

      try {
        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              throw new Error('Não foi possível converter canvas para blob')
            }
          }, 'image/png')
        })

        logger.info(this.label, method, 'PNG gerado com sucesso', { pedidoId: pedido.id })
        return blob
      } finally {
        document.body.removeChild(container)
      }
    } catch (error) {
      logger.error(this.label, method, 'Erro ao gerar PNG', { error, pedidoId: pedido.id })
      throw new Error('Não foi possível gerar o PNG do pedido')
    }
  }

  async gerarPDFLista(pedidos: PedidoModel[]): Promise<Blob> {
    const method = 'gerarPDFLista'
    try {
      logger.info(this.label, method, 'Iniciando geração de PDF em lote', {
        quantidade: pedidos.length,
      })

      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      let yPosition = 20

      pedidos.forEach((pedido, index) => {
        if (yPosition > 200) {
          pdf.addPage()
          yPosition = 20
        }

        // Cabeçalho do pedido
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        // @ts-ignore
        pdf.text(`Pedido #${pedido.numero}`, 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        // @ts-ignore
        pdf.text(`Cliente: ${pedido.cliente.nome}`, 20, yPosition)
        yPosition += 6
        // @ts-ignore
        pdf.text(`Data: ${new Date(pedido.dataCriacao).toLocaleString('pt-BR')}`, 20, yPosition)
        yPosition += 6
        // @ts-ignore
        pdf.text(`Status: ${this.formatarStatus(pedido.status)}`, 20, yPosition)
        yPosition += 6
        // @ts-ignore
        pdf.text(`Total: R$ ${pedido.total.toFixed(2)}`, 20, yPosition)

        // Itens resumidos
        yPosition += 8
        // @ts-ignore
        pdf.text(`Itens (${pedido.itens.length}):`, 20, yPosition)
        yPosition += 6

        pedido.itens.slice(0, 3).forEach((item) => {
          // @ts-ignore
          pdf.text(`• ${item.quantidade}x ${item.nome}`, 25, yPosition)
          yPosition += 5
        })

        if (pedido.itens.length > 3) {
          // @ts-ignore
          pdf.text(`• ... e mais ${pedido.itens.length - 3} itens`, 25, yPosition)
          yPosition += 5
        }

        yPosition += 10

        // Linha separadora entre pedidos
        if (index < pedidos.length - 1) {
          pdf.line(20, yPosition, pageWidth - 20, yPosition)
          yPosition += 10
        }
      })

      logger.info(this.label, method, 'PDF em lote gerado com sucesso', {
        quantidade: pedidos.length,
      })
      return pdf.output('blob')
    } catch (error) {
      logger.error(this.label, method, 'Erro ao gerar PDF em lote', { error })
      throw new Error('Não foi possível gerar o PDF da lista de pedidos')
    }
  }

  private criarTemplateHTML(pedido: PedidoModel): string {
    return `
      <div style="border: 2px solid #333; padding: 20px; background: white;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Comanda Real</h1>
          <h2 style="margin: 5px 0; font-size: 18px;">Pedido #${pedido.numero}</h2>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="margin-bottom: 5px;"><strong>Cliente:</strong> ${pedido.cliente.nome}</div>
          <div style="margin-bottom: 5px;"><strong>Telefone:</strong> ${pedido.cliente.telefone}</div>
          <div style="margin-bottom: 5px;"><strong>Data:</strong> ${new Date(pedido.dataCriacao).toLocaleString('pt-BR')}</div>
          <div style="margin-bottom: 5px;"><strong>Status:</strong> ${this.formatarStatus(pedido.status)}</div>
          <div style="margin-bottom: 5px;"><strong>Pagamento:</strong> ${this.formatarTipoPagamento(pedido.tipoPagamento)}</div>
        </div>
        
        <div style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 10px 0; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px;">Itens do Pedido:</h3>
          ${pedido.itens
            .map(
              (item) => `
            <div style="margin-bottom: 10px;">
              <div style="font-weight: bold;">${item.quantidade}x ${item.nome}</div>
              ${item.observacao ? `<div style="font-size: 10px; color: #666;">Obs: ${item.observacao}</div>` : ''}
              <div style="font-size: 10px;">R$ ${item.precoUnitario.toFixed(2)} cada</div>
            </div>
          `,
            )
            .join('')}
        </div>
        
        <div style="text-align: right; font-size: 18px; font-weight: bold;">
          Total: R$ ${pedido.total.toFixed(2)}
        </div>
        
        ${
          pedido.tempoPreparoSegundos || pedido.tempoEnvioSegundos
            ? `
          <div style="margin-top: 20px; font-size: 10px; color: #666;">
            ${pedido.tempoPreparoSegundos ? `<div>Tempo de preparo: ${this.formatarTempo(pedido.tempoPreparoSegundos)}</div>` : ''}
            ${pedido.tempoEnvioSegundos ? `<div>Tempo de envio: ${this.formatarTempo(pedido.tempoEnvioSegundos)}</div>` : ''}
          </div>
        `
            : ''
        }
      </div>
    `
  }

  private formatarStatus(status: PedidoModel['status']): string {
    const statusMap = {
      pendente: 'Pendente',
      'em-preparo': 'Em Preparo',
      enviado: 'Enviado',
      'pagamento-pendente': 'Pagamento Pendente',
      concluido: 'Concluído',
    }
    return statusMap[status] || status
  }

  private formatarTipoPagamento(tipo: PedidoModel['tipoPagamento']): string {
    const tipoMap = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      'cartao-credito': 'Cartão de Crédito',
      'cartao-debito': 'Cartão de Débito',
    }
    return tipoMap[tipo] || tipo
  }

  private formatarTempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos}m ${segundosRestantes}s`
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
