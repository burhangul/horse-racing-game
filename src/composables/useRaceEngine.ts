import {
  BASE_SPEED_METERS_PER_SECOND,
  MAX_RANDOM_FACTOR,
  MIN_RANDOM_FACTOR,
} from '@/constants'
import { randomBetween, type RandomGenerator } from '@/helpers/sampling-utils'
import type { Horse, HorseFinish, RaceResult } from '@/types/horse'
import type { Round } from '@/types/race'

interface RaceEngineOptions {
  random?: RandomGenerator
}

export const useRaceEngine = (options: RaceEngineOptions = {}) => {
  const random = options.random ?? Math.random

  /**
   * Simulates one round and returns a fully ranked round result.
   */
  const simulateRound = (round: Round, allHorses: Horse[]): RaceResult => {
    const selectedHorses = round.horseIds
      .map((horseId) => allHorses.find((horse) => horse.id === horseId))
      .filter((horse): horse is Horse => Boolean(horse))

    const finishes: HorseFinish[] = selectedHorses
      .map((horse) => {
        const conditionFactor = horse.condition / 100
        const randomFactor = randomBetween(MIN_RANDOM_FACTOR, MAX_RANDOM_FACTOR, random)
        const finishTime = round.distance / (BASE_SPEED_METERS_PER_SECOND * conditionFactor * randomFactor)
        return {
          horseId: horse.id,
          horseName: horse.name,
          horseColor: horse.color,
          condition: horse.condition,
          position: 0,
          finishTime: Number(finishTime.toFixed(2)),
        }
      })
      .sort((left, right) => left.finishTime - right.finishTime)
      .map((finish, index) => ({
        ...finish,
        position: index + 1,
      }))

    return {
      roundNumber: round.roundNumber,
      distance: round.distance,
      standings: finishes,
    }
  }

  return {
    simulateRound,
  }
}
