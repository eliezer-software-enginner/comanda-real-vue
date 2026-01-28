import { describe, test, expect, beforeEach, vi } from 'vitest'
import { EnderecoService } from './EnderecoService'
import axios from 'axios'
import type { Endereco } from '@/services/lojistaService/LojistaModel'

// Mock do axios
vi.mock('axios')
const mockedAxios = axios as any

describe('EnderecoService', () => {
  let enderecoService: EnderecoService

  beforeEach(() => {
    enderecoService = new EnderecoService()
    vi.clearAllMocks()
  })

  describe('buscarEnderecoPorCep', () => {
    test('deve retornar endereço completo para CEP válido', async () => {
      const cepResponse = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: 'de 1823 ao fim - lado par',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107'
      }

      mockedAxios.get.mockResolvedValue({ data: cepResponse })

      const result = await enderecoService.buscarEnderecoPorCep('01310100')

      expect(result).toEqual({
        rua: 'Avenida Paulista',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100'
      })
    })

    test('deve retornar null para CEP inválido', async () => {
      const result = await enderecoService.buscarEnderecoPorCep('123')
      expect(result).toBeNull()
    })

    test('deve retornar null quando CEP não é encontrado', async () => {
      mockedAxios.get.mockResolvedValue({ data: { erro: true } })

      const result = await enderecoService.buscarEnderecoPorCep('00000000')
      expect(result).toBeNull()
    })

    test('deve lançar erro em caso de falha na API', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Erro de rede'))

      await expect(enderecoService.buscarEnderecoPorCep('01310100'))
        .rejects.toThrow('Não foi possível buscar o endereço. Tente novamente.')
    })
  })

  describe('validarEnderecoCompleto', () => {
    test('deve validar endereço completo', () => {
      const endereco: Partial<Endereco> = {
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Bairro Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310100'
      }

      expect(enderecoService.validarEnderecoCompleto(endereco)).toBe(true)
    })

    test('deve rejeitar endereço incompleto', () => {
      const endereco: Partial<Endereco> = {
        rua: 'Rua Teste',
        numero: '',
        bairro: 'Bairro Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310100'
      }

      expect(enderecoService.validarEnderecoCompleto(endereco)).toBe(false)
    })
  })

  describe('formatarEnderecoParaExibicao', () => {
    test('deve formatar endereço corretamente', () => {
      const endereco: Endereco = {
        rua: 'Rua Teste',
        numero: '123',
        bairro: 'Bairro Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310100',
        complemento: 'Apto 45'
      }

      const result = enderecoService.formatarEnderecoParaExibicao(endereco)
      expect(result).toBe('Rua Teste, 123, Bairro Teste, São Paulo, SP')
    })
  })

  describe('compararCeps', () => {
    test('deve comparar CEPs com formatações diferentes', () => {
      expect(enderecoService.compararCeps('01310100', '01310-100')).toBe(true)
      expect(enderecoService.compararCeps('01310100', '01310101')).toBe(false)
    })
  })
})