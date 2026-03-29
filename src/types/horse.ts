export interface Horse {
  id: number
  name: string
  color: string
  condition: number
}

export interface HorseFinish {
  horseId: number
  horseName: string
  horseColor: string
  condition: number
  position: number
  finishTime: number
}

export interface RaceResult {
  roundNumber: number
  distance: number
  standings: HorseFinish[]
}
