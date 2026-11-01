import type { VideoGameForm } from '@/types/forms/VideoGameForm'
import type { VideoGame } from '@/types/models/VideoGame'
import { createResourceStore } from './create-resource-store'

export const useVideoGamesStore = createResourceStore<VideoGame, VideoGameForm>(
  'video_games',
  'video_games',
)
