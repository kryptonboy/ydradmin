import type { GameFormatForm } from '@/types/forms/GameFormatForm'
import type { GameFormat } from '@/types/models/GameFormat'
import { createResourceStore } from './create-resource-store'

export const useGameFormatsStore = createResourceStore<GameFormat, GameFormatForm>(
  'game_formats',
  'game_formats',
)
