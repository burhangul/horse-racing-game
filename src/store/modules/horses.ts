import type { ActionTree, Module, MutationTree } from 'vuex'

import { useHorseGenerator } from '@/composables/useHorseGenerator'
import type { HorsesState, GameState } from '@/types/race'
import type { Horse } from '@/types/horse'

export const HORSES_MUTATIONS = {
  SET_HORSES: 'SET_HORSES',
  CLEAR_HORSES: 'CLEAR_HORSES',
} as const

const state = (): HorsesState => ({
  horses: [],
})

const mutations: MutationTree<HorsesState> = {
  [HORSES_MUTATIONS.SET_HORSES](currentState: HorsesState, horses: Horse[]) {
    currentState.horses = horses
  },
  [HORSES_MUTATIONS.CLEAR_HORSES](currentState: HorsesState) {
    currentState.horses = []
  },
}

const actions: ActionTree<HorsesState, GameState> = {
  async generateHorses({ commit }): Promise<void> {
    const { generateHorses } = useHorseGenerator()
    commit(HORSES_MUTATIONS.SET_HORSES, generateHorses())
  },
  async clearHorses({ commit }): Promise<void> {
    commit(HORSES_MUTATIONS.CLEAR_HORSES)
  },
}

export const horsesModule: Module<HorsesState, GameState> = {
  namespaced: true,
  state,
  mutations,
  actions,
}
