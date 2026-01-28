import logger from '@/plugins/logs'

export interface EnderecoSalvo {
  id: string
  nome: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cep: string
  referencia: string
  cidade: string
  estado: string
  padrao?: boolean
}

export class EnderecosSalvosService {
  private readonly STORAGE_KEY = 'enderecos_salvos'

  listar(): EnderecoSalvo[] {
    try {
      const enderecosJson = localStorage.getItem(this.STORAGE_KEY)
      return enderecosJson ? JSON.parse(enderecosJson) : []
    } catch (error) {
      logger.error('Erro ao listar endereços salvos', { 
        label: 'EnderecosSalvosService',
        method: 'listar',
        error 
      })
      return []
    }
  }

  salvar(endereco: Omit<EnderecoSalvo, 'id'>): EnderecoSalvo {
    try {
      const enderecos = this.listar()
      const novoEndereco: EnderecoSalvo = {
        ...endereco,
        id: Date.now().toString()
      }

      // Se for o primeiro endereço ou marcado como padrão, remove o padrão dos outros
      if (novoEndereco.padrao || enderecos.length === 0) {
        enderecos.forEach(e => e.padrao = false)
        novoEndereco.padrao = true
      }

      enderecos.push(novoEndereco)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enderecos))

      logger.info('Endereço salvo com sucesso', {
        label: 'EnderecosSalvosService',
        method: 'salvar',
        data: { enderecoId: novoEndereco.id }
      })

      return novoEndereco
    } catch (error) {
      logger.error('Erro ao salvar endereço', {
        label: 'EnderecosSalvosService',
        method: 'salvar',
        error
      })
      throw new Error('Não foi possível salvar o endereço')
    }
  }

  atualizar(id: string, dados: Partial<EnderecoSalvo>): EnderecoSalvo {
    try {
      const enderecos = this.listar()
      const indice = enderecos.findIndex(e => e.id === id)
      
      if (indice === -1) {
        throw new Error('Endereço não encontrado')
      }

      // Se estiver marcando como padrão, remove o padrão dos outros
      if (dados.padrao) {
        enderecos.forEach(e => e.padrao = false)
      }

      enderecos[indice] = { ...enderecos[indice], ...dados } as EnderecoSalvo
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enderecos))

      logger.info('Endereço atualizado com sucesso', {
        label: 'EnderecosSalvosService',
        method: 'atualizar',
        data: { enderecoId: id }
      })

      return enderecos[indice]
    } catch (error) {
      logger.error('Erro ao atualizar endereço', {
        label: 'EnderecosSalvosService',
        method: 'atualizar',
        error
      })
      throw new Error('Não foi possível atualizar o endereço')
    }
  }

  excluir(id: string): boolean {
    try {
      const enderecos = this.listar()
      const enderecoExcluido = enderecos.find(e => e.id === id)
      
      if (!enderecoExcluido) {
        throw new Error('Endereço não encontrado')
      }

      const enderecosFiltrados = enderecos.filter(e => e.id !== id)
      
      // Se o endereço excluído era o padrão, define o primeiro como padrão
      if (enderecoExcluido.padrao && enderecosFiltrados.length > 0) {
        enderecosFiltrados[0]!.padrao = true
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(enderecosFiltrados))

      logger.info('Endereço excluído com sucesso', {
        label: 'EnderecosSalvosService',
        method: 'excluir',
        data: { enderecoId: id }
      })

      return true
    } catch (error) {
      logger.error('Erro ao excluir endereço', {
        label: 'EnderecosSalvosService',
        method: 'excluir',
        error
      })
      throw new Error('Não foi possível excluir o endereço')
    }
  }

  definirPadrao(id: string): EnderecoSalvo {
    return this.atualizar(id, { padrao: true })
  }

  obterPadrao(): EnderecoSalvo | null {
    try {
      const enderecos = this.listar()
      return enderecos.find(e => e.padrao) || null
    } catch (error) {
      logger.error('Erro ao obter endereço padrão', {
        label: 'EnderecosSalvosService',
        method: 'obterPadrao',
        error
      })
      return null
    }
  }

  obterPorId(id: string): EnderecoSalvo | null {
    try {
      const enderecos = this.listar()
      return enderecos.find(e => e.id === id) || null
    } catch (error) {
      logger.error('Erro ao obter endereço por ID', {
        label: 'EnderecosSalvosService',
        method: 'obterPorId',
        error
      })
      return null
    }
  }

  migrarEnderecoAntigo(): void {
    try {
      // Migra o endereço antigo do localStorage para o novo formato
      const enderecoAntigo = localStorage.getItem('endereco_entrega')
      if (enderecoAntigo && this.listar().length === 0) {
        const endereco = JSON.parse(enderecoAntigo)
        this.salvar({
          nome: 'Endereço Principal',
          ...endereco,
          padrao: true
        })
        
        // Remove o endereço antigo após migração
        localStorage.removeItem('endereco_entrega')
        
        logger.info('Endereço antigo migrado com sucesso', {
          label: 'EnderecosSalvosService',
          method: 'migrarEnderecoAntigo'
        })
      }
    } catch (error) {
      logger.error('Erro ao migrar endereço antigo', {
        label: 'EnderecosSalvosService',
        method: 'migrarEnderecoAntigo',
        error
      })
    }
  }
}