import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  type DocumentData,
} from 'firebase/firestore'

import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { CategoriaDto } from './CategoriaDto'
import type { CategoriaModel } from './CategoriaModel'

export class CategoriaService extends CrudService<CategoriaDto, CategoriaModel> {
  private lojistaId: string

  constructor(lojistaId: string) {
    super()
    this.lojistaId = lojistaId
  }

  protected prepararDadosPreCriacao(data: CategoriaDto): CategoriaModel {
    return {
      lojistaId: data.lojistaId,
      nome: data.nome,
      id: data.id || '',
      dtCriacao: new Date(),
      status: 'ativo',
    }
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    this.validarId(id)
    this.validarId(this.lojistaId)
    return doc(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'categorias', id)
  }

  protected getCollection(): CollectionReference<DocumentData, DocumentData> {
    this.validarId(this.lojistaId)
    return collection(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'categorias')
  }

  protected validarCriacao(model: Partial<CategoriaModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }
  }

  protected validarAtualizacao(model: Partial<CategoriaModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }
  }
}
