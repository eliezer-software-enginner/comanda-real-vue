import axios from 'axios'
import logger from '@/plugins/logs'
import type { Endereco } from '@/services/lojistaService/LojistaModel'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export interface EnderecoParcial {
  rua: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export class EnderecoService {
  private readonly VIACEP_URL = 'https://viacep.com.br/ws'

  /**
   * Busca endereço pelo CEP utilizando a API ViaCEP
   */
  async buscarEnderecoPorCep(cep: string): Promise<EnderecoParcial | null> {
    try {
      const cepLimpo = cep.replace(/\D/g, '')
      
      if (cepLimpo.length !== 8) {
        logger.warn('CEP inválido', {
          label: 'EnderecoService',
          method: 'buscarEnderecoPorCep',
          dado: { cep: cepLimpo }
        })
        return null
      }

      logger.info('Buscando endereço pelo CEP', {
        label: 'EnderecoService',
        method: 'buscarEnderecoPorCep',
        dado: { cep: cepLimpo }
      })

      const response = await axios.get<ViaCepResponse>(`${this.VIACEP_URL}/${cepLimpo}/json/`)
      
      if (response.data.erro) {
        logger.warn('CEP não encontrado na base ViaCEP', {
          label: 'EnderecoService',
          method: 'buscarEnderecoPorCep',
          dado: { cep: cepLimpo }
        })
        return null
      }

      const endereco: EnderecoParcial = {
        rua: response.data.logradouro || '',
        bairro: response.data.bairro || '',
        cidade: response.data.localidade || '',
        estado: response.data.uf || '',
        cep: response.data.cep
      }

      logger.info('Endereço encontrado com sucesso', {
        label: 'EnderecoService',
        method: 'buscarEnderecoPorCep',
        dado: { cep: cepLimpo, endereco }
      })

      return endereco

    } catch (error) {
      logger.error('Erro ao buscar endereço pelo CEP', {
        label: 'EnderecoService',
        method: 'buscarEnderecoPorCep',
        dado: { cep },
        error: error instanceof Error ? error.message : String(error)
      })
      
      throw new Error('Não foi possível buscar o endereço. Tente novamente.')
    }
  }

  /**
   * Valida se todos os campos obrigatórios do endereço estão preenchidos
   */
  validarEnderecoCompleto(endereco: Partial<Endereco>): boolean {
    return !!(
      endereco.rua?.trim() &&
      endereco.numero?.trim() &&
      endereco.bairro?.trim() &&
      endereco.cidade?.trim() &&
      endereco.estado?.trim() &&
      endereco.cep?.trim()
    )
  }

  /**
   * Formata o endereço para exibição em uma linha
   */
  formatarEnderecoParaExibicao(endereco: Endereco): string {
    const partes = [
      endereco.rua,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.estado
    ].filter(Boolean)

    return partes.join(', ')
  }

  /**
   * Compara dois CEPs para verificação de atendimento
   */
  compararCeps(cep1: string, cep2: string): boolean {
    const cep1Limpo = cep1.replace(/\D/g, '')
    const cep2Limpo = cep2.replace(/\D/g, '')
    
    return cep1Limpo === cep2Limpo
  }
}