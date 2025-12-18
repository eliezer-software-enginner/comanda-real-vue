<template>
  <div class="coluna-container">
    <div class="top">
      <h1>{{ nomeExibicao }} ({{ pedidos.length }})</h1>
      <p>Tempo médio: {{ tempoMedio }}</p>
    </div>

    <div class="bottom">
      <div class="pedido-card" v-for="pedido in pedidos" :key="pedido.id">
        <div :class="['pedido-card-top', cor]">
          <div class="pedido-card-top-esq">
            <div>
              <Receipt :size="20" color="white" />
              <p>Pedido #{{ pedido.numero }}</p>
            </div>

            <p>{{ formatarMoeda(pedido.total) }}</p>
            <p>{{ pedido.cliente.nome }}</p>

            <p v-if="status === 'enviado' && pedido.tempoPreparoSegundos" class="tempo-estatico">
              Preparo: {{ formatarSegundos(pedido.tempoPreparoSegundos) }}
            </p>
          </div>

          <div v-if="obterDataReferencia(pedido)" class="timer-badge">
            <Clock :size="14" />
            <span>{{ formatarTimer(obterDataReferencia(pedido)!) }}</span>
          </div>
        </div>

        <div class="pedido-card-bottom">
          <div class="pedido-card-bottom-esq">
            <p>{{ formatarMoeda(pedido.total) }}</p>
            <p>{{ pedido.cliente.nome }}</p>
          </div>

          <div class="pedido-card-bottom-dir">
            <button @click="$emit('mudar-status', pedido)" :class="cor">
              {{ textoBotao }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PedidoModel, PedidoStatus } from '@/services/pedidoService/PedidoModel'
import { Clock, Receipt } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Props {
  status: PedidoStatus
  cor: 'primary' | 'danger' | 'success' | 'warning'
  pedidos: PedidoModel[]
}

const props = defineProps<Props>()
defineEmits(['mudar-status'])

// --- LÓGICA DO RELÓGIO ---
const agora = ref(Date.now())
let intervalId: any

onMounted(() => {
  intervalId = setInterval(() => {
    agora.value = Date.now()
  }, 1000)
})

onUnmounted(() => clearInterval(intervalId))

/**
 * Retorna a data de início correta baseada no status atual
 */
function obterDataReferencia(pedido: PedidoModel) {
  if (pedido.status === 'em-preparo') return pedido.dataInicioPreparo
  if (pedido.status === 'enviado') return pedido.dataInicioEnvio
  return null
}

function formatarSegundos(segundos: number) {
  const minutos = Math.floor(segundos / 60)
  if (minutos < 1) return 'Menos de 1 min'
  return `${minutos} min`
}

function formatarTimer(dataInicioISO: string) {
  const inicio = new Date(dataInicioISO).getTime()
  const diff = agora.value - inicio

  if (diff < 0) return '00:00'

  const minutos = Math.floor(diff / 60000)
  const segundos = Math.floor((diff % 60000) / 1000)

  return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
}

const nomeExibicao = computed(() => {
  if (props.status === 'pendente') return 'Pedidos em Análise'
  if (props.status === 'em-preparo') return 'Pedidos em Produção'
  return 'Pedidos aguardando entrega'
})

const textoBotao = computed(() => {
  if (props.status === 'pendente') return 'Iniciar Preparo'
  if (props.status === 'em-preparo') return 'Finalizar / Enviar'
  return 'Concluído'
})

const tempoMedio = computed(() => {
  return props.status === 'enviado' ? '60-80 min' : '30-40 min'
})

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}
</script>

<style scoped>
/* Estilos das Cores Dinâmicas */
.danger {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
}
.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.pedido-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  color: white;
}

.timer-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 20px;
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Reaproveitando seu CSS com pequenos ajustes */
.top h1 {
  font-size: 1.2rem;
  margin-bottom: 4px;
}
.top p {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 15px;
}

.pedido-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  margin-bottom: 16px;
  overflow: hidden;
}

.pedido-card-bottom {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pedido-card-bottom-dir button {
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
