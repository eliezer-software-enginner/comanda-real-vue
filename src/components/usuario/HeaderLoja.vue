<template>
    <div :class="$style.headerLoja">
        <div :class="$style.storeHeader">
            <!-- Logo -->
            <div :class="$style.storeLogo">
                <img src="../../assets/logo.png" alt="Logo da loja" />
            </div>

            <!-- Informações -->
            <div ::class="$style.storeInfo">
                <span :class="$style.storeName">Food fácil</span>

                <div :class="$style.storeMeta">
                    <div :class="$style.storeCategoria">
                        <v-icon size="16">mdi-silverware-fork-knife</v-icon>
                        <span>Salgadoria</span>
                    </div>

                    <div :class="[$style.storeStatus, $style.open]">
                        <v-icon size="16">mdi-clock-outline</v-icon>
                        <span>Aberta</span>
                    </div>
                </div>

                <div :class="$style.storeExtra">
                    <span :class="$style.storeLocation">
                        <v-icon size="16">mdi-map-marker-outline</v-icon>
                        Brás Pires, Minas Gerais
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
};
</script>

<style module src='./HeaderLoja.module.css'></style>

