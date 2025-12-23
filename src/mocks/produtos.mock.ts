import type { CategoriaDto } from '@/services/categoriasService/CategoriaDto'
import type { ProdutoDto } from '@/services/produtosService/ProdutoDto'
import { LOJISTA_ID } from './lojista-mock'

export type CategoriasIdsMockType = 'SALADA_' | 'ASSADOS_' | 'LANCHES_'
export const categoriasIdSalada: CategoriasIdsMockType = 'SALADA_'
export const categoriasIdAssados: CategoriasIdsMockType = 'ASSADOS_'
export const categoriasIdLanches: CategoriasIdsMockType = 'LANCHES_'

export const categoriasMock: CategoriaDto[] = [
  {
    lojistaId: LOJISTA_ID,
    nome: 'salada',
    id: 'SALADA_',
  },
  {
    lojistaId: LOJISTA_ID,
    nome: 'assados',
    id: 'ASSADOS_',
  },
  {
    lojistaId: LOJISTA_ID,
    nome: 'lanches',
    id: 'LANCHES_',
  },
]

export const produtosTeste: ProdutoDto[] = [
  {
    nome: 'X-Bacon Supremo',
    descricao:
      'Pão brioche, 2 hambúrgueres de 150g, bacon crocante, queijo cheddar e maionese da casa.',
    preco: 29.9,
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdLanches,
  },
  {
    nome: 'Coca-Cola Lata',
    descricao: 'Lata 350ml gelada.',
    preco: 5.0,
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdSalada,
  },
  {
    nome: 'Batata Frita Rústica',
    descricao: 'Porção individual com alecrim e páprica.',
    preco: 12.0,
    imagemUrl:
      'https://imgs.search.brave.com/3rSVij0jhsZYblY1eMa7x23QcjmtaqUjZJ4DL9yClJA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTM4/NzAzNy9wZXhlbHMt/cGhvdG8tMTM4NzAz/Ny5qcGVnP2F1dG89/Y29tcHJlc3MmY3M9/dGlueXNyZ2ImZHBy/PTEmdw01MDA',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdLanches,
  },
]
