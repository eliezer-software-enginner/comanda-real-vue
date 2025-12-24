<template>
  <div :class="$style.headerLoja">
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
          <div
            :class="[
              $style.storeStatus,
              estaAberta ? $style.open : $style.closed
            ]"
          >
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

    <v-divider />

    <div :class="$style.deliveryHeader">
      <v-icon size="16" :class="$style.deliveryIcon">
        mdi-bike-fast
      </v-icon>

      <span :class="$style.deliveryLabel">
        Selecione um endereço para entrega
      </span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "HeaderLoja",

  props: {
    lojista: {
      type: Object,
      required: true,
    },
  },

  computed: {
    diaAtual(): string {
      const dias = [
        'domingo',
        'segunda',
        'terca',
        'quarta',
        'quinta',
        'sexta',
        'sabado',
      ]
      return dias[new Date().getDay()]!
    },

    estaAberta(): boolean {
      const hoje = this.lojista.horarioFuncionamento[this.diaAtual]

      if (!hoje) return false

      const agora = new Date()
      const minutosAgora = agora.getHours() * 60 + agora.getMinutes()

      const [hA, mA] = hoje.abertura.split(':')
      const [hF, mF] = hoje.fechamento.split(':')

      const abertura = Number(hA) * 60 + Number(mA)
      const fechamento = Number(hF) * 60 + Number(mF)

      return minutosAgora >= abertura && minutosAgora <= fechamento
    }
  }
}
</script>


<style module src='./HeaderLoja.module.css'></style>

