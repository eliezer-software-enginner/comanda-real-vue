import { createRouter, createWebHistory } from 'vue-router'

import DetalhesProduto from '@/components/usuario/DetalhesProduto.vue'
import LoginView from '@/views/LoginView.vue'
import CategoriasView from '@/views/dashboardLoja/CategoriasView.vue'
import ConfiguracoesView from '@/views/dashboardLoja/ConfiguracoesView.vue'
import DashboardHomeView from '@/views/dashboardLoja/DashboardHomeView.vue'
import DashboardLayout from '@/views/dashboardLoja/DashboardLayout.vue'
import PedidosView from '@/views/dashboardLoja/PedidosView.vue'
import ProdutosView from '@/views/dashboardLoja/ProdutosView.vue'
import CarrinhoCompras from '@/views/usuario/CarrinhoCompras.vue'
import HomeCardapio from '@/views/usuario/HomeCardapio.vue'
import SobreLoja from '@/views/usuario/SobreLoja.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/cardapio',
      name: 'cardapio',
      component: HomeCardapio,
      props: (route) => ({
        estabelecimento: route.query.estabelecimento,
        id: route.query.id,
      }),
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
      path: '/meu-painel',
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

// Guard de rota para proteger rotas que exigem autenticação
router.beforeEach((to, from, next) => {
  // Importar dinamicamente o store dentro do guard para evitar circular dependency
  import('@/stores/auth').then(({ useAuthStore }) => {
    const authStore = useAuthStore()

    // Se está indo para uma rota protegida (meu-painel)
    if (to.path.startsWith('/meu-painel') && to.path !== '/meu-painel/TESTE_DEV_LOJA') {
      if (!authStore.isAuthenticated) {
        // Se não está autenticado, redirecionar para login
        next({ name: 'login' })
      } else {
        // Se está autenticado, permitir acesso
        next()
      }
    } else if (to.name === 'login') {
      // Se já está autenticado e tenta acessar login, redirecionar para painel
      if (authStore.isAuthenticated && authStore.user) {
        next({ path: '/meu-painel' })
      } else {
        next()
      }
    } else {
      // Para outras rotas, permitir acesso
      next()
    }
  })
})

export default router
