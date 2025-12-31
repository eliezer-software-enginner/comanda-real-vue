import type { ProdutoModel } from '../produtosService/ProdutosModel'

export type Carrinho = {
  produtos: ProdutoEmCarrinho[]
}

export interface ProdutoEmCarrinho extends ProdutoModel {
  quantidade: number
}
