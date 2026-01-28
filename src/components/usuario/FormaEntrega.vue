<template>
  <div class="formaEntregaContainer">
    <h4>Como deseja receber seu pedido?</h4>

    <div class="tipoEntrega">
      <v-btn-toggle
        :model-value="tipoEntrega"
        mandatory
        color="secondary"
        @update:model-value="$emit('update:tipoEntrega', $event)"
      >
        <v-btn
          value="entrega"
          class="flex-1"
          :variant="tipoEntrega === 'entrega' ? 'flat' : 'outlined'"
        >
          <div class="d-flex flex-column align-center">
            <v-icon size="24" class="mb-1">mdi-moped</v-icon>
            <span>Entrega</span>
          </div>
        </v-btn>

        <v-btn
          value="retirada"
          class="flex-1"
          :variant="tipoEntrega === 'retirada' ? 'flat' : 'outlined'"
        >
          <div class="d-flex flex-column align-center">
            <v-icon size="24" class="mb-1">mdi-store-outline</v-icon>
            <span>Retirada</span>
          </div>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>

    <div
      v-if="tipoEntrega === 'entrega'"
      class="mt-4"
      style="margin-left: 5%; margin-right: 5%;"
    >
    <br />

    <div class="headerInline">
      <h4 class="text-subtitle-1 font-weight-medium mb-0">
        Qual o seu endereço?
      </h4>

      <span
        class="text-error"
        style="letter-spacing: 1px; opacity: 0.8; font-size: 11px; font-weight:bold"
      >
        * Obrigatório
      </span>
    </div>

    <div
      class="cursor-pointer text-secondary item-card linkEndereco"
      style="gap: 4px;"
      @click="$emit('abrir-endereco')"
    >
      <v-icon size="small">mdi-map-marker-outline</v-icon>
      <span
        style="text-decoration: underline; font-size: 0.9rem; font-weight: 500;"
        v-if="!enderecoSelecionado"
      >
        Selecionar o endereço de entrega
      </span>
      <div v-else class="endereco-selecionado">
        <div class="endereco-texto">
          <strong>{{ enderecoSelecionado.nome || 'Endereço' }}</strong>
          <div class="endereco-rua">
            {{ enderecoSelecionado.rua }}, {{ enderecoSelecionado.numero }}
            <span v-if="enderecoSelecionado.complemento"> - {{ enderecoSelecionado.complemento }}</span>
          </div>
          <div class="endereco-detalhes">
            {{ enderecoSelecionado.bairro }} - {{ enderecoSelecionado.cidade }}/{{ enderecoSelecionado.estado }}
          </div>
          <div class="endereco-cep">CEP: {{ enderecoSelecionado.cep }}</div>
        </div>
        <div class="endereco-actions">
          <v-btn 
            icon="mdi-pencil" 
            size="x-small" 
            variant="text" 
            color="primary"
            @click.stop="$emit('editar-endereco')"
          >
          </v-btn>
          <v-icon size="small" color="success">mdi-check-circle</v-icon>
        </div>
      </div>
    </div>

    
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'FormaEntrega',

  props: {
    tipoEntrega: {
      type: String as PropType<'entrega' | 'retirada' | null>,
      required: true,
    },
    enderecoSelecionado: {
      type: Object as PropType<any>,
      default: null
    },
  },

  emits: ['update:tipoEntrega', 'abrir-endereco', 'editar-endereco'],
})
</script>
<style scoped>

.formaEntregaContainer {
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-left: 5%;
  align-items: center;
  background-color: #fbfbfb;
  padding-bottom: 15px;
  border-radius: 5px;
  border: 1px solid rgb(223, 223, 223)
}

.cursor-pointer {
  cursor: pointer;
  transition: opacity 0.2s;
}

.cursor-pointer:hover {
  opacity: 0.7;
}

.headerInline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.linkEndereco {
  padding: 10px;
}
.item-card {
  border: 1px solid #e0e0e0 !important;
  border-radius: 12px !important;
  max-width: 100% !important;
  overflow: hidden !important;
  margin-bottom: 16px !important;
  /* Aumenta espaçamento entre cards */
}

.endereco-selecionado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.endereco-texto {
  flex: 1;
}

.endereco-detalhes {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-top: 2px;
}

.endereco-cep {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 2px;
}

.endereco-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.endereco-rua {
  font-size: 0.9rem;
  margin-bottom: 2px;
}
</style>