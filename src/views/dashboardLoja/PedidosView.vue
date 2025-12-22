<script setup lang="ts">
import PedidoComponent from '@/components/ui/PedidoComponent.vue'
import type { PedidoModel } from '@/services/pedidoService/PedidoModel'
import { PedidoService } from '@/services/pedidoService/PedidoService'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)
const todosOsPedidos = ref<PedidoModel[]>([])
const service = new PedidoService(lojistaId.value)
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
</script>

<template>
  <div class="pedidos-view">
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
</template>

<style scoped>
.pedidos-view {
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
  .pedidos-view {
    flex-direction: column;
  }

  .coluna {
    width: 100%;
  }
}
</style>
