<script setup lang="ts">
import { ref } from 'vue'
// O useCssModule() permite acessar as classes no <script> se necessário
import { useCssModule } from 'vue'

const $style = useCssModule()

const stats = ref({
  vendasTotal: 'R$ 12.450,00',
  pedidos24h: 15,
  pedidos7d: 84,
  produtosBaixoEstoque: 3,
  pedidosPendentes: 5,
})

const maisVendidos = ref([
  { nome: 'X-Burger Especial', vendas: 120, preco: 'R$ 25,00' },
  { nome: 'Batata Frita G', vendas: 95, preco: 'R$ 15,00' },
  { nome: 'Coca-Cola Lata', vendas: 80, preco: 'R$ 6,00' },
])
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
          <v-card-item title="Pendentes">
            <template v-slot:append><v-icon icon="mdi-alert-circle"></v-icon></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.pedidosPendentes }}</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card :class="[$style.statCard, $style.kpiRed]" variant="flat">
          <v-card-item title="Estoque Crítico">
            <template v-slot:append
              ><v-icon icon="mdi-package-variant-closed-remove"></v-icon
            ></template>
          </v-card-item>
          <v-card-text :class="$style.statValue">{{ stats.produtosBaixoEstoque }}</v-card-text>
        </v-card>
      </v-col>
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
                <td class="text-right text-grey-darken-2">{{ item.preco }}</td>
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
              <template v-slot:append><span class="text-h6 font-weight-bold">342</span></template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style module src="./DashboardHomeView.module.css"></style>
