import { createRouter, createWebHistory } from 'vue-router'

import CategoriasView from '@/views/dashboardLoja/CategoriasView.vue'
import ConfiguracoesView from '@/views/dashboardLoja/ConfiguracoesView.vue'
import DashboardHomeView from '@/views/dashboardLoja/DashboardHomeView.vue'
import DashboardLayout from '@/views/dashboardLoja/DashboardLayout.vue'
import PedidosView from '@/views/dashboardLoja/PedidosView.vue'
import ProdutosView from '@/views/dashboardLoja/ProdutosView.vue'
import HomeCardapio from '@/views/usuario/HomeCardapio.vue'
import SobreLoja from '@/views/usuario/SobreLoja.vue'
import DetalhesProduto from '@/components/usuario/DetalhesProduto.vue'
import CarrinhoCompras from '@/views/usuario/CarrinhoCompras.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // path: '/cardapio/:id',
      path: '/cardapio',
      name: 'cardapio',
      component: HomeCardapio,
    },
    {
      path: '/sobre',
      name: 'sobre',
      component: SobreLoja,
    },
    {
      path: '/detalhes/:id',
      name: 'detalhes',
      component: DetalhesProduto,
    },
    {
      path: '/carrinho',
      name: 'carrinho',
      component: CarrinhoCompras,
    },
    {
      path: '/meu-painel/:id',
      component: DashboardLayout,
      children: [
        {
          path: '',
          name: 'meu-painel',
          component: DashboardHomeView,
        },
        {
          path: 'pedidos',
          name: 'meu-painel-pedidos',
          component: PedidosView,
        },
        {
          path: 'produtos',
          name: 'meu-painel-produtos',
          component: ProdutosView,
        },
        {
          path: 'categorias',
          name: 'meu-painel-categorias',
          component: CategoriasView,
        },
        {
          path: 'configuracoes',
          name: 'meu-painel-configuracoes',
          component: ConfiguracoesView,
        },
      ],
    },
  ],
})

export default router
