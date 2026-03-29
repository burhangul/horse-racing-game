import { describe, expect, it } from 'vitest'
import { createStore } from 'vuex'

import { horsesModule } from '@/store/modules/horses'
import { raceModule } from '@/store/modules/race'
import type { GameState } from '@/types/race'

const createMockHorses = () =>
  Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Horse ${index + 1}`,
    color: `#${(0x100000 + index).toString(16).padStart(6, '0')}`,
    condition: 60 + (index % 40),
  }))

describe('race module', () => {
  it('runs one round per startRace call and then finishes', async () => {
    const store = createStore<GameState>({
      modules: {
        horses: horsesModule,
        race: raceModule,
      },
    })

    const horses = createMockHorses()

    expect(store.state.race.gameStatus).toBe('idle')
    await store.dispatch('race/generateSchedule', { horses })
    expect(store.state.race.gameStatus).toBe('scheduled')

    await store.dispatch('race/startRace', { horses, roundDelayMs: 0 })
    expect(store.state.race.results).toHaveLength(1)
    expect(store.state.race.gameStatus).toBe('scheduled')

    for (let step = 0; step < 5; step += 1) {
      await store.dispatch('race/startRace', { horses, roundDelayMs: 0 })
    }

    expect(store.state.race.results).toHaveLength(6)
    expect(store.state.race.gameStatus).toBe('finished')
  })

  it('startAllRaces completes all remaining rounds', async () => {
    const store = createStore<GameState>({
      modules: {
        horses: horsesModule,
        race: raceModule,
      },
    })

    const horses = createMockHorses()
    await store.dispatch('race/generateSchedule', { horses })
    await store.dispatch('race/startAllRaces', { horses, roundDelayMs: 0 })

    expect(store.state.race.results).toHaveLength(6)
    expect(store.state.race.gameStatus).toBe('finished')
  })

  it('supports pause and resume during active round', async () => {
    const store = createStore<GameState>({
      modules: {
        horses: horsesModule,
        race: raceModule,
      },
    })

    const horses = createMockHorses()
    await store.dispatch('race/generateSchedule', { horses })

    const racePromise = store.dispatch('race/startRace', { horses, roundDelayMs: 200 })
    await new Promise((resolve) => setTimeout(resolve, 40))
    await store.dispatch('race/pauseRace')
    expect(store.state.race.isPaused).toBe(true)

    await store.dispatch('race/resumeRace')
    expect(store.state.race.isPaused).toBe(false)
    await racePromise

    expect(store.state.race.results).toHaveLength(1)
  })
})
