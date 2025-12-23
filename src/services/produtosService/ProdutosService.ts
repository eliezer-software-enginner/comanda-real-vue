import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'

import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

import logger from '@/plugins/logs'
import { CrudService } from '../CrudService'
import { db, storage } from '../firebaseConfig'
import type { ProdutoDto } from './ProdutoDto'
import type { ProdutoModel } from './ProdutosModel'

export class ProdutosService extends CrudService<ProdutoDto, ProdutoModel> {
  private lojistaId: string

  constructor(lojistaId: string) {
    super()
    this.lojistaId = lojistaId
  }

  protected prepararDadosPreCriacao(data: ProdutoDto): ProdutoModel {
    return {
      categoria: data.categoria,
      descricao: data.descricao,
      lojistaId: data.lojistaId,
      nome: data.nome,
      preco: data.preco,
      imagemUrl: data.imagemUrl,
      id: '',
      dtCriacao: new Date(),
      vendas: 0,
      status: 'ativo',
    }
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    return doc(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'produtos', id)
  }

  protected getCollection(): CollectionReference<DocumentData, DocumentData> {
    return collection(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'produtos')
  }

  async handleSalvar(produto: ProdutoModel): Promise<ProdutoModel> {
    try {
      // 1. Gera uma referência de documento vazia para obter o ID antes de salvar
      const novaRef = doc(this.getCollection())
      const id = novaRef.id
      produto.vendas = 0

      const prd: ProdutoModel = {
        ...produto,
        id: id,
      }

      // 2. Salva tudo de uma vez
      await setDoc(novaRef, prd)
      logger.info(`Produto salvo com sucesso!`, { id: id })

      return prd
    } catch (error) {
      logger.error('Erro ao salvar produto:', error)
      throw error
    }
  }

  async getMaisVendidos(quantidade: number = 3): Promise<ProdutoModel[]> {
    try {
      this.validarId(this.lojistaId)

      const produtosRef = this.getCollection()

      const q = query(produtosRef, orderBy('vendas', 'desc'), limit(quantidade))

      const snapshot = await getDocs(q)

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProdutoModel[]
    } catch (error) {
      logger.error('Erro ao buscar produtos mais vendidos:', error)
      throw error
    }
  }

  /**
   * Incrementa o contador de vendas de um produto de forma atômica.
   * Não requer o valor atual do contador por parâmetro.
   */
  async incrementarContador(produtoId: string): Promise<void> {
    try {
      this.validarId(produtoId)

      // Usamos o método getDoc que você já implementou para pegar a referência correta
      const produtoRef = this.getDoc(produtoId)

      // O increment(1) soma 1 ao valor atual no banco de dados automaticamente
      await updateDoc(produtoRef, {
        vendas: increment(1),
      })

      logger.info(`Contador do produto ${produtoId} incrementado.`)
    } catch (error) {
      logger.error('Erro ao incrementar contador do produto:', error)
      throw error
    }
  }

  protected validarCriacao(model: Partial<ProdutoModel>): void {
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
      logger.error('Erro no upload da imagem:', error)
      throw new Error('Falha ao subir imagem')
    }
  }
}
