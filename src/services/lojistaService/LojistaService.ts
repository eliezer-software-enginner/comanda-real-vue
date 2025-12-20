import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  type DocumentData,
} from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { LojistaModel } from './LojistaModel'

export class LojistaService extends CrudService<LojistaModel> {
  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, 'apps', 'comanda-real', 'lojistas', id)
  }
  protected getCollection(lojaId: string): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas')
  }

  public async getData(lojaId: string): Promise<LojistaModel | null> {
    const snap = await getDoc(this.getDoc(lojaId))
    if (!snap.exists()) return null
    const data = snap.data() as LojistaModel

    return {
      id: snap.id,
      dtCriacao: data.dtCriacao,
      logoUrl: data.logoUrl,
      nome: data.nome,
      slug: data.slug,
      status: data.status,
      whatsapp: data.whatsapp,
    }
  }

  async handleSalvar(lojista: Omit<LojistaModel, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'apps', 'comanda-real', 'lojistas'), lojista)
      console.log(`Lojista ${docRef.id} salvo com sucesso!`)
      return docRef.id
    } catch (error) {
      console.error('Erro ao salvar lojista:', error)
      throw error
    }
  }

  protected validarCriacao(model: Omit<LojistaModel, 'id'>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }
  }

  protected validarAtualizacao(model: Partial<LojistaModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }
  }
}
