import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import { LOJISTA_ID } from '@/mocks/lojista-mock'
import type { ProdutoModel } from './ProdutosModel'
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
    const produto: Omit<ProdutoModel, 'id'> = {
      nome: 'Batata Frita Rústica',
      descricao: 'Porção individual com alecrim e páprica.',
      preco: '12.0',
      categoria: 'Acompanhamentos',
      imagemUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      lojistaId: LOJISTA_ID,
      vendas: 0,
    }

    const id = await service.salvar(produto)
    expect(id).toBeDefined()
  })

  test('deve listar produtos', async () => {
    const produto: Omit<ProdutoModel, 'id'> = {
      nome: 'Batata Frita Rústica',
      descricao: 'Porção individual com alecrim e páprica.',
      preco: '12.0',
      categoria: 'Acompanhamentos',
      imagemUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      lojistaId: LOJISTA_ID,
      vendas: 0,
    }

    const id = await service.salvar(produto)
    expect(id).toBeDefined()

    const produtos = await service.getLista(LOJISTA_ID)
    expect(produtos).toBeDefined()
    expect(produtos.length).toBeGreaterThan(0)
  })
})
