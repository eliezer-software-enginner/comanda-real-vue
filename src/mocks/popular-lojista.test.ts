import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'
import { INITIAL_LOJISTA_DATA, LOJISTA_ID } from './lojista-mock'

import { LojistaService } from '../services/LojistaService'
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

  test('deve criar ou atualizar o lojista de teste e popular o cardápio', async () => {
    // 1. Verificar/Criar Lojista
    let lojista = await lojistaService.getLojista(LOJISTA_ID)

    if (!lojista) {
      console.log(`[SEED] Criando lojista ${LOJISTA_ID}...`)
    } else {
      console.log(`[SEED] Lojista ${LOJISTA_ID} existente. Atualizando metadados.`)
    }

    // Usa atualizarLojista para garantir o UPSERT (criação ou atualização) com ID fixo.
    await lojistaService.atualizarLojista(LOJISTA_ID, INITIAL_LOJISTA_DATA)

    lojista = await lojistaService.getLojista(LOJISTA_ID)
    expect(lojista).not.toBeNull()
    expect(lojista?.nomeLoja).toBe(INITIAL_LOJISTA_DATA.nomeLoja)
  }, 5000)
})
