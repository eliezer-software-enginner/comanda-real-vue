import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import { LOJISTA_ID } from '@/mocks/lojista-mock'
import { produtosTeste } from '@/mocks/produtos.mock'
import { ProdutosService } from './ProdutosService'

describe('crud de produtos', () => {
  let service: ProdutosService

  beforeAll(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    // 🔥 AGORA SIM
    service = new ProdutosService(LOJISTA_ID)
  })

  test('deve criar produto', async () => {
    const produtoRequest = produtosTeste[1]!

    const produto = await service.criar(produtoRequest)
    const id = produto.id

    expect(id).toBeDefined()
  })

  test('deve listar produtos', async () => {
    const produtoRequest = produtosTeste[2]!

    const produto = await service.criar(produtoRequest)
    const id = produto.id

    expect(id).toBeDefined()

    const produtos = await service.getLista(LOJISTA_ID)
    expect(produtos).toBeDefined()
    expect(produtos.length).toBeGreaterThan(0)
  })
})
