<template>
  <button
    @click="handleClick"
    :class="[$style.btn, cor ? $style[cor] : null]"
    :disabled="desabilitado"
  >
    {{ texto }}
  </button>
</template>

<script setup lang="ts">
interface Props {
  texto: string
  cor?: 'primary' | 'danger' | 'success'
  desabilitado?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (props.desabilitado) return
  emit('click', event)
}
</script>

<style module>
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.primary {
  background-color: blue;
  color: white;
}
.danger {
  background-color: red;
  color: white;
}
.success {
  background-color: green;
  color: white;
}
</style>
