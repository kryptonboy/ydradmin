import type { VideoGameSupportForm } from '@/types/forms/VideoGameSupportForm'
import type { VideoGameSupport } from '@/types/models/VideoGameSupport'
import { createResourceStore } from './create-resource-store'

export const useVideoGameSupportsStore = createResourceStore<
  VideoGameSupport,
  VideoGameSupportForm
>('video_game_supports', 'video_game_supports')
