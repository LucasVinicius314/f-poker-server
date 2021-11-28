import { User } from './user'

export type Game = {
  id: string
  name: string
  players: User[]
}
