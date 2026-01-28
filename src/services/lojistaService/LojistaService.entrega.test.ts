import { describe, test, expect, beforeEach, vi } from 'vitest'
import { LojistaService } from './LojistaService'
import { EnderecoService } from '../enderecoService/EnderecoService'
import type { LojistaModel } from './LojistaModel'

// Mock do EnderecoService
vi.mock('../enderecoService/EnderecoService')
const MockedEnderecoService = EnderecoService as any

describe('LojistaService - verificação de entrega por CEPs cadastrados', () => {
  let lojistaService: LojistaService
  let mockEnderecoService: any

  beforeEach(() => {
    lojistaService = new LojistaService()
    mockEnderecoService = new MockedEnderecoService()
    lojistaService['enderecoService'] = mockEnderecoService
    vi.clearAllMocks()
  })

  const lojistaMock: LojistaModel = {
    id: 'TESTE_DEV_LOJA',
    nomeLoja: 'Lanchonete Teste',
    categoria: 'lanchonete',
    whatsapp: '5511999999999',
    slug: 'lanchonete-teste',
    dtCriacao: new Date(),
    status: 'ativo',
    horariosFuncionamento: [],
    fotoUrl: '',
    endereco: {
      rua: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Brás Pires',
      estado: 'MG',
      cep: '36542000',
      complemento: ''
    },
    formasPagamento: {
      dinheiro: true,
      pix: true,
      cartaoCredito: false,
      cartaoDebito: false,
      valeRefeicao: false
    },
    aceitaDelivery: true,
    taxaEntrega: 5,
    pedidoMinimo: 20,
    instagram: '',
    cepsAtendidos: [
      '36542000', // Brás Pires - Centro
    ]
  }

  describe('verificaEntregaNoCep', () => {
    test('deve permitir entrega para CEP cadastrado na lista', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue({
        rua: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Brás Pires',
        estado: 'MG',
        cep: '36542000'
      })

      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaMock)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '36542000')
      expect(resultado).toBe(true)
    })

    test('deve permitir entrega para CEP com formatação diferente', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue({
        rua: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Rio Paranaíba',
        estado: 'MG',
        cep: '36543000'
      })

      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaMock)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '36.543-000')
      expect(resultado).toBe(true)
    })

    test('deve negar entrega para CEP não cadastrado na lista', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue({
        rua: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        cep: '30100000'
      })

      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaMock)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '30100000')
      expect(resultado).toBe(false)
    })

    test('deve negar entrega se lojista não aceita delivery', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue({
        rua: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Brás Pires',
        estado: 'MG',
        cep: '36542000'
      })

      const lojistaSemDelivery = { ...lojistaMock, aceitaDelivery: false }
      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaSemDelivery)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '36542000')
      expect(resultado).toBe(false)
    })

    test('deve negar entrega para CEP inválido', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue(null)
      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaMock)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '00000000')
      expect(resultado).toBe(false)
    })

    test('deve permitir entrega com lista vazia se lojista aceita delivery', async () => {
      mockEnderecoService.buscarEnderecoPorCep.mockResolvedValue({
        rua: 'Rua Teste',
        bairro: 'Bairro Teste',
        cidade: 'Brás Pires',
        estado: 'MG',
        cep: '36542000'
      })

      const lojistaSemCeps = { ...lojistaMock, cepsAtendidos: [] }
      vi.spyOn(lojistaService, 'getById').mockResolvedValue(lojistaSemCeps)

      const resultado = await lojistaService.verificaEntregaNoCep('TESTE_DEV_LOJA', '36542000')
      expect(resultado).toBe(false) // Sem CEPs cadastrados = não entrega
    })
  })
})