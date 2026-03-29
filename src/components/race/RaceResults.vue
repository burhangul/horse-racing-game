<script setup lang="ts">
import AppCard from '@/components/ui/AppCard.vue'
import type { RaceResult } from '@/types/horse'

interface Props {
  results: RaceResult[]
}

const props = defineProps<Props>()
</script>

<template>
  <AppCard title="Results" subtitle="Completed rounds appear in sequence">
    <div class="results-wrap" data-testid="results-panel">
      <v-expansion-panels
        v-if="props.results.length"
        multiple
        variant="accordion"
        class="bg-transparent"
      >
        <v-expansion-panel
          v-for="result in props.results"
          :key="result.roundNumber"
          :data-testid="`result-round-${result.roundNumber}`"
          elevation="0"
          class="mb-2 border-thin rounded result-panel"
        >
          <v-expansion-panel-title class="result-panel-title">
            Round {{ result.roundNumber }} - {{ result.distance }}m
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="horse in result.standings"
                :key="horse.horseId"
                class="px-0"
              >
                <template #prepend>
                  <strong class="mr-2">{{ horse.position }}.</strong>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ horse.horseName }}
                </v-list-item-title>
                <template #append>
                  <span class="text-caption text-medium-emphasis">{{ horse.finishTime.toFixed(2) }}s</span>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-alert
        v-else
        type="info"
        variant="tonal"
        density="comfortable"
        text="Start the race to populate live results."
      />
    </div>
  </AppCard>
</template>

<style scoped>
.results-wrap {
  max-height: 430px;
  overflow-y: auto;
  padding-right: 4px;
}

.results-wrap :deep(.v-expansion-panels) {
  overflow-y: auto;
  max-height: 300px;
}

.results-wrap :deep(.result-panel-title) {
  position: sticky;
  top: 0;
  z-index: 3;
  backdrop-filter: blur(6px);
  background: linear-gradient(120deg, rgba(28, 34, 44, 0.96), rgba(24, 29, 38, 0.96));
}

.results-wrap :deep(.result-panel .v-expansion-panel-text__wrapper) {
  padding-top: 8px;
}
</style>
