import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { MOCK_FIREBASE_CONFIG } from '@/mocks/firebaseConfig.mock'
import { LOJISTA_ID } from '@/mocks/lojista-mock'
import { produtosTeste } from '@/mocks/produtos.mock'
import type { ProdutoDto } from './ProdutoDto'
import { ProdutosService } from './ProdutosService'

function cloneProduto(produto: ProdutoDto): ProdutoDto {
  return JSON.parse(JSON.stringify(produto))
}

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

    const produtos = await service.getLista()
    expect(produtos).toBeDefined()
    expect(produtos.length).toBeGreaterThan(0)
  })

  test('deve obter produto por id', async () => {
    const produtoRequest = produtosTeste[0]!
    const produtoCriado = await service.criar(produtoRequest)

    const produto = await service.getById(produtoCriado.id)
    expect(produto).toBeDefined()
    expect(produto.id).toBe(produtoCriado.id)
    expect(produto.nome).toBe(produtoRequest.nome)
  })

  test('deve validar nome obrigatório na criação', async () => {
    const produtoInvalido = cloneProduto(produtosTeste[0]!)
    produtoInvalido.nome = ''

    await expect(service.criar(produtoInvalido)).rejects.toThrow('Nome é obrigatório')
  })

  test('deve validar preço inválido na criação', async () => {
    const produtoInvalido = { ...produtosTeste[0]!, preco: -10 }

    await expect(service.criar(produtoInvalido)).rejects.toThrow('Preço inválido')
  })

  test('deve validar imagem obrigatória na criação', async () => {
    const produtoInvalido = { ...produtosTeste[0]!, imagemUrl: '' }

    await expect(service.criar(produtoInvalido)).rejects.toThrow('Imagem é obrigatória')
  })

  test('deve validar categoria obrigatória na criação', async () => {
    const produtoInvalido = { ...produtosTeste[0]!, categoriaId: '' }

    await expect(service.criar(produtoInvalido)).rejects.toThrow('Categoria é obrigatória')
  })

  test('deve obter tipos de produtos', () => {
    const tipos = ProdutosService.TiposParaLista()

    expect(tipos).toContain('principal')
    expect(tipos).toContain('acompanhamento')
    expect(tipos).toContain('adicional')
    expect(tipos.length).toBe(3)
  })

  test('deve obter lista de acompanhamentos gerais', async () => {
    const acompanhamentos = await service.getListaAcompanhamentosGeral()

    expect(Array.isArray(acompanhamentos)).toBe(true)
  })

  test('deve obter lista de adicionais gerais', async () => {
    const adicionais = await service.getListaAdicionaisGeral()

    expect(Array.isArray(adicionais)).toBe(true)
  })

  test('deve obter produtos mais vendidos', async () => {
    const maisVendidos = await service.getMaisVendidos(2)

    expect(Array.isArray(maisVendidos)).toBe(true)
    expect(maisVendidos.length).toBeLessThanOrEqual(2)
  })

  test('deve incrementar contador de vendas', async () => {
    const produtoRequest = produtosTeste[2]!
    const produto = await service.criar(produtoRequest)

    await service.incrementarContador(produto.id)

    const produtoAtualizado = await service.getById(produto.id)
    expect(produtoAtualizado.vendas).toBe(1)
  })

  test('deve deletar produto', async () => {
    const produtoRequest = produtosTeste[1]!
    const produto = await service.criar(produtoRequest)

    await service.excluir(produto.id)

    await expect(service.getById(produto.id)).rejects.toThrow()
  })

  test('deve obter acompanhamentos do produto fornecido', async () => {
    const acompanhamento1 = await service.criar({
      ...produtosTeste[0]!,
      tipo: 'acompanhamento',
    })
    const acompanhamento2 = await service.criar({
      ...produtosTeste[1]!,
      tipo: 'acompanhamento',
    })

    const produtoComAcompanhamentos = await service.criar({
      ...produtosTeste[2]!,
      acompanhamentosIds: [acompanhamento1.id, acompanhamento2.id],
    })

    const acompanhamentos =
      await service.getAcompanhamentosDoProdutoFornecido(produtoComAcompanhamentos)

    expect(acompanhamentos).toBeDefined()
    expect(acompanhamentos.length).toBe(2)
    expect(acompanhamentos[0]!.id).toBe(acompanhamento1.id)
    expect(acompanhamentos[1]!.id).toBe(acompanhamento2.id)
  })

  test('deve retornar array vazio quando produto não tem acompanhamentos', async () => {
    const produtoSemAcompanhamentos = await service.criar({
      ...produtosTeste[1]!,
      acompanhamentosIds: [],
    })

    const acompanhamentos =
      await service.getAcompanhamentosDoProdutoFornecido(produtoSemAcompanhamentos)

    expect(acompanhamentos).toBeDefined()
    expect(acompanhamentos.length).toBe(0)
  })

  test('deve obter múltiplos acompanhamentos do produto', async () => {
    const acompanhamentos = Array.from({ length: 3 }, async (_, i) =>
      service.criar({
        ...produtosTeste[0]!,
        nome: `acompanhamento-${i}`,
        tipo: 'acompanhamento',
      }),
    )

    const acompanhamentosIds = (await Promise.all(acompanhamentos)).map((a) => a.id)

    const produto = await service.criar({
      ...produtosTeste[2]!,
      acompanhamentosIds,
    })

    const resultado = await service.getAcompanhamentosDoProdutoFornecido(produto)

    expect(resultado.length).toBe(3)
    expect(resultado.every((a) => a.tipo === 'acompanhamento')).toBe(true)
  })
})
