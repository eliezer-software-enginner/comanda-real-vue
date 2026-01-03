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

    describe('calcularTotal', () => {
      it('should return 0 when cart is empty', () => {
        const total = service.calcularTotal()
        expect(total).toBe(0)
      })

      it('should calculate total price correctly with single product', () => {
        const produto: ProdutoModel = {
          id: '1',
          nome: 'Produto A',
          preco: 10,
          quantidade: 1,
        } as unknown as ProdutoModel
        service.adicionarProduto(produto)

        const total = service.calcularTotal()
        expect(total).toBe(10)
      })

      it('should calculate total price correctly with multiple products', () => {
        const produtos: ProdutoEmCarrinho[] = [
          { id: '1', nome: 'Produto A', preco: 10, quantidade: 2 } as ProdutoEmCarrinho,
          { id: '2', nome: 'Produto B', preco: 15, quantidade: 3 } as ProdutoEmCarrinho,
        ]
        localStorage.setItem('produtos_json', JSON.stringify(produtos))

        const total = service.calcularTotal()
        expect(total).toBe(65)
      })

      it('should calculate total with decimal prices', () => {
        const produtos: ProdutoEmCarrinho[] = [
          { id: '1', nome: 'Produto A', preco: 10.5, quantidade: 2 } as ProdutoEmCarrinho,
        ]
        localStorage.setItem('produtos_json', JSON.stringify(produtos))

        const total = service.calcularTotal()
        expect(total).toBe(21)
      })

      describe('quantidadeItens', () => {
        it('should return 0 when cart is empty', () => {
          const quantidade = service.quantidadeItens()
          expect(quantidade).toBe(0)
        })

        it('should return correct quantity with single product', () => {
          const produto: ProdutoModel = {
            id: '1',
            nome: 'Produto A',
            quantidade: 1,
          } as unknown as ProdutoModel
          service.adicionarProduto(produto)

          const quantidade = service.quantidadeItens()
          expect(quantidade).toBe(1)
        })

        it('should return sum of quantities with multiple products', () => {
          const produtos: ProdutoEmCarrinho[] = [
            { id: '1', nome: 'Produto A', quantidade: 2 } as ProdutoEmCarrinho,
            { id: '2', nome: 'Produto B', quantidade: 3 } as ProdutoEmCarrinho,
          ]
          localStorage.setItem('produtos_json', JSON.stringify(produtos))

          const quantidade = service.quantidadeItens()
          expect(quantidade).toBe(5)
        })
      })
    })
  })
})
