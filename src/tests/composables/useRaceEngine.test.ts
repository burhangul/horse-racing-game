import { describe, expect, it } from 'vitest'

import { useRaceEngine } from '@/composables/useRaceEngine'
import type { Horse } from '@/types/horse'
import type { Round } from '@/types/race'

const mockRound: Round = {
  roundNumber: 1,
  distance: 1200,
  horseIds: [1, 2, 3],
}

describe('useRaceEngine', () => {
  it('returns results sorted by finish time', () => {
    const horses: Horse[] = [
      { id: 1, name: 'One', color: '#111111', condition: 55 },
      { id: 2, name: 'Two', color: '#222222', condition: 85 },
      { id: 3, name: 'Three', color: '#333333', condition: 65 },
    ]

    const { simulateRound } = useRaceEngine({ random: () => 0.5 })
    const result = simulateRound(mockRound, horses)
    const finishTimes = result.standings.map((item) => item.finishTime)
    const sorted = [...finishTimes].sort((a, b) => a - b)

    expect(finishTimes).toEqual(sorted)
    expect(result.standings.map((item) => item.position)).toEqual([1, 2, 3])
  })

  it('favours horse with better condition when randomness is equal', () => {
    const horses: Horse[] = [
      { id: 1, name: 'High', color: '#111111', condition: 90 },
      { id: 2, name: 'Low', color: '#222222', condition: 30 },
      { id: 3, name: 'Mid', color: '#333333', condition: 50 },
    ]

    const { simulateRound } = useRaceEngine({ random: () => 0.5 })
    const result = simulateRound(mockRound, horses)
    const winner = result.standings[0]

    expect(winner.horseName).toBe('High')
    expect(result.standings.find((item) => item.horseName === 'Low')?.finishTime).toBeGreaterThan(
      winner.finishTime,
    )
  })
})
