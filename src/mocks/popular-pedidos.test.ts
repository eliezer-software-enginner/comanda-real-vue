import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import type { PedidoDto } from '@/services/pedidoService/PedidoDto'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
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
    service = new PedidoService(LOJISTA_ID)
  })

  test('deve criar pedido com status aguardando', async () => {
    const produtoDto: ProdutoDto = produtosTeste[0]!
    const produto = await produtoService.criar(produtoDto)
    expect(produto).toBeDefined()

    const produtoId = produto.id
    expect(produtoId).toBeDefined()

    const pedidoRequest: PedidoDto = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [
        {
          nome: produtoDto.nome,
          precoUnitario: produtoDto.preco,
          produtoId: produtoId,
          quantidade: 2,
        },
      ],
      lojistaId: LOJISTA_ID,
      tipoPagamento: 'dinheiro',
    }

    const pedido = await service.criar(pedidoRequest)
    const id = pedido.id
    expect(id).toBeDefined()
  })

  test('deve criar pedido com status em preparo', async () => {
    const produtoDto: ProdutoDto = produtosTeste[0]!
    const produto = await produtoService.criar(produtoDto)
    expect(produto).toBeDefined()

    const produtoId = produto.id
    expect(produtoId).toBeDefined()

    const pedidoRequest: PedidoDto = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [
        {
          nome: produtoDto.nome,
          precoUnitario: produtoDto.preco,
          produtoId: produtoId,
          quantidade: 2,
        },
      ],
      lojistaId: LOJISTA_ID,
      tipoPagamento: 'dinheiro',
    }

    const pedido = await service.criar(pedidoRequest)
    const id = pedido.id
    expect(id).toBeDefined()

    await service.mudarStatus(pedido, 'em-preparo')
  })

  test('deve criar pedido com status sendo enviado', async () => {
    const produtoDto: ProdutoDto = produtosTeste[0]!
    const produto = await produtoService.criar(produtoDto)
    expect(produto).toBeDefined()

    const produtoId = produto.id
    expect(produtoId).toBeDefined()

    const pedidoRequest: PedidoDto = {
      cliente: {
        nome: 'CLiente-teste',
        telefone: '12345678910',
      },
      itens: [
        {
          nome: produtoDto.nome,
          precoUnitario: produtoDto.preco,
          produtoId: produtoId,
          quantidade: 2,
        },
      ],
      lojistaId: LOJISTA_ID,
      tipoPagamento: 'dinheiro',
    }

    const pedido = await service.criar(pedidoRequest)
    const id = pedido.id
    expect(id).toBeDefined()

    await service.mudarStatus(pedido, 'enviado')
  })
})
