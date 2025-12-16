import { DocumentReference, addDoc, collection, doc, getDoc, writeBatch } from 'firebase/firestore'

import { db } from './firebaseConfig'

// Tipos auxiliares internos para o banco de dados
interface LojistaData {
  nomeLoja: string
  fotoUrl?: string
  whatsapp?: string
}

export class LojistaService {
  private getLojistasCollection() {
    // Referência à coleção principal dos lojistas
    return collection(db, 'apps', 'comanda-real', 'lojistas')
  }

  /**
   * Constrói a referência do documento do lojista no Firestore.
   */
  private getLojistaRef(lojaId: string): DocumentReference {
    return doc(this.getLojistasCollection(), lojaId)
  }

  /**
   * 1. CRIAÇÃO (INSERT): Cria um NOVO lojista, permitindo que o Firestore GERE um ID único.
   * @param data - Dados iniciais do lojista (nome, foto, etc.).
   * @returns O ID único gerado pelo Firestore.
   */
  async criarLojista(data: LojistaData): Promise<string> {
    try {
      // Usa addDoc para adicionar um documento, gerando um ID automaticamente.
      const lojistaRef = await addDoc(this.getLojistasCollection(), data)

      console.log(`Lojista criado com sucesso! ID: ${lojistaRef.id}`)
      return lojistaRef.id
    } catch (error) {
      console.error('Erro ao criar lojista:', error)
      throw error
    }
  }

  /**
   * 2. ATUALIZAÇÃO (UPSERT): Salva ou atualiza um lojista com ID JÁ CONHECIDO.
   * @param lojaId - O ID único da loja/lojista (chave do documento no Firestore).
   * @param data - Objeto parcial com os dados a serem atualizados.
   */
  async atualizarLojista(lojaId: string, data: Partial<LojistaData>): Promise<void> {
    try {
      const lojistaRef = this.getLojistaRef(lojaId)

      // Usa um batch para garantir atomicidade
      const batch = writeBatch(db)

      // 'set' com '{ merge: true }' é a função de UPSERT (Update/Insert com ID conhecido)
      batch.set(lojistaRef, data, { merge: true })
      await batch.commit()

      console.log(`Metadados do Lojista ${lojaId} atualizados com sucesso!`)
    } catch (error) {
      console.error('Erro ao atualizar lojista:', error)
      throw error
    }
  }

  // ... (O método getLojista permanece o mesmo, pois requer o lojaId)

  /**
   * Obtém apenas os metadados do lojista.
   */
  async getLojista(lojaId: string): Promise<(LojistaData & { id: string }) | null> {
    try {
      const lojistaRef = this.getLojistaRef(lojaId)
      const lojistaSnap = await getDoc(lojistaRef)

      if (lojistaSnap.exists()) {
        const lojistaData = lojistaSnap.data() as LojistaData
        return {
          id: lojaId,
          ...lojistaData,
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar dados do lojista:', error)
      throw error
    }
  }
}
