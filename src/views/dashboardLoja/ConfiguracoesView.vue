<script setup lang="ts">
import { useLojistaStore } from '@/stores/lojista'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import type { DiaSemana, DiaSemanaLabel, HorarioDiario } from '@/types/HorarioTypes'
import { DIAS_SEMANA } from '@/types/HorarioTypes'
import { computed, onMounted, ref, useCssModule, watch, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const styles = useCssModule()
const lojistaStore = useLojistaStore()

const inputData: Ref<LojistaModel | undefined> = ref(undefined)
const diasConfigurados = ref<DiaSemanaLabel[]>([])

// Watch para quando o lojista for carregado no DashboardLayout
watch(
  () => lojistaStore.lojista,
  (novoLojista) => {
    if (novoLojista) {
      // Clona os dados para edição local
      inputData.value = { ...novoLojista }
      inicializarDiasConfigurados()
    }
  },
  { immediate: true }, // Executa imediatamente se já tiver dados
)

function inicializarDiasConfigurados() {
  if (!inputData.value?.horarioFuncionamento) {
    diasConfigurados.value = DIAS_SEMANA.map((dia) => ({ ...dia }))
    return
  }

  diasConfigurados.value = DIAS_SEMANA.map((dia) => {
    const horario = inputData.value?.horarioFuncionamento?.[dia.key]
    return {
      ...dia,
      aberto: !!horario,
      horario: horario || undefined,
    }
  })
}

async function handleSubmit(e: Event) {
  e.preventDefault()

  if (!inputData.value) return

  try {
    // Constrói o novo objeto de horários
    const novoHorarioFuncionamento: Record<string, HorarioDiario | null> = {}

    diasConfigurados.value.forEach((dia) => {
      if (dia.aberto && dia.horario) {
        novoHorarioFuncionamento[dia.key] = dia.horario
      } else {
        novoHorarioFuncionamento[dia.key] = null
      }
    })

    inputData.value.horarioFuncionamento = novoHorarioFuncionamento
    delete inputData.value.horariosFuncionamento // Remove campo deprecated

    await lojistaStore.updateLojista(inputData.value!)
    alert('Configurações salvas com sucesso!')
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido'
    alert(errorMessage)
  }
}

function toggleDia(diaKey: DiaSemana) {
  const dia = diasConfigurados.value.find((d) => d.key === diaKey)
  if (!dia) return

  dia.aberto = !dia.aberto

  if (dia.aberto && !dia.horario) {
    dia.horario = { abertura: '08:00', fechamento: '18:00' }
  } else if (!dia.aberto) {
    dia.horario = undefined
  }
}

function atualizarHorario(diaKey: DiaSemana, campo: 'abertura' | 'fechamento', valor: string) {
  const dia = diasConfigurados.value.find((d) => d.key === diaKey)
  if (dia) {
    dia.horario = {
      ...dia.horario,
      [campo]: valor,
    } as HorarioDiario
  }
}
</script>

<template>
  <form v-if="inputData" @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">Configurações da Loja</h3>

    <div :class="styles.formGroup">
      <label>Nome da Loja</label>
      <input type="text" required v-model="inputData.nomeLoja" />
    </div>

    <div :class="styles.formGroup">
      <label>Categoria</label>
      <select v-model="inputData.categoria" :class="styles.formSelect">
        <option value="">Selecione</option>
        <option value="restaurant">Restaurante</option>
        <option value="lanchonete">Lanchonete</option>
        <option value="pizzaria">Pizzaria</option>
        <option value="hamburgueria">Hamburgueria</option>
        <option value="cafeteria">Cafeteria</option>
      </select>
    </div>

    <div :class="styles.formGroup">
      <label>Status</label>
      <select v-model="inputData.status" :class="styles.formSelect">
        <option value="ativo">Ativo</option>
        <option value="suspenso">Suspenso</option>
      </select>
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp para Pedidos</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.formGroup">
      <label>Sua URL (slug)</label>
      <input v-model="inputData.slug" placeholder="minha-lanchonete" />
    </div>

    <div :class="styles.formGroup">
      <label>URL da Logo / Foto da Loja</label>
      <input type="url" v-model="inputData.fotoUrl" placeholder="https://exemplo.com/logo.jpg" />
    </div>

    <div :class="styles.formGroup">
      <label>Endereço da Loja</label>
      <div :class="styles.enderecoGrid">
        <input v-model="inputData.endereco.rua" placeholder="Rua" />
        <div :class="styles.enderecoRow">
          <input v-model="inputData.endereco.numero" placeholder="Número" />
          <input v-model="inputData.endereco.cep" placeholder="CEP" />
        </div>
        <input v-model="inputData.endereco.bairro" placeholder="Bairro" />
        <div :class="styles.enderecoRow">
          <input v-model="inputData.endereco.cidade" placeholder="Cidade" />
          <input v-model="inputData.endereco.estado" placeholder="UF" maxlength="2" />
        </div>
        <input v-model="inputData.endereco.complemento" placeholder="Complemento (opcional)" />
      </div>
    </div>

    <div :class="styles.formGroup">
      <label>Formas de Pagamento</label>
      <label :class="styles.paymentCheckbox">
        <input type="checkbox" v-model="inputData.formasPagamento.dinheiro" />
        <span>Dinheiro</span>
      </label>
      <label :class="styles.paymentCheckbox">
        <input type="checkbox" v-model="inputData.formasPagamento.pix" />
        <span>PIX</span>
      </label>
      <label :class="styles.paymentCheckbox">
        <input type="checkbox" v-model="inputData.formasPagamento.cartaoCredito" />
        <span>Cartão de Crédito</span>
      </label>
      <label :class="styles.paymentCheckbox">
        <input type="checkbox" v-model="inputData.formasPagamento.cartaoDebito" />
        <span>Cartão Débito</span>
      </label>
      <label :class="styles.paymentCheckbox">
        <input type="checkbox" v-model="inputData.formasPagamento.valeRefeicao" />
        <span>Vale Refeição</span>
      </label>
    </div>

    <div :class="styles.formGroup">
      <label :class="styles.deliveryCheckbox">
        <input type="checkbox" v-model="inputData.aceitaDelivery" />
        <span>Aceita Delivery</span>
      </label>
    </div>

    <div v-if="inputData.aceitaDelivery" :class="styles.deliverySection">
      <div :class="styles.formGroup">
        <label>Taxa de Entrega (R$)</label>
        <input type="number" step="0.01" v-model="inputData.taxaEntrega" min="0" />
      </div>

      <div :class="styles.formGroup">
        <label>Pedido Mínimo (R$)</label>
        <input type="number" step="0.01" v-model="inputData.pedidoMinimo" min="0" />
      </div>
    </div>

    <div :class="styles.formGroup">
      <label>Instagram (opcional)</label>
      <input v-model="inputData.instagram" placeholder="@seuinstagram" />
    </div>

    <div :class="styles.formGroup">
      <label>Horários de Funcionamento</label>
      <div :class="styles.horariosSemanais">
        <div v-for="dia in diasConfigurados" :key="dia.key" :class="styles.diaRow">
          <div :class="styles.diaHeader">
            <label class="dia-label">{{ dia.label }}</label>
            <div class="toggle-container">
              <input
                type="checkbox"
                :id="dia.key"
                :checked="dia.aberto"
                @change="toggleDia(dia.key)"
                class="toggle-input"
              />
              <label :for="dia.key" class="toggle-label"></label>
            </div>
          </div>

          <div v-if="dia.aberto" :class="styles.horarioInputs">
            <div class="time-input-group">
              <span>Abertura:</span>
              <input
                type="time"
                :value="dia.horario?.abertura"
                @input="
                  atualizarHorario(dia.key, 'abertura', ($event.target as HTMLInputElement).value)
                "
                required
              />
            </div>

            <div class="time-input-group">
              <span>Fechamento:</span>
              <input
                type="time"
                :value="dia.horario?.fechamento"
                @input="
                  atualizarHorario(dia.key, 'fechamento', ($event.target as HTMLInputElement).value)
                "
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="styles.formGroup">
      <label>URL da Logo / Foto da Loja</label>
      <input type="url" v-model="inputData.fotoUrl" placeholder="https://exemplo.com/logo.jpg" />
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp para Pedidos</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.formGroup">
      <label>Sua url final (exemplo: minha-lanchonete)</label>
      <input v-model="inputData.slug" placeholder="exemplo: minha-lanchonete" />
    </div>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar Configurações</button>
    </div>
  </form>

  <div v-else class="p-8 text-center text-gray-500">Carregando configurações...</div>
</template>

<style module src="./ConfiguracoesView.module.css" />
