import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProdutoModel } from '../produtosService/ProdutosModel'
import type { ProdutoEmCarrinho } from './CarrinhoModel'
import { CarrinhoService } from './CarrinhoService'

describe('CarrinhoService', () => {
  let service: CarrinhoService

  beforeEach(() => {
    service = new CarrinhoService()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('adicionarProduto', () => {
    it('should add a new product to cart', () => {
      const produto: ProdutoModel = { id: '1', nome: 'Produto A' } as ProdutoModel

      service.adicionarProduto(produto)

      const lista = service.listar()
      expect(lista).toHaveLength(1)
      expect(lista[0]?.id).toBe('1')
      expect(lista[0]?.quantidade).toBe(1)
    })

    it('should increment quantity if product already exists', () => {
      const produto: ProdutoModel = { id: '1', nome: 'Produto A' } as ProdutoModel

      service.adicionarProduto(produto)
      service.adicionarProduto(produto)

      const lista = service.listar()
      expect(lista).toHaveLength(1)
      expect(lista).toBeDefined()
      expect(lista[0]?.quantidade).toBe(2)
    })
  })

  describe('listar', () => {
    it('should return empty array when localStorage is empty', () => {
      const lista = service.listar()
      expect(lista).toEqual([])
    })

    it('should return products from localStorage', () => {
      const produtos: ProdutoEmCarrinho[] = [
        { id: '1', nome: 'Produto A', quantidade: 1 } as ProdutoEmCarrinho,
      ]
      localStorage.setItem('produtos_json', JSON.stringify(produtos))

      const lista = service.listar()
      expect(lista).toEqual(produtos)
    })
  })

  describe('removerProduto', () => {
    it('should remove product from cart', () => {
      const produto: ProdutoModel = { id: '1', nome: 'Produto A' } as ProdutoModel
      service.adicionarProduto(produto)

      service.removerProduto('1')

      const lista = service.listar()
      expect(lista).toHaveLength(0)
    })

    it('should not throw error if product does not exist', () => {
      expect(() => service.removerProduto('999')).not.toThrow()
    })
  })

  describe('esvaziarCarrinho', () => {
    it('should clear all products from cart', () => {
      const produto: ProdutoModel = { id: '1', nome: 'Produto A' } as ProdutoModel
      service.adicionarProduto(produto)

      service.esvaziarCarrinho()

      const lista = service.listar()
      expect(lista).toEqual([])
    })
  })
})
