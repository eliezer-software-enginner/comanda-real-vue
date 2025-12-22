import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'

import { v4 as uuidv4 } from 'uuid'
import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { LojistaDto } from './LojistaDto'
import type { LojistaModel } from './LojistaModel'

export class LojistaService extends CrudService<LojistaDto, LojistaModel> {
  protected prepararDadosPreCriacao(dadoInicial: LojistaDto): LojistaModel {
    return {
      dtCriacao: new Date(),
      id: dadoInicial.id != undefined ? dadoInicial.id : '',
      logoUrl: '',
      nome: dadoInicial.nome,
      whatsapp: '',
      slug: uuidv4(),
      status: 'ativo',
    }
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, 'apps', 'comanda-real', 'lojistas', id)
  }

  protected getCollection(): CollectionReference<DocumentData, DocumentData> {
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

  async handleSalvar(model: LojistaModel): Promise<LojistaModel> {
    try {
      const lojistaId = model.id

      if (lojistaId) {
        // 1. Gera uma referência de documento vazia para obter o ID antes de salvar
        const ref = this.getDoc(lojistaId)
        model.id = lojistaId

        // 2. Salva tudo de uma vez
        await setDoc(ref, model)
        console.log(`Lojista ${lojistaId} salvo com sucesso!`)

        return model
      } else {
        const docRef = await addDoc(this.getCollection(), model)
        model.id = docRef.id
        console.log(`Lojista ${docRef.id} salvo com sucesso!`)
        return model
      }
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
