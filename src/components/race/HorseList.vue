<script setup lang="ts">
import { computed } from 'vue'

import AppCard from '@/components/ui/AppCard.vue'
import type { Horse } from '@/types/horse'

interface Props {
  horses: Horse[]
}

const props = defineProps<Props>()

const sortedHorses = computed(() => [...props.horses].sort((left, right) => left.id - right.id))
</script>

<template>
  <AppCard title="Horse List (1 - 20)" subtitle="Unique horse color and condition profile">
    <v-list v-if="sortedHorses.length" density="compact" class="horse-list pa-0" data-testid="horse-list">
      <v-list-item v-for="horse in sortedHorses" :key="horse.id" class="px-2" :data-testid="`horse-row-${horse.id}`">
        <template #prepend>
          <span class="color-dot mr-3" :style="{ backgroundColor: horse.color }"></span>
        </template>
        <v-list-item-title class="text-body-2">
          {{ horse.name }}
        </v-list-item-title>
        <template #append>
          <div class="condition-wrap">
            <v-progress-linear :model-value="horse.condition" :color="horse.color" height="8" rounded />
            <span class="text-caption text-medium-emphasis">{{ horse.condition }}</span>
          </div>
        </template>
      </v-list-item>
    </v-list>
    <v-alert v-else type="info" variant="tonal" density="comfortable" text="Press Generate to create 20 horses." />
  </AppCard>
</template>

<style lang="scss" scoped>
.horse-list {
  max-height: 640px;
  overflow-y: auto;
}

.condition-wrap {
  min-width: 120px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
</style>
