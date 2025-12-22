import {
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  updateDoc,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore'

type Identificavel = {
  id: string
}

export abstract class CrudService<InputData, T extends Identificavel> {
  protected abstract getCollection(): CollectionReference<DocumentData, DocumentData>
  protected abstract getDoc(id: string): DocumentReference<DocumentData, DocumentData>

  // ---------- CREATE ----------
  async criar(data: InputData): Promise<T> {
    this.validarCriacao(data)
    const model = this.prepararDadosPreCriacao(data)
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

  protected abstract handleSalvar(model: Partial<T>): Promise<T>

  // ---------- READ ----------
  async getLista(lojistaId: string): Promise<T[]> {
    this.validarId(lojistaId)

    const snapshot = await getDocs(this.getCollection())
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  }

  async getById(id: string): Promise<T> {
    this.validarId(id)

    const docSnap = await getDoc(this.getDoc(id))

    // 1. Verifique se o documento existe de fato
    if (!docSnap.exists()) {
      throw new Error(`Documento com ID ${id} não encontrado.`)
    }

    // 2. Mescle o ID com os dados (assim como no getLista)
    const data = docSnap.data()
    return {
      id: docSnap.id,
      ...data,
    } as T
  }

  // ---------- UPDATE ----------
  async atualizar(data: T): Promise<void> {
    this.validarId(data.id)
    this.validarId(data.id)
    this.validarAtualizacao(data)

    const ref = doc(this.getCollection(), data.id) as DocumentReference<T, T>
    await updateDoc(ref, data as any)
  }

  // ---------- VALIDACOES ----------
  protected validarId(id: string | undefined) {
    if (!id || id.trim() === '') {
      throw new Error('ID não fornecido')
    }
  }

  protected abstract prepararDadosPreCriacao(data: InputData): T
  protected abstract validarCriacao(data: InputData): void
  protected abstract validarAtualizacao(model: T): void
}
