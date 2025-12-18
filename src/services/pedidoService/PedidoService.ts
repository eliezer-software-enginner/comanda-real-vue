import {
  addDoc,
  collection,
  CollectionReference,
  getDocs,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { PedidoModel, PedidoStatus } from './PedidoModel'

export class PedidoService extends CrudService<PedidoModel> {
  protected validarCriacao(model: Omit<PedidoModel, 'id'>): void {
    if (model.itens.length == 0) {
      throw new Error('Pedido está vazio')
    }
  }

  protected validarAtualizacao(model: Partial<PedidoModel>): void {
    if (
      model.status &&
      !['pendente', 'em-preparo', 'enviado', 'concluido'].includes(model.status)
    ) {
      throw new Error('Status inválido')
    }
  }

  listenPedidos(lojistaId: string, callback: (pedidos: PedidoModel[]) => void): Unsubscribe {
    const pedidosRef = this.getCollection(lojistaId)
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

    const pedidosRef = this.getCollection(lojistaId)
    const q = query(pedidosRef, where('status', '==', status))
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PedidoModel[]
  }
  protected async handleSalvar(pedido: Omit<PedidoModel, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.getCollection(pedido.lojistaId), pedido)
      console.log(`Pedido ${docRef.id} salvo com sucesso!`)
      return docRef.id
    } catch (error) {
      console.error('Erro ao salvar dados completos:', error)
      throw error
    }
  }

  protected getCollection(lojaId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas', lojaId, 'pedidos')
  }

  async mudarStatus(lojistaId: string, pedido: PedidoModel, novoStatus: PedidoStatus) {
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

    return this.atualizar(lojistaId, dadosAtualizacao)
  }
}
