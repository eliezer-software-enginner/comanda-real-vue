<script setup lang="ts">
import ButtonComponent from '@/components/ui/button/ButtonComponent.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import style from './DashboardView.module.css'

const route = useRoute()
const router = useRouter()

const lojaId = computed(() => route.params.id as string)

const menuItems = [
  { name: 'Início', routeName: 'meu-painel' },
  { name: 'Produtos', routeName: 'meu-painel-produtos' },
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
    params: { id: lojaId.value },
  })
}
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
          <div :class="style.avatar">LD</div>
          <div :class="style.userInfo">
            <span :class="style.userName">Lojista Demo</span>
            <span :class="style.logout">Sair</span>
          </div>
        </div>
      </div>
    </aside>

    <div :class="style.content">
      <header :class="style.header">
        <h2 :class="style.headerTitle">
          {{ pageTitle }}
        </h2>
      </header>

      <main :class="style.main">
        <!-- AQUI entram as telas -->
        <router-view />
      </main>
    </div>
  </div>
</template>
