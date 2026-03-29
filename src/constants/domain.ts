export const HORSE_COUNT = 20
export const ROUNDS_COUNT = 6
export const HORSES_PER_ROUND = 10
export const MIN_CONDITION = 1
export const MAX_CONDITION = 100

export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const

export const BASE_SPEED_METERS_PER_SECOND = 17
export const MIN_RANDOM_FACTOR = 0.85
export const MAX_RANDOM_FACTOR = 1.15

export const GAME_STATUS = {
  IDLE: 'idle',
  SCHEDULED: 'scheduled',
  RACING: 'racing',
  FINISHED: 'finished',
} as const

export type GameStatus = (typeof GAME_STATUS)[keyof typeof GAME_STATUS]

export const GAME_STATUSES: GameStatus[] = Object.values(GAME_STATUS)
