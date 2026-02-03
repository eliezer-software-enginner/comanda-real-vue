<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ButtonComponent from '@/components/ui/button/ButtonComponent.vue'
import style from './LoginView.module.css'

const router = useRouter()
const authStore = useAuthStore()

const entrarComoTestador = async () => {
  try {
    await authStore.loginAsTestador()
    router.push('/meu-painel')
  } catch (error) {
    console.error('Erro ao entrar como testador:', error)
  }
}

const fazerLogin = async () => {
  try {
    await authStore.loginWithGoogle()

    // Se o login foi bem sucedido e o usuário tem um lojista associado,
    // redirecionar para o painel dele
    if (authStore.isAuthenticated && authStore.user) {
      router.push('/meu-painel')
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    // Aqui poderíamos mostrar uma mensagem de erro para o usuário
  }
}
</script>

<template>
  <div :class="style.container">
    <div :class="style.loginCard">
      <div :class="style.header">
        <h1 :class="style.title">Comanda Real</h1>
        <p :class="style.subtitle">Faça login para acessar seu painel</p>
      </div>

      <div :class="style.formSection">
        <h2 :class="style.sectionTitle">Acesso Principal</h2>
        <p :class="style.loginDescription">Faça login com sua conta Google ou crie uma nova loja</p>
        <ButtonComponent
          texto="Fazer Login/Cadastro"
          cor="primary"
          @click="fazerLogin"
          :class="style.loginButton"
        />
      </div>

      <div :class="style.divider">ou</div>

      <div :class="style.testSection">
        <h2 :class="style.sectionTitle">Acesso de Teste</h2>
        <p :class="style.testDescription">
          Entre como testador para explorar o painel com dados de demonstração
        </p>
        <ButtonComponent
          texto="Entrar como Testador"
          cor="success"
          @click="entrarComoTestador"
          :class="style.testButton"
        />
      </div>
    </div>
  </div>
</template>
