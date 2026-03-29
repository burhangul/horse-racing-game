import type { RaceResult } from './horse'
import type { GameStatus } from '@/constants'

export interface Round {
  roundNumber: number
  distance: number
  horseIds: number[]
}

export interface RaceSchedule {
  rounds: Round[]
}

export interface RaceState {
  schedule: RaceSchedule | null
  currentRound: number
  results: RaceResult[]
  activeRoundPreview: RaceResult | null
  gameStatus: GameStatus
  isPaused: boolean
}

export interface HorsesState {
  horses: import('./horse').Horse[]
}

export interface GameState {
  horses: HorsesState
  race: RaceState
}
