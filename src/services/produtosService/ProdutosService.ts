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
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'

import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'

import logger from '@/plugins/logs'
import { CrudService } from '../CrudService'
import { db, storage } from '../firebaseConfig'
import type { ProdutoDto } from './ProdutoDto'
import type { ProdutoModel, ProdutoTipo } from './ProdutosModel'

export class ProdutosService extends CrudService<ProdutoDto, ProdutoModel> {
  private lojistaId: string

  constructor(lojistaId: string) {
    super()
    this.lojistaId = lojistaId
  }

  /**@override */
  protected prepararDadosPreCriacao(data: ProdutoDto): ProdutoModel {
    return {
      categoriaId: data.categoriaId,
      descricao: data.descricao,
      lojistaId: data.lojistaId,
      nome: data.nome,
      preco: data.preco,
      imagemUrl: data.imagemUrl,
      id: data.id || '',
      dtCriacao: new Date(),
      vendas: 0,
      status: 'ativo',
      tipo: data.tipo || 'principal',
      acompanhamentosIds: data.acompanhamentosIds,
      adicionaisIds: data.adicionaisIds,
    }
  }

  protected getDoc(id: string): DocumentReference<DocumentData, DocumentData> {
    logger.info('Tentativa de obter a ref de produtos', {
      label: 'ProdutoService',
      method: 'getDoc',
      dado: {
        idRecebido: id,
        idLojista: this.lojistaId,
      },
    })

    this.validarId(id)
    this.validarId(this.lojistaId)

    return doc(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'produtos', id)
  }

  protected getCollection(): CollectionReference<DocumentData, DocumentData> {
    this.validarId(this.lojistaId)
    return collection(db, 'apps', 'comanda-real', 'lojistas', this.lojistaId, 'produtos')
  }

  public async getAcompanhamentosDoProdutoFornecido(
    produtoModel: ProdutoModel,
  ): Promise<ProdutoModel[]> {
    logger.info('tentativa de obter acompanhamentos completos do produto', {
      label: 'ProdutoService',
      method: 'getAcompanhamentosDoProdutoFornecido',
      produtoRecebido: produtoModel,
    })

    const { acompanhamentosIds } = produtoModel

    const acompanhamentos = await Promise.all(acompanhamentosIds.map((id) => super.getById(id)))
    return acompanhamentos
  }

  public async getAdicionaisDoProdutoFornecido(
    produtoModel: ProdutoModel,
  ): Promise<ProdutoModel[]> {
    logger.info('tentativa de obter adicionais completos do produto', {
      label: 'ProdutoService',
      method: 'getAdicionaisDoProdutoFornecido',
      produtoRecebido: produtoModel,
    })

    const { adicionaisIds } = produtoModel

    const adicionais = await Promise.all(adicionaisIds.map((id) => super.getById(id)))
    return adicionais
  }

  public async getListaAcompanhamentosGeral() {
    return await this.getListaFromTipo('acompanhamento')
  }

  public async getListaAdicionaisGeral() {
    return await this.getListaFromTipo('adicional')
  }

  //exemplo: getListaFromTipo("acompanhamento")
  private async getListaFromTipo(tipo: ProdutoTipo): Promise<ProdutoModel[]> {
    try {
      this.validarId(this.lojistaId)

      return await this.getListaBy({
        campo: 'tipo',
        operador: '==',
        valor: tipo,
        valorDeOrdenacao: 'nome',
        ordem: 'crescente',
      })
    } catch (error: any) {
      logger.error('Erro ao buscar produtos por tipo', { dado: tipo, erro: error.message })
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

    if (model.preco == undefined || model.preco <= 0) {
      throw new Error('Preço inválido')
    }

    if (model.imagemUrl == undefined || model.imagemUrl == '') {
      throw new Error('Imagem é obrigatória')
    }

    if (model.categoriaId == undefined || model.categoriaId == '') {
      throw new Error('Categoria é obrigatória')
    }
  }

  protected validarAtualizacao(model: Partial<ProdutoModel>): void {
    if (!model.nome || model.nome.trim() === '') {
      throw new Error('Nome é obrigatório')
    }

    // if (!model.preco || model.preco <= 0) {
    //   throw new Error('Preço inválido')
    // }
  }

  //TODO remover daqui
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

  public static TiposParaLista() {
    const list: ProdutoTipo[] = ['principal', 'acompanhamento', 'adicional']
    return list
  }
}
