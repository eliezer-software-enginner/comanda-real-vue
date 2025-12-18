import { addDoc, collection, CollectionReference, type DocumentData } from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { ProdutoModel } from './ProdutosModel'

export class ProdutosService extends CrudService<ProdutoModel> {
  protected getCollection(lojaId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas', lojaId, 'produtos')
  }

  async handleSalvar(produto: Omit<ProdutoModel, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.getCollection(produto.lojistaId), produto)
      console.log(`Produto ${docRef.id} salvo com sucesso!`)
      return docRef.id
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      throw error
    }
  }

  protected validarCriacao(model: Omit<ProdutoModel, 'id'>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }

    if (!model.preco || model.preco <= 0) {
      throw new Error('Preço inválido')
    }
  }

  protected validarAtualizacao(model: Partial<ProdutoModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }

    if (!model.preco || model.preco <= 0) {
      throw new Error('Preço inválido')
    }
  }
}
