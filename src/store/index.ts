import { createStore } from 'vuex'
import { useStore as baseUseStore } from 'vuex'
import type { InjectionKey } from 'vue'
import type { Store } from 'vuex'

import { horsesModule } from './modules/horses'
import { raceModule } from './modules/race'
import type { GameState } from '@/types/race'

export const key: InjectionKey<Store<GameState>> = Symbol('race-store-key')

export const store = createStore<GameState>({
  modules: {
    horses: horsesModule,
    race: raceModule,
  },
})

export const useStore = () => baseUseStore(key)
