import { describe, expect, it } from 'vitest'
import { createStore } from 'vuex'

import { HORSE_COUNT } from '@/constants'
import { HORSES_MUTATIONS, horsesModule } from '@/store/modules/horses'
import { raceModule } from '@/store/modules/race'
import type { GameState, HorsesState } from '@/types/race'

describe('horses module', () => {
  it('sets horses via mutation', () => {
    const state: HorsesState = { horses: [] }
    horsesModule.mutations?.[HORSES_MUTATIONS.SET_HORSES]?.(state, [
      { id: 1, name: 'Alpha', color: '#111111', condition: 50 },
    ])

    expect(state.horses).toHaveLength(1)
    expect(state.horses[0].name).toBe('Alpha')
  })

  it('generates horses via action', async () => {
    const store = createStore<GameState>({
      modules: {
        horses: horsesModule,
        race: raceModule,
      },
    })

    await store.dispatch('horses/generateHorses')
    expect(store.state.horses.horses).toHaveLength(HORSE_COUNT)
  })
})
