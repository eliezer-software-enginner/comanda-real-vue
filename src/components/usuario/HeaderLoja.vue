<template>
  <div :class="$style.headerLoja" @click="onHeaderClick">
    <div :class="$style.storeHeader">
      <!-- Logo -->
      <div :class="$style.storeLogo">
        <img :src="lojista.fotoUrl" alt="Logo da loja" />
      </div>

      <!-- Informações -->
      <div :class="$style.storeInfo">
        <span :class="$style.storeName">
          {{ lojista.nomeLoja }}
        </span>

        <div :class="$style.storeMeta">
          <!-- Categoria -->
          <div :class="$style.storeCategoria">
            <v-icon size="16">mdi-silverware-fork-knife</v-icon>
            <span>{{ lojista.categoria }}</span>
          </div>

          <!-- Status -->
          <div :class="[$style.storeStatus, estaAberta ? $style.open : $style.closed]">
            <v-icon size="16">mdi-clock-outline</v-icon>
            <span>{{ estaAberta ? 'Aberta' : 'Fechada' }}</span>
          </div>
        </div>

        <!-- Endereço -->
        <div :class="$style.storeExtra">
          <span :class="$style.storeLocation">
            <v-icon size="16">mdi-map-marker-outline</v-icon>
            {{ lojista.endereco.cidade }}, {{ lojista.endereco.estado }}
          </span>
        </div>
      </div>

      <!-- Seta -->
      <v-icon :class="$style.arrowIcon">mdi-chevron-right</v-icon>
    </div>
  </div>
  <div :class="$style.deliveryHeader">
    <v-icon size="16" :class="$style.deliveryIcon"> mdi-bike-fast </v-icon>

    <span :class="$style.deliveryLabel"> Selecione um endereço para entrega </span>
  </div>
  <div :class="$style.categoriesWrapper">
    <div
      v-for="(categoria, index) in categorias"
      :key="index"
      :id="categoria.id"
      :class="[$style.categoriaItem, selectedcategoria === categoria.id ? $style.active : '']"
      @click="selecionarCategoria(categoria.id)"
    >
      {{ categoria.nome }}
    </div>
  </div>
</template>

<script lang="ts">
import type { CategoriaModel } from '@/services/categoriasService/CategoriaModel'
import type { LojistaModel } from '@/services/lojistaService/LojistaModel'
import type { PropType } from 'vue'
export default {
  name: 'HeaderLoja',

  props: {
    lojista: {
      type: Object as PropType<LojistaModel>,
      required: true,
    },
    categorias: {
      type: Array as PropType<CategoriaModel[]>,
      required: true,
    },
    selectedcategoria: {
      type: String,
      required: true,
    },
    onHeaderClick: {
      type: Function as PropType<(payload: PointerEvent) => void>,
      default: () => {},
    },
    onCategoriaSelecionada: {
      type: Function as PropType<(categoriaId: string) => void>,
      default: undefined,
    },
    estaAberta: {
      type: Boolean,
      required: true,
    },
  },

  methods: {
    selecionarCategoria(categoriaId: string) {
      if (this.onCategoriaSelecionada) {
        this.onCategoriaSelecionada(categoriaId)
      }
    },
  },
}
</script>

<style module src="./HeaderLoja.module.css"></style>
