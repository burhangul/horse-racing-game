import {
  HORSE_COLORS,
  HORSE_COUNT,
  HORSE_NAMES,
  HORSES_PER_ROUND,
  MAX_CONDITION,
  MIN_CONDITION,
  ROUND_DISTANCES,
  ROUNDS_COUNT,
} from '@/constants'
import { randomIntInRange, shuffleArray, type RandomGenerator } from '@/helpers/sampling-utils'
import type { Horse } from '@/types/horse'
import type { Round } from '@/types/race'
import type { RaceSchedule } from '@/types/race'

interface GeneratorOptions {
  random?: RandomGenerator
}

export const useHorseGenerator = (options: GeneratorOptions = {}) => {
  const random = options.random ?? Math.random

  /**
   * Creates exactly 20 horses with unique names and unique colors.
   */
  const generateHorses = (): Horse[] =>
    Array.from({ length: HORSE_COUNT }, (_, index) => ({
      id: index + 1,
      name: HORSE_NAMES[index],
      color: HORSE_COLORS[index],
      condition: randomIntInRange(MIN_CONDITION, MAX_CONDITION, random),
    }))

  /**
   * Creates a 6-round race schedule; each round includes 10 random horses.
   */
  const generateRaceSchedule = (horses: Horse[]): RaceSchedule => {
    const horseIds = horses.map((horse) => horse.id)
    const rounds: Round[] = ROUND_DISTANCES.map((distance, index) => ({
      roundNumber: index + 1,
      distance,
      horseIds: shuffleArray(horseIds, random).slice(0, HORSES_PER_ROUND),
    }))

    if (rounds.length !== ROUNDS_COUNT) {
      throw new Error('Round count mismatch while generating schedule.')
    }

    return { rounds }
  }

  return {
    generateHorses,
    generateRaceSchedule,
  }
}
