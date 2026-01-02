import type { ProdutoModel } from '../produtosService/ProdutosModel'
import type { ProdutoEmCarrinho } from './CarrinhoModel'

export class CarrinhoService {
  private KEY = 'produtos_json'

  public adicionarProduto(produto: ProdutoModel) {
    const lista = this.listar()

    const produtoBuscado = this.buscarProduto(lista, produto.id)

    if (produtoBuscado != undefined) {
      produtoBuscado.quantidade = produtoBuscado.quantidade + 1

      this.persistir(lista)
      return
    }

    const produtoDeCarrinho: ProdutoEmCarrinho = { ...produto, quantidade: 1 }
    lista.push(produtoDeCarrinho)

    this.persistir(lista)
  }

  private buscarProduto(lista: ProdutoEmCarrinho[], id: string) {
    return lista.find((p) => p.id == id)
  }

  public listar() {
    const jsonList = localStorage.getItem(this.KEY)
    if (jsonList == undefined || jsonList == null) return []
    return JSON.parse(jsonList) as ProdutoEmCarrinho[]
  }

  public calcularTotal(): number {
    const lista = this.listar()

    return lista.reduce((total, produto) => {
      return total + produto.preco * produto.quantidade
    }, 0)
  }

  public quantidadeItens(): number {
    const lista = this.listar()

    return lista.reduce((total, produto) => {
      return total + produto.quantidade
    }, 0)
  }

  public removerProduto(id: string) {
    const lista = this.listar()
    const produtoBuscado = this.buscarProduto(lista, id)

    if (produtoBuscado != undefined) {
      const novaLista = lista.filter((p) => p.id != id)
      this.persistir(novaLista)
    }
  }

  public esvaziarCarrinho() {
    localStorage.removeItem(this.KEY)
  }

  private persistir(lista: ProdutoEmCarrinho[]) {
    localStorage.setItem(this.KEY, JSON.stringify(lista))
  }
}
