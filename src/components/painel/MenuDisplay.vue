<script setup lang="ts">
import { useCssModule } from 'vue'

import type { ProdutoModel } from '@/services/produtosService/ProdutosModel'

const styles = useCssModule()

interface MenuDisplayProps {
  cardapio: ProdutoModel[]
  isPreview?: boolean
}
const props = withDefaults(defineProps<MenuDisplayProps>(), {
  isPreview: false,
})
</script>

<template>
  <div :class="styles.container"></div>
</template>

<style module src="./MenuDisplay.module.css"></style>
