import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import { LOJISTA_ID } from '@/mocks/lojista-mock'
import type { ProdutoModel } from '../produtosService/ProdutosModel'
import { ProdutosService } from '../produtosService/ProdutosService'
import type { PedidoModel } from './PedidoModel'
import { PedidoService } from './PedidoService'

describe('crud de pedidos', () => {
  let produtoService: ProdutosService
  let service: PedidoService

  beforeAll(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    produtoService = new ProdutosService(LOJISTA_ID)
    service = new PedidoService()
  })

  test('deve criar pedido com status aguardando', async () => {
    const produto: Omit<ProdutoModel, 'id'> = {
      nome: 'Batata Frita Rústica',
      descricao: 'Porção individual com alecrim e páprica.',
      preco: 12.0,
      categoria: 'Acompanhamentos',
      imagemUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      lojistaId: LOJISTA_ID,
      contador: 0,
    }

    const produtoId = await produtoService.salvar(produto)
    expect(produtoId).toBeDefined()

    const pedido: Omit<PedidoModel, 'id'> = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [{ nome: '', precoUnitario: 1, produtoId: produtoId, quantidade: 2 }],
      lojistaId: LOJISTA_ID,
      dataCriacao: new Date(),
      status: 'pendente',
      tipoPagamento: 'dinheiro',
      total: 1,
      numero: Date.now(),
    }

    const id = await service.salvar(pedido)
    expect(id).toBeDefined()
  })

  test('deve alterar status de pedido para preparo', async () => {
    const produto: Omit<ProdutoModel, 'id'> = {
      nome: 'Batata Frita Rústica',
      descricao: 'Porção individual com alecrim e páprica.',
      preco: 12.0,
      categoria: 'Acompanhamentos',
      imagemUrl:
        'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      lojistaId: LOJISTA_ID,
      contador: 0,
    }

    const produtoId = await produtoService.salvar(produto)
    expect(produtoId).toBeDefined()

    const pedido: Omit<PedidoModel, 'id'> = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [
        { nome: 'Batata Frita Rústica', precoUnitario: 12.0, produtoId: produtoId, quantidade: 2 },
      ],
      lojistaId: LOJISTA_ID,
      dataCriacao: new Date(),
      status: 'pendente',
      tipoPagamento: 'dinheiro',
      total: 1,
      numero: Date.now(),
    }

    const id = await service.salvar(pedido)
    expect(id).toBeDefined()

    await service.mudarStatus(LOJISTA_ID, pedido as any, 'em-preparo')
  })
})
