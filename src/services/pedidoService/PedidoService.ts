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

  async mudarStatus(lojistaId: string, pedidoId: string, status: PedidoModel['status']) {
    return this.atualizar(lojistaId, {
      id: pedidoId,
      status,
    })
  }
}
