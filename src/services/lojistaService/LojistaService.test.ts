import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import type { LojistaDto } from './LojistaDto'
import { LojistaService } from './LojistaService'

describe('crud de lojistas', () => {
  let service: LojistaService

  beforeAll(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    service = new LojistaService()
  })

  test('deve criar lojista', async () => {
    const lojista: LojistaDto = {
      nome: 'Espaço Hamburgueria',
      whatsapp: '12345678911',
    }

    const id = await service.criar(lojista)
    expect(id).toBeDefined()
  })

  test('deve retornar dados do lojista criado', async () => {
    const lojistaRequest: LojistaDto = {
      nome: 'Batata Frita Rústica',
      whatsapp: '12345678911',
    }

    const lojista = await service.criar(lojistaRequest)
    const id = lojista.id

    expect(id).toBeDefined()

    const lojistaRecuperado = await service.getData(id)
    expect(lojistaRecuperado).toBeDefined()
    expect(lojistaRecuperado).not.toBeNull()
  })
})
