import { createRouter, createWebHistory } from 'vue-router'

import CardapioView from '@/views/usuario/CardapioView.vue'
import DashboardLayout from '@/views/dashboardLoja/DashboardLayout.vue'
import HomeCardapio from '@/views/usuario/HomeCardapio.vue'
import PedidosView from '@/views/dashboardLoja/PedidosView.vue'
import ProdutosView from '@/views/dashboardLoja/ProdutosView.vue'
import ConfiguracoesView from '@/views/dashboardLoja/ConfiguracoesView.vue'
import DashboardHomeView from '@/views/dashboardLoja/DashboardHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cardapio/:id',
      name: 'cardapio',
      component: HomeCardapio,
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
          path: 'configuracoes',
          name: 'meu-painel-configuracoes',
          component: ConfiguracoesView,
        },
      ],
    },
  ],
})

export default router
