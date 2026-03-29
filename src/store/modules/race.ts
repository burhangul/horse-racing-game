import type { ActionTree, Module, MutationTree } from 'vuex'

import {
  GAME_STATUS,
  HORSES_PER_ROUND,
  MAX_ROUND_ANIMATION_MS,
  MIN_ROUND_ANIMATION_MS,
  PAUSE_POLL_MS,
  ROUND_GAP_MS,
} from '@/constants'
import type { GameStatus } from '@/constants'
import { useHorseGenerator } from '@/composables/useHorseGenerator'
import { useRaceEngine } from '@/composables/useRaceEngine'
import type { Horse, RaceResult } from '@/types/horse'
import type { GameState, RaceState } from '@/types/race'

export const RACE_MUTATIONS = {
  SET_SCHEDULE: 'SET_SCHEDULE',
  SET_CURRENT_ROUND: 'SET_CURRENT_ROUND',
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  CLEAR_RESULTS: 'CLEAR_RESULTS',
  ADD_RESULT: 'ADD_RESULT',
  SET_ACTIVE_ROUND_PREVIEW: 'SET_ACTIVE_ROUND_PREVIEW',
  SET_PAUSED: 'SET_PAUSED',
  RESET_RACE: 'RESET_RACE',
} as const

export interface StartRacePayload {
  horses: Horse[]
  roundDelayMs?: number
}

export interface GenerateSchedulePayload {
  horses: Horse[]
}

const sleep = async (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs)
  })

const waitWithPause = async (
  durationMs: number,
  isPaused: () => boolean,
): Promise<void> => {
  let elapsedMs = 0

  while (elapsedMs < durationMs) {
    if (isPaused()) {
      await sleep(PAUSE_POLL_MS)
      continue
    }

    const step = Math.min(PAUSE_POLL_MS, durationMs - elapsedMs)
    await sleep(step)
    elapsedMs += step
  }
}

const state = (): RaceState => ({
  schedule: null,
  currentRound: 0,
  results: [],
  activeRoundPreview: null,
  gameStatus: GAME_STATUS.IDLE,
  isPaused: false,
})

const mutations: MutationTree<RaceState> = {
  [RACE_MUTATIONS.SET_SCHEDULE](currentState: RaceState, schedule: RaceState['schedule']) {
    currentState.schedule = schedule
  },
  [RACE_MUTATIONS.SET_CURRENT_ROUND](currentState: RaceState, round: number) {
    currentState.currentRound = round
  },
  [RACE_MUTATIONS.SET_GAME_STATUS](currentState: RaceState, status: GameStatus) {
    currentState.gameStatus = status
  },
  [RACE_MUTATIONS.CLEAR_RESULTS](currentState: RaceState) {
    currentState.results = []
  },
  [RACE_MUTATIONS.ADD_RESULT](currentState: RaceState, result: RaceResult) {
    currentState.results = [...currentState.results, result]
  },
  [RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW](currentState: RaceState, preview: RaceResult | null) {
    currentState.activeRoundPreview = preview
  },
  [RACE_MUTATIONS.SET_PAUSED](currentState: RaceState, isPaused: boolean) {
    currentState.isPaused = isPaused
  },
  [RACE_MUTATIONS.RESET_RACE](currentState: RaceState) {
    currentState.currentRound = 0
    currentState.results = []
    currentState.activeRoundPreview = null
    currentState.gameStatus = GAME_STATUS.IDLE
    currentState.isPaused = false
    currentState.schedule = null
  },
}

const actions: ActionTree<RaceState, GameState> = {
  async generateSchedule(
    { commit },
    payload: GenerateSchedulePayload,
  ): Promise<void> {
    const { generateRaceSchedule } = useHorseGenerator()
    const schedule = generateRaceSchedule(payload.horses)
    commit(RACE_MUTATIONS.SET_SCHEDULE, schedule)
    commit(RACE_MUTATIONS.CLEAR_RESULTS)
    commit(RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW, null)
    commit(RACE_MUTATIONS.SET_CURRENT_ROUND, 0)
    commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.SCHEDULED)
    commit(RACE_MUTATIONS.SET_PAUSED, false)
  },

  async startRace({ state: raceState, commit }, payload: StartRacePayload): Promise<void> {
    if (!raceState.schedule || raceState.gameStatus === GAME_STATUS.RACING) {
      return
    }

    if (payload.horses.length < HORSES_PER_ROUND) {
      return
    }

    const { simulateRound } = useRaceEngine()
    const delayMs = payload.roundDelayMs ?? MAX_ROUND_ANIMATION_MS + ROUND_GAP_MS
    const nextRoundIndex = raceState.results.length
    const round = raceState.schedule.rounds[nextRoundIndex]

    if (!round) {
      commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.FINISHED)
      return
    }

    commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.RACING)
    commit(RACE_MUTATIONS.SET_PAUSED, false)
    commit(RACE_MUTATIONS.SET_CURRENT_ROUND, round.roundNumber)
    const roundResult = simulateRound(round, payload.horses)
    commit(RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW, roundResult)
    await waitWithPause(delayMs, () => raceState.isPaused)
    commit(RACE_MUTATIONS.ADD_RESULT, roundResult)
    await waitWithPause(ROUND_GAP_MS, () => raceState.isPaused)
    commit(RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW, null)

    const completedRounds = raceState.results.length
    if (completedRounds >= raceState.schedule.rounds.length) {
      commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.FINISHED)
      commit(RACE_MUTATIONS.SET_CURRENT_ROUND, raceState.schedule.rounds.length)
      return
    }

    commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.SCHEDULED)
    commit(RACE_MUTATIONS.SET_PAUSED, false)
  },

  async startAllRaces(
    { state: raceState, commit },
    payload: StartRacePayload,
  ): Promise<void> {
    if (!raceState.schedule || raceState.gameStatus === GAME_STATUS.RACING) {
      return
    }

    if (payload.horses.length < HORSES_PER_ROUND) {
      return
    }

    const { simulateRound } = useRaceEngine()
    const delayMs = payload.roundDelayMs ?? MAX_ROUND_ANIMATION_MS + ROUND_GAP_MS

    while (raceState.results.length < raceState.schedule.rounds.length) {
      const nextRoundIndex = raceState.results.length
      const round = raceState.schedule.rounds[nextRoundIndex]
      if (!round) {
        break
      }

      commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.RACING)
      commit(RACE_MUTATIONS.SET_PAUSED, false)
      commit(RACE_MUTATIONS.SET_CURRENT_ROUND, round.roundNumber)
      const roundResult = simulateRound(round, payload.horses)
      commit(RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW, roundResult)
      await waitWithPause(delayMs, () => raceState.isPaused)
      commit(RACE_MUTATIONS.ADD_RESULT, roundResult)
      await waitWithPause(ROUND_GAP_MS, () => raceState.isPaused)
      commit(RACE_MUTATIONS.SET_ACTIVE_ROUND_PREVIEW, null)

      if (raceState.results.length < raceState.schedule.rounds.length) {
        commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.SCHEDULED)
        commit(RACE_MUTATIONS.SET_PAUSED, false)
      }
    }

    commit(RACE_MUTATIONS.SET_GAME_STATUS, GAME_STATUS.FINISHED)
    commit(RACE_MUTATIONS.SET_PAUSED, false)
    commit(RACE_MUTATIONS.SET_CURRENT_ROUND, raceState.schedule.rounds.length)
  },

  async pauseRace({ state: raceState, commit }): Promise<void> {
    if (raceState.gameStatus !== GAME_STATUS.RACING) {
      return
    }
    commit(RACE_MUTATIONS.SET_PAUSED, true)
  },

  async resumeRace({ state: raceState, commit }): Promise<void> {
    if (raceState.gameStatus !== GAME_STATUS.RACING) {
      return
    }
    commit(RACE_MUTATIONS.SET_PAUSED, false)
  },

  async resetRace({ commit }): Promise<void> {
    commit(RACE_MUTATIONS.RESET_RACE)
  },
}

export const raceModule: Module<RaceState, GameState> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters: {
    minAnimationMs: () => MIN_ROUND_ANIMATION_MS,
  },
}
