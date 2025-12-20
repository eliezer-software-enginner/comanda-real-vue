import {
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  updateDoc,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore'

type Identificavel = {
  id: string
}

export abstract class CrudService<T extends Identificavel> {
  protected abstract getCollection(lojaId: string): CollectionReference<DocumentData, DocumentData>
  protected abstract getDoc(id: string): DocumentReference<DocumentData, DocumentData>

  // ---------- CREATE ----------
  async salvar(model: Omit<T, 'id'>): Promise<string> {
    this.validarCriacao(model)
    return this.handleSalvar(model)
  }

  async excluir(id: string) {
    this.validarId(id)

    try {
      await deleteDoc(this.getDoc(id))
    } catch (e: any) {
      throw new Error('Error on delete doc')
    }
  }

  protected abstract handleSalvar(model: Omit<T, 'id'>): Promise<string>

  // ---------- READ ----------
  async getLista(lojistaId: string): Promise<T[]> {
    this.validarId(lojistaId)

    const snapshot = await getDocs(this.getCollection(lojistaId))
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  }

  // ---------- UPDATE ----------
  async atualizar(lojistaId: string, model: Pick<T, 'id'> & Partial<T>): Promise<void> {
    this.validarId(lojistaId)
    this.validarId(model.id)
    this.validarAtualizacao(model)

    const ref = doc(this.getCollection(lojistaId), model.id)
    await updateDoc(ref, model)
  }

  // ---------- VALIDACOES ----------
  protected validarId(id: string) {
    if (!id || id.trim() === '') {
      throw new Error('ID não fornecido')
    }
  }

  protected abstract validarCriacao(model: Omit<T, 'id'>): void
  protected abstract validarAtualizacao(model: Partial<T>): void
}
