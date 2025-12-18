// src/services/seed.test.ts

import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { beforeAll, describe, expect, test } from 'vitest'

import { LojistaService } from './LojistaService'
import type { ProdutoModel } from './produtosService/ProdutosModel'
import { ProdutosService } from './produtosService/ProdutosService'

// -----------------------------------------------------
// CONFIGURAÇÃO DO AMBIENTE (Crucial para o Vitest)
// -----------------------------------------------------

// O ID Fixo que usaremos para o Lojista de Teste
const TEST_LOJISTA_ID = 'TESTE_DEV_LOJA'

// Dados iniciais (os mesmos que você usaria no seu script)
const INITIAL_LOJISTA_DATA = {
  nomeLoja: 'Lanchonete Dev - Cardápio Local',
  whatsapp: '5511999999999',
  fotoUrl:
    'https://imgs.search.brave.com/59qJuS6Ffw4EG9pCztXXKDUcEK8o17HGVgP9ZtYNWks/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNTM1/MzUyNTgxL3B0L3Zl/dG9yaWFsL25vaXRl/LXJldHJvLTUwcy1s/YW5jaG9uZXRlLW1l/bnUtcHJldG8tZS1i/cmFuY28tdmVyaWZp/Y2FyLmpwZz9zPTYx/Mng2MTImdz0wJms9/MjAmYz1yUzhfRVI1/LUpBSVY1em15Y1lB/Z1B6Y1JJQ29YeTRB/WEZvOGxyM1I2TVN3/PQ',
}

// Configurações Mock (Não precisam ser reais, apenas para inicializar o app)
const MOCK_FIREBASE_CONFIG = {
  apiKey: 'fake-key',
  authDomain: 'fake-project.firebaseapp.com',
  projectId: 'fake-project',
  storageBucket: 'fake-project.appspot.com',
  messagingSenderId: 'fake-id',
  appId: 'fake-app-id',
}

const produtosTeste: ProdutoModel[] = [
  {
    id: 'prod_1',
    nome: 'X-Bacon Supremo',
    descricao:
      'Pão brioche, 2 hambúrgueres de 150g, bacon crocante, queijo cheddar e maionese da casa.',
    preco: 29.9,
    categoria: 'Lanches',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: TEST_LOJISTA_ID,
  },
  {
    id: 'prod_2',
    nome: 'Coca-Cola Lata',
    descricao: 'Lata 350ml gelada.',
    preco: 5.0,
    categoria: 'Bebidas',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: TEST_LOJISTA_ID,
  },
  {
    id: 'prod_3',
    nome: 'Batata Frita Rústica',
    descricao: 'Porção individual com alecrim e páprica.',
    preco: 12.0,
    categoria: 'Acompanhamentos',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: TEST_LOJISTA_ID,
  },
]

// -----------------------------------------------------
// TESTE DE POPULAÇÃO
// -----------------------------------------------------

describe('SEED DATA: População Inicial no Firebase Emulator', () => {
  let lojistaService: LojistaService
  let cardapioService: ProdutosService

  // Inicializa e conecta ao Emulator ANTES de todos os testes neste arquivo
  beforeAll(() => {
    console.log('[SEED TEST] Conectando ao Firebase Emulator na porta 8080...')

    // 1. APLICAÇÃO DO PADRÃO SINGLETON AQUI:
    // Se já existir um app, usa o existente. Caso contrário, inicializa com o mock.
    const app = getApps().length > 0 ? getApp() : initializeApp(MOCK_FIREBASE_CONFIG)

    // 2. Conecta o Firestore ao Emulator (Porta padrão: 8080)
    const db = getFirestore(app)
    connectFirestoreEmulator(db, 'localhost', 8080)

    lojistaService = new LojistaService()
    cardapioService = new ProdutosService()
  })

  test('deve criar ou atualizar o lojista de teste e popular o cardápio', async () => {
    // 1. Verificar/Criar Lojista
    let lojista = await lojistaService.getLojista(TEST_LOJISTA_ID)

    if (!lojista) {
      console.log(`[SEED] Criando lojista ${TEST_LOJISTA_ID}...`)
    } else {
      console.log(`[SEED] Lojista ${TEST_LOJISTA_ID} existente. Atualizando metadados.`)
    }

    // Usa atualizarLojista para garantir o UPSERT (criação ou atualização) com ID fixo.
    await lojistaService.atualizarLojista(TEST_LOJISTA_ID, INITIAL_LOJISTA_DATA)

    lojista = await lojistaService.getLojista(TEST_LOJISTA_ID)
    expect(lojista).not.toBeNull()
    expect(lojista?.nomeLoja).toBe(INITIAL_LOJISTA_DATA.nomeLoja)

    // 2. Popular Cardápio
    console.log(`[SEED] Populando cardápio 'principal' com dados de teste.`)
    await Promise.all(produtosTeste.map((produto) => cardapioService.salvar(produto)))

    // 3. Verificação Final
    const cardapio = await cardapioService.getLista(TEST_LOJISTA_ID)

    expect(cardapio).not.toBeNull()
    expect(cardapio?.length).toBeGreaterThan(0) // Garante que produtos foram inseridos
    console.log(`[SEED] População concluída com sucesso para ID: ${TEST_LOJISTA_ID}`)
  }, 10000) // Aumentamos o timeout para 10s caso a conexão demore
})
