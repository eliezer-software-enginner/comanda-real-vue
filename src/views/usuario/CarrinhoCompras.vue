<template>
  <div>
    <v-toolbar flat color="white" class="border-b">
      <v-btn icon @click="$router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="text-body-1 font-weight-bold text-center">Meu pedido</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <br />
    <ListaProdutos
      :carrinho="carrinho"
      @aumentar="aumentarQuantidade"
      @diminuir="diminuirQuantidade"
      @confirmar-exclusao="excluirProduto"
      @adicionar-mais="redirecionaAoCardapio"
    />

    <FormaEntrega
      v-model:tipoEntrega="tipoEntrega"
      :enderecoSelecionado="enderecoSelecionado"
      @abrir-endereco="dialogEndereco = true"
      @editar-endereco="abrirDialogEdicao"
    />
    <EnderecoEntrega v-model="dialogEndereco" @confirmar="enderecoConfirmado" />

    <div class="btnFinalizar" @click="finalizarPedido">
      <span>Finalizar pedido <v-icon>mdi-arrow-right</v-icon></span>
      <span class="text-h6 font-weight-bold">TOTAL: R$ {{ precoTotalCarrinho.toFixed(2) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import EnderecoEntrega from '@/components/usuario/EnderecoEntrega.vue'
import FormaEntrega from '@/components/usuario/FormaEntrega.vue'
import ListaProdutos from '@/components/usuario/ListaProdutos.vue'
import type { ProdutoEmCarrinho } from '@/services/carrinhoService/CarrinhoModel'
import type { EnderecoSalvo } from '@/services/enderecosSalvosService/EnderecosSalvosService'
import { CarrinhoService } from '@/services/carrinhoService/CarrinhoService'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import { EnderecosSalvosService } from '@/services/enderecosSalvosService/EnderecosSalvosService'

export default {
  data() {
    return {
      carrinho: [] as ProdutoEmCarrinho[],
      taxaEntrega: 2,
      carrinhoService: new CarrinhoService(),
      lojistaService: new LojistaService(),
      tipoEntrega: null,
      dialogEndereco: false,
      erroEntrega: false,
      observacaoPedido: '',
      enderecoSelecionado: null as EnderecoSalvo | null,
      enderecosSalvosService: new EnderecosSalvosService(),
    }
  },

  components: {
    ListaProdutos,
    FormaEntrega,
    EnderecoEntrega,
  },
  computed: {
    precoTotalCarrinho() {
      return this.carrinho.reduce((total, item) => total + item.preco * item.quantidade, 0)
    },

    totalComTaxa() {
      return this.precoTotalCarrinho + this.taxaEntrega
    },

    whatsappMessage() {
      if (this.carrinho.length === 0) return ''

      let message = `🛒 *NOVO PEDIDO*\n\n`
      message += `*Itens do pedido:*\n`

      this.carrinho.forEach((item, index) => {
        message += `${index + 1}. ${item.nome} - ${item.quantidade}x - R$ ${(item.preco * item.quantidade).toFixed(2)}\n`
      })

      message += `\n*Subtotal:* R$ ${this.precoTotalCarrinho.toFixed(2)}`
      message += `\n*Taxa de entrega:* R$ ${this.taxaEntrega.toFixed(2)}`
      message += `\n*TOTAL:* R$ ${this.totalComTaxa.toFixed(2)}`

      if (this.observacaoPedido.trim()) {
        message += `\n\n*Observações:* ${this.observacaoPedido}`
      }

      return message
    },
  },

  mounted() {
    this.atualizarCarrinho()
    this.migrarECarregarEnderecos()

    // Escuta atualizações do carrinho
    window.addEventListener('carrinho-atualizado', this.atualizarCarrinho)
  },

  beforeUnmount() {
    window.removeEventListener('carrinho-atualizado', this.atualizarCarrinho)
  },

  methods: {
    validarEntrega() {
      if (!this.tipoEntrega) {
        this.erroEntrega = true
        return
      }
      this.erroEntrega = false
      // continua o fluxo
    },
    atualizarCarrinho() {
      this.carrinho = this.carrinhoService.listar()
    },

    aumentarQuantidade(item: ProdutoEmCarrinho) {
      this.carrinhoService.adicionarProduto(item)
      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },

    diminuirQuantidade(item: ProdutoEmCarrinho) {
      item.quantidade--
      localStorage.setItem('produtos_json', JSON.stringify(this.carrinho))

      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },
    excluirProduto(produto: ProdutoEmCarrinho) {
      this.carrinhoService.removerProduto(produto.id)
      this.atualizarCarrinho()
      window.dispatchEvent(new Event('carrinho-atualizado'))
    },
    migrarECarregarEnderecos() {
      try {
        // Primeiro, tenta migrar endereços antigos
        this.enderecosSalvosService.migrarEnderecoAntigo()

        // Depois, carrega o endereço padrão
        const enderecoPadrao = this.enderecosSalvosService.obterPadrao()
        if (enderecoPadrao) {
          this.enderecoSelecionado = enderecoPadrao
        }
      } catch (error) {
        console.error('Erro ao carregar endereços:', error)
      }
    },

    enderecoConfirmado(endereco: EnderecoSalvo) {
      this.enderecoSelecionado = endereco
    },

    abrirDialogEdicao() {
      this.dialogEndereco = true
    },

    redirecionaAoCardapio() {
      this.$router.push({
        name: 'cardapio',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
        },
      })
    },

    voltarAoCardapio() {
      this.$router.push({
        name: 'cardapio',
        query: {
          estabelecimento: this.$route.query.estabelecimento,
        },
      })
    },

    async finalizarPedido() {
      if (this.carrinho.length === 0) {
        alert('Seu carrinho está vazio!')
        return
      }

      // Validação de tipo de entrega
      if (!this.tipoEntrega) {
        alert('Por favor, selecione o tipo de entrega.')
        return
      }

      // Validação de endereço para delivery
      if (this.tipoEntrega === 'entrega' && !this.enderecoSelecionado) {
        alert('Por favor, informe seu endereço de entrega.')
        return
      }

      // Constrói mensagem com endereço se for delivery
      let mensagemFinal = this.whatsappMessage

      if (this.tipoEntrega === 'entrega' && this.enderecoSelecionado) {
        mensagemFinal += `\n\n*Endereço de Entrega:*\n`
        mensagemFinal += `*${this.enderecoSelecionado.nome}*\n`
        mensagemFinal += `${this.enderecoSelecionado.rua}, ${this.enderecoSelecionado.numero}`
        if (this.enderecoSelecionado.complemento) {
          mensagemFinal += ` - ${this.enderecoSelecionado.complemento}`
        }
        mensagemFinal += `\nBairro: ${this.enderecoSelecionado.bairro}`
        mensagemFinal += `\n${this.enderecoSelecionado.cidade}/${this.enderecoSelecionado.estado}`
        mensagemFinal += `\nCEP: ${this.enderecoSelecionado.cep}`
        mensagemFinal += `\nReferência: ${this.enderecoSelecionado.referencia}`
      } else if (this.tipoEntrega === 'retirada') {
        mensagemFinal += `\n\n*Tipo de entrega:* Retirada no local`
      }

      // Obtém o WhatsApp do lojista (poderia vir do serviço ou rota)
      const whatsappLojista = (this.$route.query.whatsapp as string) || '5511999999999'

      // Formata o número para o WhatsApp
      const whatsappFormatted = whatsappLojista.replace(/\D/g, '')

      // Codifica a mensagem para URL
      const encodedMessage = encodeURIComponent(mensagemFinal)

      // Constrói a URL do WhatsApp
      const whatsappUrl = `https://wa.me/${whatsappFormatted}?text=${encodedMessage}`

      // Abre o WhatsApp em nova aba
      window.open(whatsappUrl, '_blank')

      // Opcional: limpar carrinho após finalizar
      // this.carrinhoService.esvaziarCarrinho()
      // this.atualizarCarrinho()
    },
  },
}
</script>

<style scoped>
:deep(.v-toolbar),
:deep(.v-toolbar__content) {
  background-color: #ffffff !important;
}

.btnFinalizar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  font-weight: 600;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  z-index: 2;
  background-color: rgb(0, 145, 19);
}
</style>
