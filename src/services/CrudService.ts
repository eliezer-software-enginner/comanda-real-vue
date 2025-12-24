import logger from '@/plugins/logs'
import {
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  type CollectionReference,
  type DocumentData,
  type OrderByDirection,
} from 'firebase/firestore'

export type FiltroOptions = {
  campo: string
  ordem: 'crescente' | 'decrescrente'
}

type Identificavel = {
  id: string
}

export abstract class CrudService<InputData, T extends Identificavel> {
  protected abstract getCollection(): CollectionReference<DocumentData, DocumentData>
  protected abstract getDoc(id: string): DocumentReference<DocumentData, DocumentData>

  // ---------- CREATE ----------
  async criar(data: InputData): Promise<T> {
    logger.info('dado recebido', { label: 'CrudService', method: 'criar', dado: data })
    this.validarCriacao(data)

    logger.info('passou pela validação', { label: 'CrudService', method: 'criar', dado: data })

    const model = this.prepararDadosPreCriacao(data)

    logger.info('preparou os dados para salvamento', {
      label: 'CrudService',
      method: 'criar',
      dado: data,
      model: model,
    })

    return this.handleSalvar(model)
  }

  async excluir(id: string) {
    logger.info('tentativa de excluir documento por id', {
      label: 'CrudService',
      method: 'excluir',
      id: id,
    })
    this.validarId(id)

    try {
      await deleteDoc(this.getDoc(id))
      logger.info('documento excluido com sucesso permanentemente', {
        label: 'CrudService',
        method: 'excluir',
        id: id,
      })
    } catch (e: any) {
      logger.error('falha ao excluir documento', {
        label: 'CrudService',
        method: 'excluir',
        id: id,
        erro: e,
      })
      throw new Error('Error on delete doc')
    }
  }

  protected async handleSalvar(model: T): Promise<T> {
    if (model.id) {
      const ref = this.getDoc(model.id)
      await setDoc(ref, model)

      logger.info('Dado salvo com sucesso com id próprio!', {
        label: 'CrudService',
        method: 'handleSalvar',
        id: model.id,
      })
      return model
    }

    const ref = doc(this.getCollection()) // gera ID automático
    model.id = ref.id

    await setDoc(ref, model)

    logger.info('Dado salvo com sucesso com id automático!', {
      label: 'CrudService',
      method: 'handleSalvar',
      id: model.id,
    })
    return model
  }

  // ---------- READ ----------
  async getLista(): Promise<T[]> {
    const snapshot = await getDocs(this.getCollection())
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[]
  }

  async getListaBy(opcoesDeFiltro: FiltroOptions): Promise<T[]> {
    try {
      logger.info('tentativa de obter dados por filtro', {
        label: 'CrudService',
        method: 'getListaBy',
        dado: opcoesDeFiltro,
      })

      const ref = this.getCollection()

      const orderByDirection: OrderByDirection =
        opcoesDeFiltro.ordem == 'crescente' ? 'asc' : 'desc'

      const q = query(ref, orderBy(opcoesDeFiltro.campo, orderByDirection))

      const snapshot = await getDocs(q)

      logger.info('dados recuperados', {
        label: 'CrudService',
        method: 'getListaBy',
        dado: {
          quantidade: snapshot.size,
        },
      })

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[]
    } catch (error) {
      logger.error('Erro ao buscar dados por filtro', error)
      throw error
    }
  }

  async getById(id: string): Promise<T> {
    logger.info('tentativa de obter dados por id', {
      label: 'CrudService',
      method: 'getById',
      id: id,
    })
    this.validarId(id)

    const docSnap = await getDoc(this.getDoc(id))

    // 1. Verifique se o documento existe de fato
    if (!docSnap.exists()) {
      logger.error(`Documento não encontrado.`, {
        label: 'CrudService',
        method: 'getById',
        id: id,
      })
      throw new Error(`Documento com ID ${id} não encontrado.`)
    }

    // 2. Mescle o ID com os dados (assim como no getLista)
    const data = docSnap.data()
    logger.error(`Documento encontrado com sucesso.`, {
      label: 'CrudService',
      method: 'getById',
      id: id,
      dado: data,
    })
    return {
      id: docSnap.id,
      ...data,
    } as T
  }

  // ---------- UPDATE ----------
  async atualizar(data: T): Promise<void> {
    logger.info('tentativa de atualizar dados', {
      label: 'CrudService',
      method: 'atualizar',
      dado: data,
    })
    this.validarId(data.id)

    logger.info('vai validar dados para atualização', {
      label: 'CrudService',
      method: 'atualizar',
      dado: data,
    })
    this.validarAtualizacao(data)

    logger.info('dados validados para atualização', {
      label: 'CrudService',
      method: 'atualizar',
      dado: data,
    })

    const ref = doc(this.getCollection(), data.id) as DocumentReference<T, T>
    //await updateDoc(ref, data as any)
    await setDoc(ref, data as any, { merge: true }) //se existir atualiza, se não cria

    logger.info('dados atualizados com sucesso', {
      label: 'CrudService',
      method: 'atualizar',
      dado: data,
    })
  }

  async atualizarEmLote(lista: T[]): Promise<void> {
    logger.info('tentativa de atualizar em lote', {
      label: 'CrudService',
      method: 'atualizar',
      dado: lista,
    })

    await Promise.all(lista.map((v) => this.atualizar(v)))

    logger.info('dados em lote atualizados com sucesso', {
      label: 'CrudService',
      method: 'atualizar',
      dado: lista,
    })
  }

  // ---------- VALIDACOES ----------
  protected validarId(id: string | undefined) {
    logger.info('validação de id', { label: 'CrudService', method: 'validarId', id: id })
    if (!id || id.trim() === '') {
      logger.error('Não passou na validação de id', {
        label: 'CrudService',
        method: 'validarId',
        id: id,
      })
      throw new Error('ID não fornecido')
    }
  }

  protected abstract prepararDadosPreCriacao(data: InputData): T
  protected abstract validarCriacao(data: InputData): void
  protected abstract validarAtualizacao(model: T): void
}
