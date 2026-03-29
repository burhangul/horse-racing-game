<script setup lang="ts">
import { computed, ref } from 'vue'

import AppCard from '@/components/ui/AppCard.vue'
import { GAME_STATUS, type GameStatus } from '@/constants'
import type { Horse } from '@/types/horse'
import type { RaceSchedule } from '@/types/race'

interface Props {
  schedule: RaceSchedule | null
  horses: Horse[]
  currentRound: number
  gameStatus: GameStatus
  completedRounds: number
}

const props = defineProps<Props>()
const isDialogOpen = ref(false)
const selectedRoundNumber = ref<number | null>(null)

const horseMap = computed(() => new Map(props.horses.map((horse) => [horse.id, horse])))

const rows = computed(() =>
  props.schedule?.rounds.map((round) => ({
    ...round,
    horseDetails: round.horseIds
      .map((horseId) => horseMap.value.get(horseId))
      .filter((horse): horse is Horse => Boolean(horse)),
    horseNames: round.horseIds
      .map((horseId) => horseMap.value.get(horseId)?.name)
      .filter((name): name is string => Boolean(name)),
  })) ?? [],
)

const selectedRound = computed(() => {
  if (!selectedRoundNumber.value) {
    return null
  }
  return rows.value.find((row) => row.roundNumber === selectedRoundNumber.value) ?? null
})

const getRoundColor = (roundNumber: number): string => {
  if (props.completedRounds >= roundNumber) {
    return 'success'
  }
  if (props.gameStatus === GAME_STATUS.RACING && props.currentRound === roundNumber) {
    return 'info'
  }
  return 'grey-darken-1'
}

const openRoundDetails = (roundNumber: number): void => {
  selectedRoundNumber.value = roundNumber
  isDialogOpen.value = true
}
</script>

<template>
  <AppCard title="Program" subtitle="6 rounds / 10 horses each">
    <v-list density="compact" class="pa-0" data-testid="schedule-list">
      <v-list-item
        v-for="round in rows"
        :key="round.roundNumber"
        :data-testid="`schedule-round-${round.roundNumber}`"
      >
        <template #prepend>
          <v-chip size="small" :color="getRoundColor(round.roundNumber)" class="mr-2">
            {{ round.roundNumber }}
          </v-chip>
        </template>
        <v-list-item-title class="text-body-2">
          {{ round.distance }}m
        </v-list-item-title>
        <v-list-item-subtitle class="text-caption text-medium-emphasis horse-names">
          {{ round.horseNames.join(', ') }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn
            icon="mdi-information-outline"
            size="x-small"
            variant="text"
            :data-testid="`schedule-info-${round.roundNumber}`"
            @click="openRoundDetails(round.roundNumber)"
          />
        </template>
      </v-list-item>
    </v-list>
  </AppCard>

  <v-dialog v-model="isDialogOpen" max-width="560">
    <v-card v-if="selectedRound" class="border-thin">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        Round {{ selectedRound.roundNumber }} - {{ selectedRound.distance }}m
      </v-card-title>
      <v-divider />
      <v-card-text class="pt-3">
        <v-list density="compact">
          <v-list-item v-for="horse in selectedRound.horseDetails" :key="horse.id">
            <template #prepend>
              <span class="color-dot mr-3" :style="{ backgroundColor: horse.color }" />
            </template>
            <v-list-item-title>{{ horse.name }}</v-list-item-title>
            <template #append>
              <div class="condition-wrap">
                <v-progress-linear
                  :model-value="horse.condition"
                  :color="horse.color"
                  height="8"
                  rounded
                />
                <span class="text-caption text-medium-emphasis">{{ horse.condition }}</span>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" color="primary" @click="isDialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.horse-names {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  line-height: 1.35;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.condition-wrap {
  min-width: 120px;
}
</style>
