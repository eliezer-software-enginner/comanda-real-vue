import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  setDoc,
  type DocumentData,
} from 'firebase/firestore'

import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

import { CrudService } from '../CrudService'
import { db, storage } from '../firebaseConfig'
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
      // 1. Gera uma referência de documento vazia para obter o ID antes de salvar
      const novaRef = doc(this.getCollection(this.lojistaId))
      const id = novaRef.id
      produto.contador = 0

      const prd: ProdutoModel = {
        id: id,
        ...produto,
      }

      // 2. Salva tudo de uma vez
      await setDoc(novaRef, prd)
      console.log(`Produto ${id} salvo com sucesso!`)

      return id
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      throw error
    }
  }

  protected validarCriacao(model: Omit<ProdutoModel, 'id'>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }

    // if (!model.preco || model.preco <= 0) {
    //   throw new Error('Preço inválido')
    // }
  }

  protected validarAtualizacao(model: Partial<ProdutoModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }

    // if (!model.preco || model.preco <= 0) {
    //   throw new Error('Preço inválido')
    // }
  }

  async uploadImagem(lojaId: string, arquivo: File): Promise<string> {
    try {
      // Cria um nome único para o arquivo usando timestamp
      const extensao = arquivo.name.split('.').pop()
      const nomeArquivo = `${Date.now()}.${extensao}`
      const caminho = `apps/comanda-real/lojistas/${lojaId}/produtos/${nomeArquivo}`

      const referencia = storageRef(storage, caminho)

      // Faz o upload
      const snapshot = await uploadBytes(referencia, arquivo)

      // Retorna a URL pública
      return await getDownloadURL(snapshot.ref)
    } catch (error) {
      console.error('Erro no upload da imagem:', error)
      throw new Error('Falha ao subir imagem')
    }
  }
}
