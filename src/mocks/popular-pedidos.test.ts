import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import type { PedidoModel } from '@/services/pedidoService/PedidoModel'
import { PedidoService } from '../services/pedidoService/PedidoService'
import { ProdutosService } from '../services/produtosService/ProdutosService'
import { MOCK_FIREBASE_CONFIG } from './firebaseConfig.mock'
import { LOJISTA_ID } from './lojista-mock'
import { produtosTeste } from './produtos.mock'

describe('população de pedidos', () => {
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
    const produto = produtosTeste[0]!
    const produtoId = await produtoService.salvar(produto)
    expect(produtoId).toBeDefined()

    const pedido: Omit<PedidoModel, 'id'> = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [{ nome: produto.nome, precoUnitario: 1, produtoId: produtoId, quantidade: 2 }],
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

  test('deve criar pedido com status em preparo', async () => {
    const produto = produtosTeste[1]!
    const produtoId = await produtoService.salvar(produto)
    expect(produtoId).toBeDefined()

    const pedido: Omit<PedidoModel, 'id'> = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [{ nome: produto.nome, precoUnitario: 1, produtoId: produtoId, quantidade: 2 }],
      lojistaId: LOJISTA_ID,
      dataCriacao: new Date(),
      status: 'em-preparo',
      tipoPagamento: 'dinheiro',
      total: 1,
      numero: Date.now(),
    }

    const id = await service.salvar(pedido)
    expect(id).toBeDefined()
  })

  test('deve criar pedido com status sendo enviado', async () => {
    const produto = produtosTeste[2]!
    const produtoId = await produtoService.salvar(produto)
    expect(produtoId).toBeDefined()

    const pedido: Omit<PedidoModel, 'id'> = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [{ nome: produto.nome, precoUnitario: 1, produtoId: produtoId, quantidade: 2 }],
      lojistaId: LOJISTA_ID,
      dataCriacao: new Date(),
      status: 'enviado',
      tipoPagamento: 'dinheiro',
      total: 1,
      numero: Date.now(),
    }

    const id = await service.salvar(pedido)
    expect(id).toBeDefined()
  })
})
