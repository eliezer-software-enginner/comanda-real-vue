import type { Cardapio, Produto } from '@/types/global'
import { doc, getDoc, writeBatch } from 'firebase/firestore'

import { db } from './firebaseConfig'

// Tipos auxiliares para o banco
interface LojistaData {
  nomeLoja: string
  fotoUrl?: string
  whatsapp?: string
}

interface CardapioData {
  produtos: Produto[]
  updatedAt: Date
}

export const saveCardapio = async (cardapio: Cardapio): Promise<void> => {
  try {
    const batch = writeBatch(db)

    // 1. Salvar dados do Lojista
    const lojistaRef = doc(db, 'apps', 'comanda-direta', 'lojistas', cardapio.id)
    const lojistaData: LojistaData = {
      nomeLoja: cardapio.nomeLoja,
      fotoUrl: cardapio.fotoUrl,
      whatsapp: cardapio.whatsapp,
    }
    batch.set(lojistaRef, lojistaData, { merge: true })

    // 2. Salvar dados do Cardápio (Subcollection ou collection separada, aqui faremos subcollection para organizar)
    // Estrutura: apps/comanda-direta/lojistas/{id}/cardapios/principal
    const cardapioRef = doc(
      db,
      'apps',
      'comanda-direta',
      'lojistas',
      cardapio.id,
      'cardapios',
      'principal',
    )
    const cardapioData: CardapioData = {
      produtos: cardapio.produtos,
      updatedAt: new Date(),
    }
    batch.set(cardapioRef, cardapioData)

    await batch.commit()
    console.log(`Lojista e Cardápio ${cardapio.id} salvos com sucesso!`)
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
    throw error
  }
}

export const getCardapio = async (lojaId: string): Promise<Cardapio | null> => {
  try {
    const lojistaRef = doc(db, 'apps', 'comanda-direta', 'lojistas', lojaId)
    const cardapioRef = doc(
      db,
      'apps',
      'comanda-direta',
      'lojistas',
      lojaId,
      'cardapios',
      'principal',
    )

    // Buscando em paralelo
    const [lojistaSnap, cardapioSnap] = await Promise.all([getDoc(lojistaRef), getDoc(cardapioRef)])

    if (lojistaSnap.exists()) {
      const lojistaData = lojistaSnap.data() as LojistaData
      const produtos = cardapioSnap.exists() ? (cardapioSnap.data() as CardapioData).produtos : []

      return {
        id: lojaId,
        nomeLoja: lojistaData.nomeLoja,
        fotoUrl: lojistaData.fotoUrl,
        whatsapp: lojistaData.whatsapp,
        produtos: produtos,
      }
    } else {
      console.log('Loja não encontrada!')
      return null
    }
  } catch (error) {
    console.error('Erro ao buscar cardápio completo:', error)
    throw error
  }
}

export const loadTestCardapio = async (lojaId: string): Promise<void> => {
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
    fotoUrl: 'https://example.com/lanchonete-teste.jpg', // Adicionado para teste
    whatsapp: '5511987654321', // Adicionado para teste
  }

  await saveCardapio(cardapioTeste)
}
