import { doc, getDoc, writeBatch } from 'firebase/firestore'

import { db } from './firebaseConfig'

// Tipos auxiliares internos para o banco de dados
interface LojistaData {
  nomeLoja: string
  fotoUrl?: string
  whatsapp?: string
}

export class LojistaService {
  private getLojistaRef(lojaId: string) {
    return doc(db, 'apps', 'comanda-direta', 'lojistas', lojaId)
  }

  /**
   * Salva ou atualiza os metadados do Lojista (nome, foto, whatsapp).
   * @param lojaId - ID único do lojista/cardápio.
   * @param data - Objeto parcial com os dados a serem atualizados.
   */
  async salvarLojista(lojaId: string, data: Partial<LojistaData>): Promise<void> {
    try {
      const lojistaRef = this.getLojistaRef(lojaId)

      // Criamos um batch para garantir a atomicidade da operação (mesmo sendo só um documento)
      const batch = writeBatch(db)

      // Usamos { merge: true } para atualizar apenas os campos fornecidos,
      // mantendo os outros existentes.
      batch.set(lojistaRef, data, { merge: true })
      await batch.commit()

      console.log(`Metadados do Lojista ${lojaId} salvos/atualizados com sucesso!`)
    } catch (error) {
      console.error('Erro ao salvar metadados do lojista:', error)
      throw error
    }
  }

  /**
   * Obtém apenas os metadados do lojista.
   * @param lojaId - ID único do lojista.
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
