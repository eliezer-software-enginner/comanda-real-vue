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
      'https://i.ibb.co/WvgQmZzH/AQNk-Ifqct4p1hkv4d-Myg-V8-1-Tl-RP6p5-Z4z-Xq-Sfnejc-Io12-Tt4-R-w1-OWiq-KLb-W7-Taf4b-D5s2-Qrc3-GGZ5x0z7up-C6-W.jpg',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdLanches,
    tipo: 'principal',
    adicionaisIds: [],
    acompanhamentosIds: [],
  },
  {
    nome: 'Coca-Cola Lata',
    descricao: 'Lata 350ml gelada.',
    preco: 5.0,
    imagemUrl:
      'https://i.ibb.co/Z1FtjzYp/AQMh5utu-Vq-WZZvrd-DFmuap-WQ85-X8-NCUa4-Jdw-AQ2faupeuq-N-ORWSG8f-Nz9-FLAy-R0-Em-Vaq8-DWBYD0xz8-Ob-Cx-Chehc.jpg',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdSalada,
    tipo: 'acompanhamento',
    adicionaisIds: [],
    acompanhamentosIds: [],
  },
  {
    nome: 'Batata Frita Rústica',
    descricao: 'Porção individual com alecrim e páprica.',
    preco: 12.0,
    imagemUrl:
      'https://i.ibb.co/8DbsdPTh/AQOQDLo1-Fo-CWRTSk-Vpv-SIjr-J6-H79-Ssqh-Vuf-P3p-Zsox2-OVul-Kw-Haq-KIA2e-Ehe-X-6s-JJ-Ut-Ntr-Frr-Q3qsu-Fkp.jpg',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdLanches,
    tipo: 'principal',
    adicionaisIds: [],
    acompanhamentosIds: [],
  },
  {
    nome: 'Maionese caseira',
    descricao: '',
    preco: 1,
    imagemUrl:
      'https://i.ibb.co/hJZWp38D/AQPYMRw-Gib-G62cx-POS-2-QQQa-TFGjc-Sr5-Jl-Xf-Ims6-Gpx-ZQWDOg-m-Ss-Z-Ki-HC9mpfbn-NSSW3uv-AT0-Vc-ATNLclj-A.jpg',
    lojistaId: LOJISTA_ID,
    categoriaId: categoriasIdLanches,
    tipo: 'adicional',
    adicionaisIds: [],
    acompanhamentosIds: [],
  },
]
