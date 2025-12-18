import { addDoc, collection, CollectionReference, type DocumentData } from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { PedidoModel } from './PedidoModel'

export class PedidoService extends CrudService<PedidoModel> {
  protected validarCriacao(model: Omit<PedidoModel, 'id'>): void {
    if (model.itens.length == 0) {
      throw new Error('Pedido está vazio')
    }
  }

  protected validarAtualizacao(model: Partial<PedidoModel>): void {
    if (model.status && !['pendente', 'em-preparo', 'enviado'].includes(model.status)) {
      throw new Error('Status inválido')
    }
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
