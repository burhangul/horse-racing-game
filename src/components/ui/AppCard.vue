<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
})
</script>

<template>
  <v-card class="app-card h-100 border-thin">
    <v-card-title class="text-subtitle-1 font-weight-bold d-flex justify-space-between">
      <span>{{ title }}</span>
      <slot name="title-extra" />
    </v-card-title>
    <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
    <v-divider />
    <v-card-text class="pa-3">
      <slot />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.app-card {
  background: linear-gradient(145deg, rgba(35, 40, 48, 0.95), rgba(27, 31, 38, 0.95));
}
</style>
