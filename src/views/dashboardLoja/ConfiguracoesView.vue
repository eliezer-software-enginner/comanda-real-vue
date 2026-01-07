<script setup lang="ts">
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import { LojistaService } from '@/services/lojistaService/LojistaService'
import type { DiaSemana, DiaSemanaLabel, HorarioDiario } from '@/types/HorarioTypes'
import { DIAS_SEMANA } from '@/types/HorarioTypes'
import { computed, onMounted, ref, useCssModule, type Ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const styles = useCssModule()
const service = new LojistaService()

const inputData: Ref<LojistaModel | undefined> = ref(undefined)
const diasConfigurados = ref<DiaSemanaLabel[]>([])

onMounted(async () => {
  try {
    const data = await service.getData(lojistaId.value)

    if (data) {
      inputData.value = data
      inicializarDiasConfigurados()
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})

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

    await service.atualizar(inputData.value!)
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
        <option value="sorveteria">Sorveteria</option>
      </select>
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.formGroup">
      <label>URL (slug)</label>
      <input v-model="inputData.slug" placeholder="minha-lanchonete" />
    </div>

    <div :class="styles.formGroup">
      <label>Foto URL</label>
      <input type="url" v-model="inputData.fotoUrl" placeholder="https://..." />
    </div>

    <div :class="styles.formGroup">
      <label>Status</label>
      <select v-model="inputData.status" :class="styles.formSelect">
        <option value="ativo">Ativo</option>
        <option value="suspenso">Suspenso</option>
      </select>
    </div>

    <div :class="styles.formGroup">
      <label>Endereço</label>
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

    <div :class="styles.formGroup">
      <label>Formas de Pagamento</label>
      <div :class="styles.pagamentoGrid">
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
          <span>Cartão Crédito</span>
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
    </div>

    <div :class="styles.formGroup">
      <label :class="styles.checkboxLabel">
        <input type="checkbox" v-model="inputData.aceitaDelivery" />
        <span>Aceita Delivery</span>
      </label>
    </div>

    <div v-if="inputData.aceitaDelivery" :class="styles.deliverySection">
      <div :class="styles.formGroup">
        <label>Taxa de Entrega (R$)</label>
        <input type="number" step="0.01" v-model="inputData.taxaEntrega" />
      </div>

      <div :class="styles.formGroup">
        <label>Pedido Mínimo (R$)</label>
        <input type="number" step="0.01" v-model="inputData.pedidoMinimo" />
      </div>
    </div>

    <div :class="styles.formGroup">
      <label>Instagram</label>
      <input v-model="inputData.instagram" placeholder="@seuinstagram" />
    </div>

    <div :class="styles.formGroup">
      <label>WhatsApp</label>
      <input type="tel" v-model="inputData.whatsapp" placeholder="5511999999999" />
    </div>

    <div :class="styles.formGroup">
      <label>URL (slug)</label>
      <input v-model="inputData.slug" placeholder="minha-lanchonete" />
    </div>

    <div :class="styles.formGroup">
      <label>Foto URL</label>
      <input type="url" v-model="inputData.fotoUrl" placeholder="https://..." />
    </div>

    <div :class="styles.formGroup">
      <label>Status</label>
      <select v-model="inputData.status" class="form-select">
        <option value="ativo">Ativo</option>
        <option value="suspenso">Suspenso</option>
      </select>
    </div>

    <div :class="styles.formGroup">
      <label>Endereço</label>
      <input v-model="inputData.endereco.rua" placeholder="Rua" />
      <input v-model="inputData.endereco.numero" placeholder="Número" />
      <input v-model="inputData.endereco.bairro" placeholder="Bairro" />
      <input v-model="inputData.endereco.cidade" placeholder="Cidade" />
      <input v-model="inputData.endereco.estado" placeholder="UF" />
      <input v-model="inputData.endereco.cep" placeholder="CEP" />
    </div>

    <div :class="styles.formGroup">
      <label>Formas de Pagamento</label>
      <label><input type="checkbox" v-model="inputData.formasPagamento.dinheiro" /> Dinheiro</label>
      <label><input type="checkbox" v-model="inputData.formasPagamento.pix" /> PIX</label>
      <label
        ><input type="checkbox" v-model="inputData.formasPagamento.cartaoCredito" /> Cartão
        Crédito</label
      >
      <label
        ><input type="checkbox" v-model="inputData.formasPagamento.cartaoDebito" /> Cartão
        Débito</label
      >
    </div>

    <div :class="styles.formGroup">
      <label><input type="checkbox" v-model="inputData.aceitaDelivery" /> Aceita Delivery</label>
    </div>

    <div v-if="inputData.aceitaDelivery" :class="styles.formGroup">
      <label>Taxa de Entrega (R$)</label>
      <input type="number" step="0.01" v-model="inputData.taxaEntrega" />
    </div>

    <div v-if="inputData.aceitaDelivery" :class="styles.formGroup">
      <label>Pedido Mínimo (R$)</label>
      <input type="number" step="0.01" v-model="inputData.pedidoMinimo" />
    </div>

    <div :class="styles.formGroup">
      <label>Instagram</label>
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

<style module>
.form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.formGroup {
  margin-bottom: 1.5rem;
}

.formGroup label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.formGroup input[type='text'],
.formGroup input[type='url'],
.formGroup input[type='tel'] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.formGroup input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.horariosSemanais {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.diaRow {
  padding: 1rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.diaRow:last-child {
  border-bottom: none;
}

.diaHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.dia-label {
  font-weight: 500;
  color: #333;
  margin: 0;
}

.toggle-container {
  position: relative;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-label {
  background: #007bff;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
}

.horarioInputs {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.time-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-input-group span {
  font-size: 0.875rem;
  color: #666;
}

.time-input-group input[type='time'] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.875rem;
}

.submitSection {
  margin-top: 2rem;
  text-align: center;
}

.submitButton {
  background: #007bff;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submitButton:hover {
  background: #0056b3;
}

/* Estilos para campos adicionais */
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  margin-bottom: 0.5rem;
}

.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input[type='checkbox'] {
  margin-right: 0.5rem;
}

