<template>
  <div class="top">
    <h1>{{ nome }} {{ pedidos.length }}</h1>
    <p>Tempo médio para retirada no balcão: 30 a 40 minutos</p>
    <p>Tempo médio para entrega: 60 a 80 minutos</p>
  </div>

  <div class="bottom">
    <div class="pedido-card" v-for="pedido in pedidos">
      <div class="pedido-card-top">
        <div class="pedido-card-top-esq">
          <Receipt :size="30" color="white" />
          <p>Pedido {{ pedido.numero }}</p>
        </div>
      </div>

      <div class="pedido-card-bottom">
        <div class="pedido-card-bottom-esq">
          <p>{{ pedido.total }}</p>
          <p>{{ pedido.cliente.nome }}</p>
        </div>

        <div class="pedido-card-bottom-dir">
          <button @click="handleClickBtnPrincipal(pedido)">
            {{ textoBotao }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PedidoModel, PedidoStatus } from '@/services/pedidoService/PedidoModel'
import { computed, ref } from 'vue'

import { Receipt } from 'lucide-vue-next'

interface Props {
  status: PedidoStatus
  cor?: 'primary' | 'danger' | 'success' | 'warning'
  desabilitado?: boolean
  pedidos: PedidoModel[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'mudar-status', pedido: PedidoModel): void
}>()

function handleClickBtnPrincipal(pedido: PedidoModel) {
  emit('mudar-status', pedido)
}

const isLoading = ref(false)

const nome = computed(() => {
  if (props.status === 'pendente') return 'Pedidos em Análise'
  if (props.status === 'em-preparo') return 'Pedidos em Produção'
  return 'Pedidos aguardando entrega'
})

const textoBotao = computed(() => {
  if (props.status === 'pendente') return 'Iniciar Preparo'
  if (props.status === 'em-preparo') return 'Finalizar / Enviar'
  return 'Concluído'
})
</script>

<style>
/* ---------- CONTAINER TOPO ---------- */
.top {
  margin-bottom: 24px;
}

.top h1 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.top p {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

/* ---------- LISTA ---------- */
.bottom {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ---------- CARD ---------- */
.pedido-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.pedido-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

/* ---------- CARD TOP ---------- */
.pedido-card-top {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  padding: 14px 16px;
}

.pedido-card-top-esq {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pedido-card-top-esq p {
  color: #ffffff;
  font-weight: 500;
  margin: 0;
}

/* ---------- CARD BOTTOM ---------- */
.pedido-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
}

.pedido-card-bottom-esq p {
  margin: 0;
}

.pedido-card-bottom-esq p:first-child {
  font-weight: 600;
  font-size: 1rem;
}

.pedido-card-bottom-esq p:last-child {
  font-size: 0.85rem;
  color: #6b7280;
}

/* ---------- AÇÃO ---------- */
.pedido-card-bottom-dir button {
  background: #10b981;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.1s ease;
}

.pedido-card-bottom-dir button:hover {
  background: #059669;
  transform: scale(1.03);
}

.pedido-card-bottom-dir button:active {
  transform: scale(0.98);
}

/* ---------- BOTÕES ANTIGOS (se usar depois) ---------- */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.primary {
  background-color: #2563eb;
  color: white;
}

.danger {
  background-color: #dc2626;
  color: white;
}

.warning {
  background-color: #f59e0b;
  color: white;
}

.success {
  background-color: #16a34a;
  color: white;
}
</style>
