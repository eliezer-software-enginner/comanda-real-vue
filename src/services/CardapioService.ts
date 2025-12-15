import type { Cardapio, Produto } from '@/types/global'
import { doc, getDoc, writeBatch } from 'firebase/firestore'

import { LojistaService } from './LojistaService' // Importa o serviço de Lojista
import { db } from './firebaseConfig'

// Tipos auxiliares internos para o banco de dados
interface CardapioData {
  produtos: Produto[]
  updatedAt: Date
}

export class CardapioService {
  private lojistaService = new LojistaService()

  private getCardapioRef(lojaId: string) {
    // Estrutura: apps/comanda-direta/lojistas/{id}/cardapios/principal
    return doc(db, 'apps', 'comanda-direta', 'lojistas', lojaId, 'cardapios', 'principal')
  }

  /**
   * Salva tanto os metadados do Lojista quanto a lista de produtos.
   * @param cardapio - O objeto Cardapio completo.
   */
  async salvarCardapio(cardapio: Cardapio): Promise<void> {
    try {
      const batch = writeBatch(db)

      // 1. Salvar dados do Lojista (separando responsabilidade)
      const lojistaData = {
        nomeLoja: cardapio.nomeLoja,
        fotoUrl: cardapio.fotoUrl,
        whatsapp: cardapio.whatsapp,
      }
      // Reutiliza o método do LojistaService para salvar os metadados
      await this.lojistaService.salvarLojista(cardapio.id, lojistaData)

      // 2. Salvar dados do Cardápio (Produtos)
      const cardapioRef = this.getCardapioRef(cardapio.id)
      const cardapioData: CardapioData = {
        produtos: cardapio.produtos,
        updatedAt: new Date(),
      }

      // Usamos uma nova transação batch para a lista de produtos,
      // ou se quisermos garantir que ambos sejam atômicos, poderíamos
      // passar o batch para o salvarLojista (mas isso complexifica o Service).
      // Vamos mantê-los separados para simplificar a dependência entre Services.
      const batchProdutos = writeBatch(db)
      batchProdutos.set(cardapioRef, cardapioData)
      await batchProdutos.commit()

      console.log(`Lojista e Produtos ${cardapio.id} salvos com sucesso!`)
    } catch (error) {
      console.error('Erro ao salvar dados completos:', error)
      throw error
    }
  }

  /**
   * Obtém o Cardápio completo, combinando dados do Lojista e a lista de Produtos.
   * @param lojaId - ID único da loja.
   */
  async getCardapio(lojaId: string): Promise<Cardapio | null> {
    try {
      // 1. Obter dados do Lojista
      const lojistaData = await this.lojistaService.getLojista(lojaId)

      if (!lojistaData) {
        console.log('Loja não encontrada!')
        return null
      }

      // 2. Obter lista de Produtos
      const cardapioRef = this.getCardapioRef(lojaId)
      const cardapioSnap = await getDoc(cardapioRef)

      const produtos: Produto[] = cardapioSnap.exists()
        ? (cardapioSnap.data() as CardapioData).produtos
        : []

      // 3. Combinar e retornar
      return {
        id: lojaId,
        nomeLoja: lojistaData.nomeLoja,
        fotoUrl: lojistaData.fotoUrl,
        whatsapp: lojistaData.whatsapp,
        produtos: produtos,
      }
    } catch (error) {
      console.error('Erro ao buscar cardápio completo:', error)
      throw error
    }
  }

  // Mantido aqui como função utilitária para preencher dados
  async loadTestCardapio(lojaId: string): Promise<void> {
    // ... (restante do código de produtosTeste e cardapioTeste é o mesmo)
    const produtosTeste: Produto[] = [
      {
        id: 'prod_1',
        nome: 'X-Bacon Supremo',
        descricao:
          'Pão brioche, 2 hambúrgueres de 150g, bacon crocante, queijo cheddar e maionese da casa.',
        preco: 29.9,
        categoria: 'Lanches',
        imagemUrl:
          'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      },
      {
        id: 'prod_2',
        nome: 'Coca-Cola Lata',
        descricao: 'Lata 350ml gelada.',
        preco: 5.0,
        categoria: 'Bebidas',
        imagemUrl:
          'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      },
      {
        id: 'prod_3',
        nome: 'Batata Frita Rústica',
        descricao: 'Porção individual com alecrim e páprica.',
        preco: 12.0,
        categoria: 'Acompanhamentos',
        imagemUrl:
          'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
      },
    ]

    const cardapioTeste: Cardapio = {
      id: lojaId,
      nomeLoja: 'Lanchonete do Teste',
      produtos: produtosTeste,
      fotoUrl: 'https://example.com/lanchonete-teste.jpg',
      whatsapp: '5511987654321',
    }

    // Chama a função de salvar do próprio serviço
    await this.salvarCardapio(cardapioTeste)
  }
}
