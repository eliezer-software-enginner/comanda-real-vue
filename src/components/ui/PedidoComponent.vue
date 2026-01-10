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
            <div class="header-info">
              <Receipt :size="20" color="white" />
              <p>Pedido #{{ pedido.numero }}</p>
              <button @click="abrirDetalhes(pedido)" class="btn-detalhes">Ver itens</button>
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

    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-if="pedidoSelecionado">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Itens do Pedido #{{ pedidoSelecionado.numero }}</span>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text>
          <v-list lines="two">
            <v-list-item
              v-for="(item, index) in pedidoSelecionado.itens"
              :key="index"
              :title="item.nome"
              :subtitle="item.observacao ? `Obs: ${item.observacao}` : ''"
            >
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-3" size="small"> {{ item.quantidade }}x </v-avatar>
              </template>
              <template v-slot:append>
                <span class="font-weight-bold">
                  {{ formatarMoeda(item.precoUnitario * item.quantidade) }}
                </span>
              </template>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-space-between text-h6 px-4">
            <span>Total:</span>
            <span class="text-success font-weight-black">
              {{ formatarMoeda(pedidoSelecionado.total) }}
            </span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="outlined"
            @click="exportarPDF(pedidoSelecionado!)"
            prepend-icon="mdi-file-pdf"
          >
            PDF
          </v-btn>

          <v-btn color="primary" variant="text" @click="dialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ExportService } from '@/services/exportService/ExportService'
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

// --- SERVIÇO DE EXPORTAÇÃO ---
const exportService = new ExportService()

// --- ESTADO DO DIALOG ---
const dialog = ref(false)
const pedidoSelecionado = ref<PedidoModel | null>(null)

function abrirDetalhes(pedido: PedidoModel) {
  pedidoSelecionado.value = pedido
  dialog.value = true
}

// --- LÓGICA DO RELÓGIO ---
const agora = ref(Date.now())
let intervalId: any

onMounted(() => {
  intervalId = setInterval(() => {
    agora.value = Date.now()
  }, 1000)
})

onUnmounted(() => clearInterval(intervalId))

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

// --- FUNÇÕES DE EXPORTAÇÃO ---
async function exportarPDF(pedido: PedidoModel) {
  try {
    const blob = await exportService.gerarPDF(pedido)
    const filename = `pedido-${pedido.numero}-${new Date().toISOString().split('T')[0]}.pdf`
    exportService.downloadBlob(blob, filename)
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
  }
}
</script>

<style scoped>
.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-detalhes {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.2s;
}

.btn-detalhes:hover {
  background: rgba(255, 255, 255, 0.3);
}

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
.primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
