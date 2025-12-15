import { createRouter, createWebHistory } from 'vue-router'

import CardapioView from '@/views/CardapioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cardapio/:id', // Define o parâmetro dinâmico 'id'
      name: 'cardapio',
      component: CardapioView,
    },
  ],
})

export default router
