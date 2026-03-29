<script setup lang="ts">
interface Props {
  label: string
  color?: string
  disabled?: boolean
  loading?: boolean
  variant?: 'flat' | 'outlined' | 'tonal' | 'text' | 'elevated' | 'plain'
  prependIcon?: string
  testId?: string
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  disabled: false,
  loading: false,
  variant: 'flat',
  prependIcon: undefined,
  testId: undefined,
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <v-btn
    class="text-none font-weight-bold"
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :loading="loading"
    :prepend-icon="prependIcon"
    :data-testid="testId"
    @click="$emit('click')"
  >
    {{ label }}
  </v-btn>
</template>
