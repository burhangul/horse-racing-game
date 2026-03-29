import { describe, expect, it } from 'vitest'

import { HORSE_COUNT, MAX_CONDITION, MIN_CONDITION } from '@/constants'
import { useHorseGenerator } from '@/composables/useHorseGenerator'

describe('useHorseGenerator', () => {
  it('generates exactly 20 unique horses', () => {
    const { generateHorses } = useHorseGenerator()
    const horses = generateHorses()

    expect(horses).toHaveLength(HORSE_COUNT)
    expect(new Set(horses.map((horse) => horse.id)).size).toBe(HORSE_COUNT)
    expect(new Set(horses.map((horse) => horse.name)).size).toBe(HORSE_COUNT)
    expect(new Set(horses.map((horse) => horse.color)).size).toBe(HORSE_COUNT)
  })

  it('keeps condition score in 1-100 range', () => {
    const { generateHorses } = useHorseGenerator()
    const horses = generateHorses()

    horses.forEach((horse) => {
      expect(horse.condition).toBeGreaterThanOrEqual(MIN_CONDITION)
      expect(horse.condition).toBeLessThanOrEqual(MAX_CONDITION)
    })
  })
})
