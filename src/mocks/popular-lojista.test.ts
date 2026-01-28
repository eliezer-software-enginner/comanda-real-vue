import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'
import { INITIAL_LOJISTA_DATA, LOJISTA_ID } from './lojista-mock'

import { LojistaService } from '@/services/lojistaService/LojistaService'
import { MOCK_FIREBASE_CONFIG } from './firebaseConfig.mock'

describe('SEED DATA: População Inicial no Firebase Emulator', () => {
  let lojistaService: LojistaService

  // Inicializa e conecta ao Emulator ANTES de todos os testes neste arquivo
  beforeAll(() => {
    console.log('[SEED TEST] Conectando ao Firebase Emulator na porta 8080...')

    // 1. APLICAÇÃO DO PADRÃO SINGLETON AQUI:
    // Se já existir um app, usa o existente. Caso contrário, inicializa com o mock.
    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    // 2. Conecta o Firestore ao Emulator (Porta padrão: 8080)
    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    lojistaService = new LojistaService()
  })

  test('deve criar o lojista de teste se não existir', async () => {
    try {
      const lojista = await lojistaService.getById(LOJISTA_ID)

      if (!lojista) {
        console.log(`[SEED] Criando lojista ${LOJISTA_ID}...`)
        await lojistaService.criar(INITIAL_LOJISTA_DATA)

        expect(lojista).not.toBeNull()
        expect(lojista).toBeDefined()
      } else {
        // Verifica se o lojista já tem os CEPs atendidos
        if (!lojista.cepsAtendidos || lojista.cepsAtendidos.length === 0) {
          console.log(`[SEED] Atualizando lojista ${LOJISTA_ID} com CEPs atendidos...`)
          lojista.cepsAtendidos = INITIAL_LOJISTA_DATA.cepsAtendidos || []
          await lojistaService.atualizar(lojista)
          console.log(`[SEED] Lojista atualizado com ${lojista.cepsAtendidos.length} CEPs atendidos`)
        }
      }
    } catch (e) {
      console.log(`[SEED] Criando lojista ${LOJISTA_ID}...`)
      const lojista = await lojistaService.criar(INITIAL_LOJISTA_DATA)

      expect(lojista).not.toBeNull()
      expect(lojista).toBeDefined()
    }
  })
})
