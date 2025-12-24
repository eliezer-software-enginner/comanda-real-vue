import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'

import logger from '@/plugins/logs'
import { Utils } from '@/utils/Utils'
import { CrudService } from '../CrudService'
import { db } from '../firebaseConfig'
import type { LojistaDto } from './LojistaDto'
import type { LojistaModel } from './LojistaModel'

export class LojistaService extends CrudService<LojistaDto, LojistaModel> {
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
      horariosFuncionamento: data.horariosFuncionamento || [],
    }
  }

  public async getId_aPartirDaSlug(slug: string): Promise<string | null> {
    logger.info('buscando ID do lojista a partir da slug', {
      label: 'LojistaService',
      method: 'getId_aPartirDaSlug',
      dado: { slug },
    })

    try {
      const lojistasRef = this.getCollection()

      // Criamos a query para buscar o documento onde o campo 'slug' é igual ao parâmetro
      const q = query(lojistasRef, where('slug', '==', slug), limit(1))

      const querySnapshot = await getDocs(q)

      // Se não encontrar nenhum documento, retorna null
      if (querySnapshot.empty) {
        logger.warn('nenhum lojista encontrado para a slug informada', {
          label: 'LojistaService',
          method: 'getId_aPartirDaSlug',
          slug,
        })
        return null
      }

      // Retorna o ID do primeiro (e único) documento encontrado
      const docEncontrado = querySnapshot.docs[0]

      if (!docEncontrado) return null

      return docEncontrado.id
    } catch (error) {
      logger.error('erro ao buscar lojista pela slug', {
        label: 'LojistaService',
        method: 'getId_aPartirDaSlug',
        error,
      })
      throw error
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

        logger.info(`Lojista ${lojistaId} salvo com sucesso!`)

        return model
      } else {
        const docRef = await addDoc(this.getCollection(), model)
        model.id = docRef.id
        logger.info(`Lojista ${docRef.id} salvo com sucesso!`)
        return model
      }
    } catch (error) {
      logger.error('Erro ao salvar lojista:', error)
      throw error
    }
  }

  protected prepararDadosPreCriacao(dadoInicial: LojistaDto): LojistaModel {
    return {
      dtCriacao: new Date(),
      id: dadoInicial.id != undefined ? dadoInicial.id : '',
      logoUrl: '',
      nome: dadoInicial.nome,
      whatsapp: '',
      slug: dadoInicial.slug || Utils.gerarUUID(),
      status: 'ativo',
      horariosFuncionamento: dadoInicial.horariosFuncionamento || [],
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

  /**
   * Verifica se o lojista está aberto com base nos horários de funcionamento
   */
  public async isAbertaAgora(lojistaId: string): Promise<boolean> {
    logger.info('verificando se a loja está aberta agora', {
      label: 'LojistaService',
      method: 'isAbertaAgora',
      dado: {
        lojistaId: lojistaId,
      },
    })

    const lojista = await this.getById(lojistaId)

    const horarios = lojista.horariosFuncionamento

    if (!horarios || horarios.length === 0) return false

    const agora = new Date()
    // Pegamos a hora e minuto atual (ex: 14:30 -> 14 * 60 + 30 = 870 minutos)
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

    // Função auxiliar para converter "HH:mm" em minutos totais
    const converterParaMinutos = (horarioStr: string): number => {
      const [horas, minutos] = horarioStr.split(':').map(Number)
      return (horas ?? 0) * 60 + (minutos ?? 0)
    }

    // Verifica se o momento atual está dentro de QUALQUER um dos intervalos
    return horarios.some((intervalo) => {
      const inicio = converterParaMinutos(intervalo.de)
      const fim = converterParaMinutos(intervalo.ate)

      // Caso padrão: horário de abertura é menor que o de fechamento (ex: 08:00 às 18:00)
      if (inicio <= fim) {
        return minutosAgora >= inicio && minutosAgora <= fim
      }

      // Caso especial: atravessa a meia-noite (ex: 18:00 às 02:00)
      // Aberto se: (Agora >= 18:00) OU (Agora <= 02:00)
      return minutosAgora >= inicio || minutosAgora <= fim
    })
  }
}
