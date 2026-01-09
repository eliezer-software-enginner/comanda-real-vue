<script setup lang="ts">
import PedidoComponent from '@/components/ui/PedidoComponent.vue'
import type { PedidoModel } from '@/services/pedidoService/PedidoModel'
import { PedidoService } from '@/services/pedidoService/PedidoService'
import { ExportService } from '@/services/exportService/ExportService'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)
const todosOsPedidos = ref<PedidoModel[]>([])
const service = new PedidoService(lojistaId.value)
const exportService = new ExportService()
let unsubscribe: (() => void) | null = null

const pedidosPendentes = computed(() => todosOsPedidos.value.filter((p) => p.status === 'pendente'))
const pedidosEmPreparo = computed(() =>
  todosOsPedidos.value.filter((p) => p.status === 'em-preparo'),
)
const pedidosEnviados = computed(() => todosOsPedidos.value.filter((p) => p.status === 'enviado'))

onMounted(() => {
  unsubscribe = service.listenPedidos(lojistaId.value, (novosPedidos) => {
    todosOsPedidos.value = novosPedidos
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe() // Importante para não gastar memória/leitura
})

async function handleMudarStatus(pedido: PedidoModel) {
  const proximoStatus: Record<string, any> = {
    pendente: 'em-preparo',
    'em-preparo': 'enviado',
    enviado: 'concluido',
  }

  const destino = proximoStatus[pedido.status]
  if (!destino) return

  try {
    await service.mudarStatus(pedido, destino)
  } catch (e: any) {
    alert('Erro ao atualizar: ' + e.message)
  }
}

// --- FUNÇÕES DE EXPORTAÇÃO EM LOTE ---
async function exportarTodosPDF() {
  try {
    const blob = await exportService.gerarPDFLista(todosOsPedidos.value)
    const filename = `todos-pedidos-${new Date().toISOString().split('T')[0]}.pdf`
    exportService.downloadBlob(blob, filename)
  } catch (error) {
    console.error('Erro ao exportar todos os pedidos em PDF:', error)
  }
}

async function exportarPorStatusPDF(status: string) {
  try {
    let pedidosFiltrados: PedidoModel[]
    switch (status) {
      case 'pendente':
        pedidosFiltrados = pedidosPendentes.value
        break
      case 'em-preparo':
        pedidosFiltrados = pedidosEmPreparo.value
        break
      case 'enviado':
        pedidosFiltrados = pedidosEnviados.value
        break
      default:
        pedidosFiltrados = todosOsPedidos.value
    }

    const blob = await exportService.gerarPDFLista(pedidosFiltrados)
    const filename = `pedidos-${status}-${new Date().toISOString().split('T')[0]}.pdf`
    exportService.downloadBlob(blob, filename)
  } catch (error) {
    console.error('Erro ao exportar pedidos por status em PDF:', error)
  }
}
</script>

<template>
  <div class="pedidos-view">
    <!-- Botões de exportação globais -->
    <div class="export-buttons">
      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-file-pdf"
        @click="exportarTodosPDF"
        :disabled="todosOsPedidos.length === 0"
      >
        Exportar Todos (PDF)
      </v-btn>

      <v-btn
        color="secondary"
        variant="outlined"
        prepend-icon="mdi-file-pdf"
        @click="exportarPorStatusPDF('pendente')"
        :disabled="pedidosPendentes.length === 0"
      >
        Pendentes ({{ pedidosPendentes.length }})
      </v-btn>

      <v-btn
        color="warning"
        variant="outlined"
        prepend-icon="mdi-file-pdf"
        @click="exportarPorStatusPDF('em-preparo')"
        :disabled="pedidosEmPreparo.length === 0"
      >
        Em Preparo ({{ pedidosEmPreparo.length }})
      </v-btn>

      <v-btn
        color="success"
        variant="outlined"
        prepend-icon="mdi-file-pdf"
        @click="exportarPorStatusPDF('enviado')"
        :disabled="pedidosEnviados.length === 0"
      >
        Enviados ({{ pedidosEnviados.length }})
      </v-btn>
    </div>

    <div class="pedidos-container">
      <div class="coluna">
        <PedidoComponent
          status="pendente"
          :pedidos="pedidosPendentes"
          @mudar-status="handleMudarStatus"
          cor="danger"
        />
      </div>
      <div class="coluna">
        <PedidoComponent
          status="em-preparo"
          :pedidos="pedidosEmPreparo"
          @mudar-status="handleMudarStatus"
          cor="warning"
        />
      </div>
      <div class="coluna">
        <PedidoComponent
          status="enviado"
          :pedidos="pedidosEnviados"
          @mudar-status="handleMudarStatus"
          cor="success"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pedidos-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.pedidos-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
}

/* Cada coluna de pedidos */
.coluna {
  flex: 1;
  min-width: 280px;
}

/* Responsividade */
@media (max-width: 900px) {
  .pedidos-container {
    flex-direction: column;
  }

  .coluna {
    width: 100%;
  }

  .export-buttons {
    justify-content: center;
  }
}
</style>
