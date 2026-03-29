<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch } from 'vue'

import {
  MAX_ROUND_ANIMATION_MS,
  MIN_ROUND_ANIMATION_MS,
  TRACK_ANIMATION_TICK_MS,
  TRACK_PROGRESS_FINISH_PERCENT,
  TRACK_PROGRESS_START_PERCENT,
} from '@/constants'
import AppCard from '@/components/ui/AppCard.vue'
import type { HorseFinish, RaceResult } from '@/types/horse'
import type { Round } from '@/types/race'

interface Props {
  activeRound: Round | null
  activePreview: RaceResult | null
  isPaused: boolean
}

const props = defineProps<Props>()

interface TrackLane extends HorseFinish {
  laneNumber: number
}

const progressMap = reactive<Record<number, number>>({})
let timerId: ReturnType<typeof setInterval> | null = null

const clearTimer = (): void => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

const horseMarkerStylesById = computed(() => {
  const activeStandings = props.activePreview?.standings ?? []
  if (!activeStandings.length) {
    return new Map<number, { left: string; transitionDuration: string; transitionTimingFunction: string }>()
  }

  return new Map(
    activeStandings.map((horse) => {
      return [
        horse.horseId,
        {
          left: `${progressMap[horse.horseId] ?? TRACK_PROGRESS_START_PERCENT}%`,
          transitionDuration: `${TRACK_ANIMATION_TICK_MS}ms`,
          transitionTimingFunction: 'linear',
        },
      ]
    }),
  )
})

const lanes = computed<TrackLane[]>(() => {
  if (!props.activeRound || !props.activePreview) {
    return []
  }

  const finishByHorseId = new Map(
    props.activePreview.standings.map((horse) => [horse.horseId, horse] as const),
  )

  return props.activeRound.horseIds
    .map((horseId, index) => {
      const finish = finishByHorseId.get(horseId)
      if (!finish) {
        return null
      }

      return {
        ...finish,
        laneNumber: index + 1,
      }
    })
    .filter((lane): lane is TrackLane => Boolean(lane))
})
const distanceLabel = computed(() => {
  if (!props.activeRound) {
    return 'Waiting for generated schedule'
  }
  return `${props.activeRound.roundNumber}. Lap ${props.activeRound.distance}m`
})

watch(
  () => props.activePreview?.roundNumber,
  (roundNumber) => {
    clearTimer()

    if (!roundNumber || !props.activePreview) {
      return
    }

    const standings = props.activePreview.standings
    const finishTimes = standings.map((horse) => horse.finishTime)
    const minFinishTime = Math.min(...finishTimes)
    const maxFinishTime = Math.max(...finishTimes)
    const spread = Math.max(maxFinishTime - minFinishTime, 0.01)

    const durationByHorse = new Map<number, number>(
      standings.map((horse) => {
        const ratio = (horse.finishTime - minFinishTime) / spread
        const duration = MIN_ROUND_ANIMATION_MS + ratio * (MAX_ROUND_ANIMATION_MS - MIN_ROUND_ANIMATION_MS)
        return [horse.horseId, duration]
      }),
    )

    props.activePreview.standings.forEach((horse) => {
      progressMap[horse.horseId] = TRACK_PROGRESS_START_PERCENT
    })

    let elapsedMs = 0
    timerId = setInterval(() => {
      if (props.isPaused) {
        return
      }

      elapsedMs += TRACK_ANIMATION_TICK_MS

      standings.forEach((horse) => {
        const targetDuration = durationByHorse.get(horse.horseId) ?? MAX_ROUND_ANIMATION_MS
        const progressRatio = Math.min(elapsedMs / targetDuration, 1)
        const nextProgress =
          TRACK_PROGRESS_START_PERCENT +
          (TRACK_PROGRESS_FINISH_PERCENT - TRACK_PROGRESS_START_PERCENT) * progressRatio
        progressMap[horse.horseId] = nextProgress
      })

      if (elapsedMs >= MAX_ROUND_ANIMATION_MS) {
        clearTimer()
      }
    }, TRACK_ANIMATION_TICK_MS)
  },
)

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <AppCard title="Race Track" subtitle="Live lane animation for current round">
    <div class="track-shell">
      <div v-if="lanes.length" class="track" data-testid="race-track">
        <div
          v-for="horse in lanes"
          :key="horse.horseId"
          class="lane"
          :style="{ borderColor: `${horse.horseColor}70` }"
        >
          <div class="lane-index">{{ horse.laneNumber }}</div>
          <div
            class="horse-marker"
            :class="{ paused: props.isPaused }"
            :style="horseMarkerStylesById.get(horse.horseId)"
          >
            <v-icon icon="mdi-horse-human" :color="horse.horseColor" size="34" class="horse-icon" />
          </div>
          <div class="horse-name text-caption">{{ horse.horseName }}</div>
        </div>
        <div class="finish-line">
          <span>FINISH</span>
        </div>
      </div>
      <v-alert
        v-else
        type="info"
        variant="tonal"
        density="comfortable"
        text="Generate and start the race to animate horses."
      />
      <div class="distance-label" data-testid="round-distance">{{ distanceLabel }}</div>
    </div>
  </AppCard>
</template>

<style lang="scss" scoped>
.track-shell {
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: radial-gradient(circle at 20% 10%, #1f4231 0%, #121a16 65%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 12px;

  .track {
    position: relative;
    display: grid;
    gap: 4px;
    min-height: 460px;

    .lane {
      position: relative;
      border-top: 1px dashed rgba(255, 255, 255, 0.22);
      padding-top: 2px;
      min-height: 42px;

      .lane-index {
        position: absolute;
        left: 0;
        top: 10px;
        width: 18px;
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
      }

      .horse-name {
        position: absolute;
        right: 64px;
        top: 10px;
        color: rgba(255, 255, 255, 0.8);
      }

      .horse-marker {
        width: 44px;
        position: absolute;
        top: 4px;
        left: 0;
        transform: translateX(-6%);
        transition-property: left;

        &.paused {
          opacity: 0.9;
        }

        &::after {
          content: '';
          position: absolute;
          left: 9px;
          top: 24px;
          width: 22px;
          height: 4px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
          filter: blur(1px);
        }

        .horse-icon {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.55));
        }
      }
    }

    .finish-line {
      position: absolute;
      right: 48px;
      top: 0;
      height: 100%;
      border-right: 4px dashed #e53935;
      display: flex;
      align-items: flex-end;
      padding-bottom: 6px;

      span {
        color: #ff8a80;
        font-weight: 700;
        font-size: 0.85rem;
      }
    }
  }

  .distance-label {
    text-align: center;
    margin-top: 8px;
    color: #ffccbc;
    font-weight: 700;
  }
}
</style>
