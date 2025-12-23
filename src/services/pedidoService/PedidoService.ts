import {
  addDoc,
  collection,
  CollectionReference,
  DocumentReference,
  getDocs,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'

import logger from '@/plugins/logs'
import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import { ProdutosService } from '../produtosService/ProdutosService'
import type { PedidoDto } from './PedidoDto'
import type { Intervalo, PedidoModel, PedidoStatus } from './PedidoModel'

export class PedidoService extends CrudService<PedidoDto, PedidoModel> {
  private lojistaId: string

  constructor(lojistaId: string) {
    super()
    this.lojistaId = lojistaId
  }

  protected prepararDadosPreCriacao(data: PedidoDto): PedidoModel {
    let total = 0

    for (const produto of data.itens) {
      total += produto.precoUnitario * produto.quantidade
    }
    return {
      cliente: data.cliente,
      dataCriacao: new Date(),
      id: '',
      itens: data.itens,
      lojistaId: data.lojistaId,
      numero: Date.now(),
      status: 'pendente',
      tipoPagamento: data.tipoPagamento,
      total: total,
    }
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    throw new Error('Method not implemented.')
  }

  protected validarCriacao(model: Omit<PedidoModel, 'id'>): void {
    if (model.itens.length == 0) {
      throw new Error('Pedido está vazio')
    }
  }

  protected validarAtualizacao(model: Partial<PedidoModel>): void {
    if (
      model.status &&
      !['pendente', 'em-preparo', 'enviado', 'pagamento-pendente', 'concluido'].includes(
        model.status,
      )
    ) {
      throw new Error('Status inválido')
    }
  }

  listenPedidos(lojistaId: string, callback: (pedidos: PedidoModel[]) => void): Unsubscribe {
    const pedidosRef = this.getCollection()
    // Criamos uma query para pegar todos os pedidos ativos (não finalizados, por exemplo)
    const q = query(pedidosRef)

    return onSnapshot(q, (snapshot) => {
      const pedidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PedidoModel[]
      callback(pedidos)
    })
  }

  async getPedidosByStatus(lojistaId: string, status: PedidoStatus): Promise<PedidoModel[]> {
    this.validarId(lojistaId)

    const pedidosRef = this.getCollection()
    const q = query(pedidosRef, where('status', '==', status))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PedidoModel[]
  }

  async getTotalPedidosByStatus(status: PedidoStatus): Promise<number> {
    logger.info('tentativa de obter volume de pedidos por status', {
      label: 'PedidoService',
      method: 'getTotalPedidosByStatus',
      dado: {
        status: status,
      },
    })

    this.validarId(this.lojistaId)

    const pedidosRef = this.getCollection()
    const q = query(pedidosRef, where('status', '==', status))
    const snapshot = await getDocs(q)

    logger.info('volume de pedidos buscado com sucesso', {
      label: 'PedidoService',
      method: 'getTotalPedidosByStatus',
      dado: {
        status: status,
        quantidade: snapshot.size,
      },
    })

    return snapshot.size
  }

  async getTotalPedidosByTempo(intervalo: Intervalo): Promise<number> {
    logger.info('tentativa de obter volume de pedidos dado determinado intervalo', {
      label: 'PedidoService',
      method: 'getTotalPedidosByTempo',
      dado: {
        intervalo: intervalo,
      },
    })

    this.validarId(this.lojistaId)

    const agora = new Date()
    const dataInicio = new Date()

    // Cálculo do intervalo
    if (intervalo === '24H') {
      dataInicio.setHours(agora.getHours() - 24)
    } else if (intervalo === '7dias') {
      dataInicio.setDate(agora.getDate() - 7)
    } else if (intervalo === '30dias') {
      dataInicio.setDate(agora.getDate() - 30)
    }

    const pedidosRef = this.getCollection()

    const q = query(pedidosRef, where('dataCriacao', '>=', dataInicio))

    const snapshot = await getDocs(q)

    logger.info('volume de pedidos buscado com sucesso', {
      label: 'PedidoService',
      method: 'getTotalPedidosByTempo',
      dado: {
        intervalo: intervalo,
        quantidade: snapshot.size,
      },
    })

    return snapshot.size
  }

  /**@override */
  protected async handleSalvar(pedido: PedidoModel): Promise<PedidoModel> {
    try {
      const docRef = await addDoc(this.getCollection(), pedido)

      // Para cada item do pedido, incrementa o contador no serviço de produtos
      const produtosService = new ProdutosService(pedido.lojistaId)
      const promises = pedido.itens.map((item) =>
        produtosService.incrementarContador(item.produtoId),
      )

      await Promise.all(promises)

      logger.info(`Pedido ${docRef.id} salvo com sucesso!`)
      pedido.id = docRef.id
      return pedido
    } catch (error) {
      logger.error('Erro ao salvar dados completos:', error)
      throw error
    }
  }

  protected getCollection(): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'pedidos')
  }

  async mudarStatus(pedido: PedidoModel, novoStatus: PedidoStatus) {
    logger.info('mudando status do pedido', {
      label: 'PedidoService',
      method: 'mudarStatus',
      dado: {
        statusAtual: pedido.status,
        novoStatus: novoStatus,
      },
    })

    const agora = new Date()
    const dadosAtualizacao: any = {
      id: pedido.id,
      status: novoStatus,
    }

    // 1. Iniciando Preparo (Vindo de Pendente)
    if (novoStatus === 'em-preparo') {
      dadosAtualizacao.dataInicioPreparo = agora.toISOString()
    }

    // 2. Finalizando Preparo e Iniciando Envio (Vindo de Em Preparo)
    if (novoStatus === 'enviado') {
      dadosAtualizacao.dataInicioEnvio = agora.toISOString()

      // Calcula quanto tempo ficou em preparo
      if (pedido.dataInicioPreparo) {
        const inicio = new Date(pedido.dataInicioPreparo).getTime()
        const fim = agora.getTime()
        dadosAtualizacao.tempoPreparoSegundos = Math.floor((fim - inicio) / 1000)
      }
    }

    // 3. Finalizando o Pedido (Vindo de Enviado)
    if (novoStatus === 'concluido') {
      // Caso você tenha um status final
      dadosAtualizacao.dataFinalizacao = agora.toISOString()

      // Calcula quanto tempo ficou no envio/entrega
      if (pedido.dataInicioEnvio) {
        const inicio = new Date(pedido.dataInicioEnvio).getTime()
        const fim = agora.getTime()
        dadosAtualizacao.tempoEnvioSegundos = Math.floor((fim - inicio) / 1000)
      }
    }

    return this.atualizar(dadosAtualizacao)
  }
}
