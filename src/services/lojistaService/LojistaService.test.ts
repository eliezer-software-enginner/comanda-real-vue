import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import type { LojistaModel } from './LojistaModel'
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
    const lojista: Omit<LojistaModel, 'id'> = {
      nome: 'Espaço Hamburgueria',
      dtCriacao: new Date(),
      slug: 'espaco-hamburgeria',
      status: 'ativo',
      whatsapp: '12345678911',
      logoUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    }

    const id = await service.salvar(lojista)
    expect(id).toBeDefined()
  })

  test('deve retornar dados do lojista criado', async () => {
    const lojista: Omit<LojistaModel, 'id'> = {
      nome: 'Batata Frita Rústica',
      dtCriacao: new Date(),
      slug: 'espaco-hamburgeria',
      status: 'ativo',
      whatsapp: '12345678911',
      logoUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    }

    const id = await service.salvar(lojista)
    expect(id).toBeDefined()

    const lojistaRecuperado = await service.getData(id)
    expect(lojistaRecuperado).toBeDefined()
    expect(lojistaRecuperado).not.toBeNull()
  })
})
