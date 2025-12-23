import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { CategoriaService } from '@/services/categoriasService/CategoriaService'
import { MOCK_FIREBASE_CONFIG } from './firebaseConfig.mock'
import { LOJISTA_ID } from './lojista-mock'
import { categoriasMock } from './produtos.mock'

describe('SEED DATA: Populando categorias', () => {
  let categoriaService: CategoriaService

  beforeAll(() => {
    console.log('[SEED TEST] Conectando ao Firebase Emulator na porta 8080...')

    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    categoriaService = new CategoriaService(LOJISTA_ID)
  })

  test('deve criar as categorias', async () => {
    console.log(`[SEED] Populando categoria com dados de teste.`)
    await Promise.all(categoriasMock.map((it) => categoriaService.criar(it)))

    // 3. Verificação Final
    const lista = await categoriaService.getLista()

    expect(lista).not.toBeNull()
    expect(lista?.length).toBeGreaterThan(0) // Garante que produtos foram inseridos
    console.log(`[SEED] População concluída com sucesso para ID: ${LOJISTA_ID}`)
  }, 10000)
})
