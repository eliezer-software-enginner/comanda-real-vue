<template>
  <div class="home-page">
    <div class="header-loja">
      <div class="store-header">
        <!-- Logo -->
        <div class="store-logo">
          <img src="../../assets/logo.png" alt="Logo da loja" />
        </div>

        <!-- Informações -->
        <div class="store-info">
          <span class="store-name">Food fácil</span>

          <div class="store-meta">
            <div class="store-categoria">
              <v-icon size="16">mdi-silverware-fork-knife</v-icon>
              <span>Salgadoria</span>
            </div>

            <div class="store-status open">
              <v-icon size="16">mdi-clock-outline</v-icon>
              <span>Aberta</span>
            </div>
          </div>

          <div class="store-extra">
            <span class="store-location">
              <v-icon size="16">mdi-map-marker-outline</v-icon>
              Brás Pires, Minas Gerais
            </span>
          </div>
        </div>

        <!-- Seta -->
        <v-icon class="arrow-icon">mdi-chevron-right</v-icon>
      </div>
      <v-divider />
      <div class=" delivery-header">

        <v-icon size="16" class="delivery-icon">
          mdi-bike-fast
        </v-icon>

        <span class="delivery-label">
          Selecione um endereço para entrega
        </span>
      </div>
    </div>
    <div class="categories-wrapper">
      <div v-for="(categoria, index) in categories" :key="index" class="categoria-item"
        :class="{ active: selectedcategoria === categoria.id }" @click="selectedcategoria = categoria.id">
        <span>{{ categoria.label }}</span>
      </div>
    </div>
    <Cardapio />
  </div>

  <v-footer app class="white--text" style="background-color: #fff;">
    <v-container class="pa-0">
      <v-row no-gutters justify="space-around" align="center">
        <!-- Ícone Início -->
        <v-col class="text-center">
          <v-icon color="black">mdi-home</v-icon>
          <div class="text-caption" style="color: black;">Início</div>
        </v-col>

        <!-- Ícone Pedidos -->
        <v-col class="text-center">
          <v-icon color="black">mdi-receipt-text</v-icon>
          <div class="text-caption" style="color: black;">Pedidos</div>
        </v-col>

        <!-- Ícone Perfil -->
        <v-col class="text-center">
          <v-icon color="black">mdi-account</v-icon>
          <div class="text-caption" style="color: black;">Perfil</div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>

</template>

<script lang="ts">
import Cardapio from '@/components/usuario/Cardapio.vue'

export default {
  name: "HomeCardapio",
  data() {
    return {
      loading: true,
      categories: [
        { id: 'popular', label: 'Mais pedidos' },
        { id: 'snacks', label: 'Lanches' },
        { id: 'drinks', label: 'Bebidas' },
        { id: 'desserts', label: 'Sobremesas' }
      ],
      selectedcategoria: 'popular'
    }
  },
  components: {
    Cardapio
  },
};
</script>

<style scoped>
.home-page {
  margin-top: 15px;
  background-color: rgb(235, 235, 235);
  ;
}

.text-right {
  text-align: right;
}

.store-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;

}

.header-loja {
  background-color: #ffffff;
}

.delivery-header {

  padding: 10px 12px;
  margin-top: 15px;
}

/* Logo */
.store-logo {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.store-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Conteúdo */
.store-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.store-name {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
}

/* Categoria + status */
.store-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.store-categoria {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #f3f4f6;
  border-radius: 20px;
  font-size: 12px;
  color: #6b7280;
}

.store-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.store-status.open {
  border: 1px solid #2bb673;
  color: #2bb673;
  background-color: #f1fcf7;
}

/* Info extra */
.store-extra {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.store-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}



/* Seta */
.arrow-icon {
  color: #111827;
}

/* Linha entrega */
.delivery-header {
  border-bottom: 1px solid #f0f0f0;
}

.delivery-icon {
  color: #6b7280;
}

.delivery-label {
  color: #6b7280;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.categories-wrapper {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: #ffffff;
  overflow-x: auto;
}

/* Item */
.categoria-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  background-color: #f3f4f6;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Hover */
.categoria-item:hover {
  background-color: #e5e7eb;
}

/* Ativo */
.categoria-item.active {
  background-color: #2bb673;
  color: #ffffff;
}

.categoria-item.active v-icon {
  color: #ffffff;
}

/* Remove scrollbar visual (opcional) */
.categories-wrapper::-webkit-scrollbar {
  display: none;
}
</style>
