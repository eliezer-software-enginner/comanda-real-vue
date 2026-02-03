<script setup lang="ts">
import ButtonComponent from '@/components/ui/button/ButtonComponent.vue'
import { useLojistaStore } from '@/stores/lojista'
import { Utils } from '@/utils/Utils'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import style from './DashboardLayout.module.css'

const route = useRoute()
const router = useRouter()

const lojaId = computed(() => {
  // Pega o ID do usuário autenticado ou do store
  return lojista.lojista?.id || ''
})

// Store do lojista
const lojistaStore = useLojistaStore()
const { lojista, loading } = lojistaStore

const menuItems = [
  { name: 'Início', routeName: 'meu-painel' },
  { name: 'Produtos', routeName: 'meu-painel-produtos' },
  { name: 'Categorias', routeName: 'meu-painel-categorias' },
  { name: 'Pedidos', routeName: 'meu-painel-pedidos' },
  { name: 'Configurações', routeName: 'meu-painel-configuracoes' },
]

const isSidebarOpen = ref(true)

const pageTitle = computed(() => {
  const item = menuItems.find((i) => i.routeName === route.name)
  return item?.name ?? 'Dashboard'
})

const navigate = (routeName: string) => {
  router.push({
    name: routeName,
    //params: { id: lojaId.value },
  })
}

onMounted(async () => {
  try {
    // Usa o ID do usuário autenticado para buscar dados do lojista
    if (lojistaStore.lojista?.id) {
      await lojistaStore.fetchLojista(lojistaStore.lojista.id)
    }
  } catch (err) {
    console.error('Erro ao carregar lojista no DashboardLayout:', err)
    // Opcional: redirecionar para página de erro
  }
})
</script>

<template>
  <div :class="style.root">
    <aside :class="[style.sidebar, !isSidebarOpen && style.sidebarCollapsed]">
      <div :class="style.sidebarHeader">
        <span v-if="isSidebarOpen" :class="style.sidebarTitle"> Comanda Real </span>

        <button :class="style.toggleButton" @click="isSidebarOpen = !isSidebarOpen">
          {{ isSidebarOpen ? '❮' : '❯' }}
        </button>
      </div>

      <nav :class="style.nav">
        <ButtonComponent
          v-for="item in menuItems"
          :key="item.routeName"
          :texto="item.name"
          cor="primary"
          @click="navigate(item.routeName)"
        />
      </nav>

      <div v-if="isSidebarOpen" :class="style.sidebarFooter">
        <div :class="style.userBox">
          <div :class="style.avatar">{{ Utils.getIniciaisDoNome(lojista?.nomeLoja || null) }}</div>
          <div :class="style.userInfo">
            <span :class="style.userName">{{ lojista?.nomeLoja }}</span>
            <span :class="style.logout">Sair</span>
          </div>
        </div>
      </div>
    </aside>

    <div :class="style.content">
      <!-- <header :class="style.header">
        <h2 :class="style.headerTitle">
          {{ pageTitle }}
        </h2>
      </header> -->

      <main :class="style.main">
        <!-- AQUI entram as telas -->
        <router-view />
      </main>
    </div>
  </div>
</template>
