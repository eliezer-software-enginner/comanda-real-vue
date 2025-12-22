import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { ProdutosService } from '../services/produtosService/ProdutosService'
import { MOCK_FIREBASE_CONFIG } from './firebaseConfig.mock'
import { LOJISTA_ID } from './lojista-mock'
import { produtosTeste } from './produtos.mock'

describe('SEED DATA: Populando cardapio', () => {
  let cardapioService: ProdutosService

  beforeAll(() => {
    console.log('[SEED TEST] Conectando ao Firebase Emulator na porta 8080...')

    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    cardapioService = new ProdutosService(LOJISTA_ID)
  })

  test('deve criar o cardápio', async () => {
    // 2. Popular Cardápio
    console.log(`[SEED] Populando cardápio 'principal' com dados de teste.`)
    await Promise.all(produtosTeste.map((produto) => cardapioService.criar(produto)))

    // 3. Verificação Final
    const cardapio = await cardapioService.getLista(LOJISTA_ID)

    expect(cardapio).not.toBeNull()
    expect(cardapio?.length).toBeGreaterThan(0) // Garante que produtos foram inseridos
    console.log(`[SEED] População concluída com sucesso para ID: ${LOJISTA_ID}`)
  }, 10000)
})
