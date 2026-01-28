<script setup lang="ts">
import { useRouter } from 'vue-router'
import ButtonComponent from '@/components/ui/button/ButtonComponent.vue'
import style from './LoginView.module.css'

const router = useRouter()

const entrarComoTestador = () => {
  router.push('/meu-painel/TESTE_DEV_LOJA')
}

// Placeholder para função de login (não implementado ainda)
const fazerLogin = () => {
  // TODO: Implementar lógica de login
  console.log('Função de login ainda não implementada')
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
        <h2 :class="style.sectionTitle">Login</h2>
        <ButtonComponent
          texto="Fazer Login"
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
