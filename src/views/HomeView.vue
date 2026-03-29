<script setup lang="ts">
import { computed, ref } from 'vue'

import HorseList from '@/components/race/HorseList.vue'
import RaceResults from '@/components/race/RaceResults.vue'
import RaceSchedule from '@/components/race/RaceSchedule.vue'
import RaceTrack from '@/components/race/RaceTrack.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { GAME_STATUS, type GameStatus } from '@/constants'
import { useStore } from '@/store'
import type { Round } from '@/types/race'

const store = useStore()
const isGenerating = ref(false)
const isAutoStarting = ref(false)

const horses = computed(() => store.state.horses.horses)
const raceState = computed(() => store.state.race)
const completedRounds = computed(() => raceState.value.results.length)
const gameStatus = computed<GameStatus>(() => raceState.value.gameStatus)
const isPaused = computed(() => raceState.value.isPaused)
const schedule = computed(() => raceState.value.schedule)
const totalRounds = computed(() => schedule.value?.rounds.length ?? 0)
const hasRemainingRounds = computed(() => completedRounds.value < totalRounds.value)
const activeRound = computed(
  () =>
    schedule.value?.rounds.find(
      (round: Round) => round.roundNumber === raceState.value.currentRound,
    ) ?? null,
)

const canGenerate = computed(() => gameStatus.value !== GAME_STATUS.RACING)
const canStart = computed(() => {
  if (!schedule.value || horses.value.length === 0) {
    return false
  }
  if (gameStatus.value === GAME_STATUS.RACING) {
    return true
  }
  return hasRemainingRounds.value
})
const canStartAll = computed(
  () =>
    Boolean(schedule.value) &&
    horses.value.length > 0 &&
    gameStatus.value !== GAME_STATUS.RACING &&
    hasRemainingRounds.value,
)
const startButtonLabel = computed(() => {
  if (gameStatus.value === GAME_STATUS.RACING) {
    return isPaused.value ? 'Resume' : 'Pause'
  }
  return completedRounds.value === 0 ? 'Start' : 'Start Next Round'
})
const startButtonIcon = computed(() => {
  if (gameStatus.value === GAME_STATUS.RACING) {
    return isPaused.value ? 'mdi-play' : 'mdi-pause'
  }
  return 'mdi-play'
})
const statusLabel = computed(() =>
  gameStatus.value === GAME_STATUS.RACING && isPaused.value ? 'paused' : gameStatus.value,
)
const statusChipColor = computed(() => {
  if (gameStatus.value === GAME_STATUS.RACING && isPaused.value) {
    return 'warning'
  }
  if (gameStatus.value === GAME_STATUS.FINISHED) {
    return 'success'
  }
  if (gameStatus.value === GAME_STATUS.RACING) {
    return 'info'
  }
  if (gameStatus.value === GAME_STATUS.SCHEDULED) {
    return 'warning'
  }
  return 'grey'
})

const generateProgram = async (): Promise<void> => {
  if (!canGenerate.value) {
    return
  }
  isGenerating.value = true
  await store.dispatch('horses/generateHorses')
  await store.dispatch('race/generateSchedule', { horses: store.state.horses.horses })
  isGenerating.value = false
}

const startRace = async (): Promise<void> => {
  if (gameStatus.value === GAME_STATUS.RACING) {
    if (isPaused.value) {
      await store.dispatch('race/resumeRace')
      return
    }
    await store.dispatch('race/pauseRace')
    return
  }

  if (!canStart.value) {
    return
  }
  await store.dispatch('race/startRace', { horses: horses.value })
}

const startAllRaces = async (): Promise<void> => {
  if (!canStartAll.value) {
    return
  }
  isAutoStarting.value = true
  await store.dispatch('race/startAllRaces', { horses: horses.value })
  isAutoStarting.value = false
}
</script>

<template>
  <v-container
    fluid
    class="py-4"
  >
    <v-row class="mb-3 sticky-header">
      <v-col
        cols="12"
        md="5"
      >
        <h1 class="text-h5 font-weight-bold">Horse Racing</h1>
      </v-col>
      <v-col
        cols="12"
        md="7"
        class="d-flex justify-md-end ga-2 align-center flex-wrap"
      >
        <v-chip
          :color="statusChipColor"
          variant="elevated"
          class="text-uppercase"
        >
          {{ statusLabel }}
        </v-chip>
        <AppButton
          label="Generate Program"
          prepend-icon="mdi-refresh"
          :disabled="!canGenerate"
          :loading="isGenerating"
          test-id="generate-button"
          @click="generateProgram"
        />
        <AppButton
          :label="startButtonLabel"
          :prepend-icon="startButtonIcon"
          color="secondary"
          :disabled="!canStart"
          :loading="false"
          test-id="start-button"
          @click="startRace"
        />
        <AppButton
          label="Run All"
          prepend-icon="mdi-fast-forward"
          color="primary"
          variant="outlined"
          :disabled="!canStartAll"
          :loading="isAutoStarting"
          test-id="start-all-button"
          @click="startAllRaces"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="3"
        class="layout-column"
      >
        <HorseList :horses="horses" />
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="layout-column"
      >
        <RaceTrack
          :active-round="activeRound"
          :active-preview="raceState.activeRoundPreview"
          :is-paused="isPaused"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
        class="d-flex flex-column ga-3 layout-column"
      >
        <RaceSchedule
          :schedule="schedule"
          :horses="horses"
          :current-round="raceState.currentRound"
          :game-status="gameStatus"
          :completed-rounds="completedRounds"
        />
        <RaceResults :results="raceState.results" />
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-inline: 0;
  padding-block: 8px;
  backdrop-filter: blur(8px);
  background: linear-gradient(120deg, rgba(18, 24, 34, 0.92), rgba(20, 27, 38, 0.92));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.layout-column {
  max-height: calc(100vh - 80px);
}

.v-row + .v-row {
  margin-top: 0;
}
</style>
