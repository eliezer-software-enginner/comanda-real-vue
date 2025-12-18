import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { LOJISTA_ID } from './lojista-mock'

export const produtosTeste: ProdutoModel[] = [
  {
    id: 'prod_1',
    nome: 'X-Bacon Supremo',
    descricao:
      'Pão brioche, 2 hambúrgueres de 150g, bacon crocante, queijo cheddar e maionese da casa.',
    preco: 29.9,
    categoria: 'Lanches',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
  },
  {
    id: 'prod_2',
    nome: 'Coca-Cola Lata',
    descricao: 'Lata 350ml gelada.',
    preco: 5.0,
    categoria: 'Bebidas',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
  },
  {
    id: 'prod_3',
    nome: 'Batata Frita Rústica',
    descricao: 'Porção individual com alecrim e páprica.',
    preco: 12.0,
    categoria: 'Acompanhamentos',
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
  },
]
