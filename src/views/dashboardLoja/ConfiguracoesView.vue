<script setup lang="ts">
import { useLojistaStore } from '@/stores/lojista'
import type { DiaSemana, DiaSemanaLabel, HorarioDiario } from '@/types/HorarioTypes'
import { DIAS_SEMANA } from '@/types/HorarioTypes'
import { computed, ref, useCssModule, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ProdutosService } from '../../services/produtosService/ProdutosService'

const route = useRoute()
const lojistaId = computed(() => route.params.id as string)

const styles = useCssModule()
const lojistaStore = useLojistaStore()

const diasConfigurados = ref<DiaSemanaLabel[]>([])
const service = new ProdutosService(lojistaStore.lojistaId!)

const subindoImagem = ref(false)

// Watch para quando o lojista for carregado no DashboardLayout
watch(
  () => lojistaStore.lojista,
  (novoLojista) => {
    if (novoLojista) {
      inicializarDiasConfigurados()
    }
  },
  { immediate: true }, // Executa imediatamente se já tiver dados
)

function inicializarDiasConfigurados() {
  if (!lojistaStore.lojista?.horarioFuncionamento) {
    diasConfigurados.value = DIAS_SEMANA.map((dia) => ({ ...dia }))
    return
  }

  diasConfigurados.value = DIAS_SEMANA.map((dia) => {
    const horario = lojistaStore.lojista?.horarioFuncionamento?.[dia.key]
    return {
      ...dia,
      aberto: !!horario,
      horario: horario || undefined,
    }
  })
}

async function handleSubmit(e: Event) {
  e.preventDefault()

  if (!lojistaStore.lojista) return

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

    const dadosAtualizados = {
      ...lojistaStore.lojista,
      horarioFuncionamento: novoHorarioFuncionamento,
    }

    // Remove campo deprecated se existir
    delete (dadosAtualizados as any).horariosFuncionamento

    await lojistaStore.updateLojista(dadosAtualizados)
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

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    try {
      subindoImagem.value = true
      const url = await service.uploadImagem(lojistaStore.lojistaId!, file)
      await lojistaStore.updateLojista({ fotoUrl: url })
    } catch (e) {
      alert('Erro ao subir imagem')
    } finally {
      subindoImagem.value = false
    }
  }
}
</script>

<template>
  <form v-if="lojistaStore.lojista" @submit.prevent="handleSubmit" :class="styles.form">
    <h3 :class="styles.title">Configurações do Estabelecimento</h3>

    <section :class="styles.section">
      <h4 :class="styles.sectionTitle">Informações Gerais</h4>
      <div :class="styles.grid">
        <div :class="styles.formGroup">
          <label>Nome da Loja*</label>
          <input type="text" v-model="lojistaStore.lojista.nomeLoja" required />
        </div>
        <div :class="styles.formGroup">
          <label>Categoria*</label>
          <select v-model="lojistaStore.lojista.categoria" :class="styles.formSelect" required>
            <option value="restaurant">Restaurante</option>
            <option value="lanchonete">Lanchonete</option>
            <option value="pizzaria">Pizzaria</option>
            <option value="hamburgueria">Hamburgueria</option>
          </select>
        </div>
        <div :class="styles.formGroup">
          <label>WhatsApp para Pedidos*</label>
          <input
            type="tel"
            v-model="lojistaStore.lojista.whatsapp"
            placeholder="5511..."
            required
          />
        </div>
        <div :class="styles.formGroup">
          <label>URL personalizada (Slug)</label>
          <input v-model="lojistaStore.lojista.slug" placeholder="ex: minha-loja" />
        </div>
      </div>

      <div :class="[styles.formGroup, 'mt-6']">
        <label>Foto de Perfil</label>
        <div :class="styles.photoUpload">
          <img
            v-if="lojistaStore.lojista.fotoUrl"
            :src="lojistaStore.lojista.fotoUrl"
            :class="styles.previewImg"
          />
          <div class="flex flex-col gap-2">
            <input type="file" @change="handleFileChange" :disabled="subindoImagem" />
            <p v-if="subindoImagem" class="text-sm text-blue-500">Subindo...</p>
          </div>
        </div>
      </div>
    </section>

    <section :class="styles.section">
      <h4 :class="styles.sectionTitle">Localização</h4>
      <div :class="styles.grid">
        <div :class="styles.formGroup" style="grid-column: span 2">
          <label>Rua</label>
          <input v-model="lojistaStore.lojista.endereco.rua" required />
        </div>
        <div :class="styles.formGroup">
          <label>Número</label>
          <input v-model="lojistaStore.lojista.endereco.numero" required />
        </div>
        <div :class="styles.formGroup">
          <label>Cep</label>
          <input v-model="lojistaStore.lojista.endereco.cep" required />
        </div>
        <div :class="styles.formGroup">
          <label>Bairro</label>
          <input v-model="lojistaStore.lojista.endereco.bairro" required />
        </div>
        <div :class="styles.formGroup">
          <label>Cidade</label>
          <input v-model="lojistaStore.lojista.endereco.cidade" required />
        </div>
        <div :class="styles.formGroup">
          <label>Estado (UF)</label>
          <input v-model="lojistaStore.lojista.endereco.estado" maxlength="2" required />
        </div>
      </div>
    </section>

    <section :class="styles.section">
      <h4 :class="styles.sectionTitle">Pagamento e Entrega</h4>
      <div :class="styles.formGroup">
        <label>Formas de Recebimento</label>
        <div :class="styles.paymentGrid">
          <label
            v-for="(val, key) in lojistaStore.lojista.formasPagamento"
            :key="key"
            :class="styles.paymentCheckbox"
          >
            <input type="checkbox" v-model="lojistaStore.lojista.formasPagamento[key]" />
            <span class="capitalize">{{ key.replace(/([A-Z])/g, ' $1') }}</span>
          </label>
        </div>
      </div>

      <div :class="[styles.formGroup, 'mt-6']">
        <label :class="styles.paymentCheckbox" style="width: fit-content">
          <input type="checkbox" v-model="lojistaStore.lojista.aceitaDelivery" />
          <span>Ativar Delivery</span>
        </label>
      </div>

      <div
        v-if="lojistaStore.lojista.aceitaDelivery"
        :class="[styles.grid, 'mt-4 p-4 bg-slate-50 rounded-lg']"
      >
        <div :class="styles.formGroup">
          <label>Taxa de Entrega (R$)</label>
          <input type="number" step="0.01" v-model="lojistaStore.lojista.taxaEntrega" />
        </div>
        <div :class="styles.formGroup">
          <label>Pedido Mínimo (R$)</label>
          <input type="number" step="0.01" v-model="lojistaStore.lojista.pedidoMinimo" />
        </div>
      </div>
    </section>

    <section :class="styles.section">
      <h4 :class="styles.sectionTitle">Horários de Funcionamento</h4>
      <div v-for="dia in diasConfigurados" :key="dia.key" :class="styles.diaRow">
        <div :class="styles.diaHeader">
          <span :class="styles.diaLabel">{{ dia.label }}</span>
          <div :class="styles.toggleContainer">
            <input
              type="checkbox"
              :id="dia.key"
              :checked="dia.aberto"
              @change="toggleDia(dia.key)"
              :class="styles.toggleInput"
            />
            <label :for="dia.key" :class="styles.toggleLabel"></label>
          </div>
        </div>

        <div v-if="dia.aberto" :class="styles.horarioInputs">
          <div :class="styles.formGroup">
            <span class="text-xs text-slate-500 uppercase font-bold">Abertura</span>
            <input
              type="time"
              :value="dia.horario?.abertura"
              @input="
                atualizarHorario(dia.key, 'abertura', ($event.target as HTMLInputElement).value)
              "
            />
          </div>
          <div :class="styles.formGroup">
            <span class="text-xs text-slate-500 uppercase font-bold">Fechamento</span>
            <input
              type="time"
              :value="dia.horario?.fechamento"
              @input="
                atualizarHorario(dia.key, 'fechamento', ($event.target as HTMLInputElement).value)
              "
            />
          </div>
        </div>
      </div>
    </section>

    <div :class="styles.submitSection">
      <button type="submit" :class="styles.submitButton">Salvar Alterações</button>
    </div>
  </form>
</template>
<style module src="./ConfiguracoesView.module.css" />
