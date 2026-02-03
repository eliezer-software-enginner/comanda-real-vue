<script setup lang="ts">
import { PedidoService } from '@/services/pedidoService/PedidoService'
import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'
import { ProdutosService } from '@/services/produtosService/ProdutosService'
import { Utils } from '@/utils/Utils'
import { onMounted, ref, type Ref } from 'vue'
// O useCssModule() permite acessar as classes no <script> se necessário
import { useCssModule } from 'vue'
import { useLojistaStore } from '../../stores/lojista'

const $style = useCssModule()

const lojistaId = useLojistaStore().lojistaId

const pedidoService = new PedidoService(lojistaId!)
const produtosService = new ProdutosService(lojistaId!)

const stats = ref({
  vendasTotal: '0',
  pedidos24h: 0,
  pedidos7d: 0,
  pedidos30d: 0,
  produtosBaixoEstoque: 0,
  pedidosPendentes: 0,
})

const maisVendidos: Ref<ProdutoModel[]> = ref([])

onMounted(async () => {
  stats.value.pedidos24h = await pedidoService.getTotalPedidosByTempo('24H')
  stats.value.pedidos7d = await pedidoService.getTotalPedidosByTempo('7dias')
  stats.value.pedidos30d = await pedidoService.getTotalPedidosByTempo('30dias')
  stats.value.pedidosPendentes = await pedidoService.getTotalPedidosByStatus('pagamento-pendente')
  stats.value.vendasTotal = Utils.getMoedaFormatada(
    await pedidoService.getFaturamentoByTempo('24H'),
  )
  maisVendidos.value = await produtosService.getMaisVendidos()
})
</script>

<template>
  <v-container fluid :class="$style.mainContainer">
    <div :class="$style.headerSection">
      <h1 :class="$style.pageTitle">Dashboard</h1>
      <p :class="$style.pageSubtitle">Visão geral do desempenho do seu estabelecimento.</p>
    </div>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card :class="[$style.statCard, $style.kpiBlue]" variant="flat">
          <v-card-item title="Faturamento Total">
            <template v-slot:append><v-icon icon="mdi-currency-usd"></v-icon></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.vendasTotal }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card :class="[$style.statCard, $style.kpiGreen]" variant="flat">
          <v-card-item title="Pedidos (24h)">
            <template v-slot:append><v-icon icon="mdi-clock-outline"></v-icon></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.pedidos24h }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card :class="[$style.statCard, $style.kpiOrange]" variant="flat">
          <v-card-item title="Pendentes de pagamento">
            <template v-slot:append><v-icon icon="mdi-alert-circle"></v-icon></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.pedidosPendentes }}</v-card-text>
        </v-card>
      </v-col>

      <!-- <v-col cols="12" sm="6" md="3">
        <v-card :class="[$style.statCard, $style.kpiRed]" variant="flat">
          <v-card-item title="Estoque Crítico">
            <template v-slot:append
              ><v-icon icon="mdi-package-variant-closed-remove"></v-icon
            ></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.produtosBaixoEstoque }}</v-card-text>
        </v-card>
      </v-col> -->
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="7">
        <v-card :class="$style.contentCard" variant="flat">
          <v-card-title :class="$style.sectionTitle">Produtos Mais Vendidos</v-card-title>
          <v-table :class="$style.customTable">
            <thead>
              <tr>
                <th>Produto</th>
                <th class="text-center">Vendas</th>
                <th class="text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in maisVendidos" :key="item.nome">
                <td class="font-weight-medium">{{ item.nome }}</td>
                <td class="text-center">
                  <span :class="$style.salesBadge">{{ item.vendas }}</span>
                </td>
                <td class="text-right text-grey-darken-2">
                  {{ Utils.getMoedaFormatada(item.preco) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card :class="$style.contentCard" variant="flat">
          <v-card-title :class="$style.sectionTitle">Volume de Pedidos</v-card-title>
          <v-list lines="two" bg-color="transparent">
            <v-list-item title="Últimos 7 dias">
              <template v-slot:append
                ><span class="text-h6 font-weight-bold">{{ stats.pedidos7d }}</span></template
              >
            </v-list-item>
            <v-divider inset></v-divider>
            <v-list-item title="Últimos 30 dias">
              <template v-slot:append
                ><span class="text-h6 font-weight-bold">{{ stats.pedidos30d }}</span></template
              >
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style module src="./DashboardHomeView.module.css"></style>
