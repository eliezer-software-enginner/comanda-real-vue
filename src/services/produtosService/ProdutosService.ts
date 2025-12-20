import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { ProdutoModel } from './ProdutosModel'

export class ProdutosService extends CrudService<ProdutoModel> {
  private lojistaId: string

  constructor(lojistaId: string) {
    super()
    this.lojistaId = lojistaId
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'produtos', id)
  }
  protected getCollection(lojaId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas', lojaId, 'produtos')
  }

  async handleSalvar(produto: Omit<ProdutoModel, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(this.getCollection(produto.lojistaId), produto)
      const id = docRef.id

      const prd: ProdutoModel = {
        id: docRef.id,
        ...produto,
      }

      console.log(`Produto ${id} salvo com sucesso!`)

      await setDoc(this.getDoc(id), prd)

      console.log(`Id atribuido ao protudo com sucesso!`)

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
