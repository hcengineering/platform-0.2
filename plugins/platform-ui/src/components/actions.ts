import { Asset } from '../index'

export interface Action {
  name: string
  icon?: Asset
  action?: () => void
}
