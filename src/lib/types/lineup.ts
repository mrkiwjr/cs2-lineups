export type GrenadeType = 'smoke' | 'flash' | 'molotov' | 'he'
export type Side = 'T' | 'CT'
export type ThrowType = 'normal' | 'jumpthrow' | 'runthrow' | 'walkthrow'
export type MapSlug = 'mirage' | 'inferno' | 'dust2' | 'nuke' | 'anubis' | 'ancient' | 'overpass'

export interface Lineup {
  id: number
  map: MapSlug
  side: Side
  type: GrenadeType
  name: string
  from: string
  to: string
  throw_type: ThrowType
  description: string
  video: string
  video_url: string
  screenshots: string[]
  author_id: string | null
  is_seed: boolean
  created_at: string
  updated_at: string
}

export interface LineupWithStats extends Lineup {
  views_count: number
  favorites_count: number
  is_favorited: boolean
  author?: {
    username: string | null
    avatar_url: string | null
  }
}

export interface LineupFilters {
  map: MapSlug
  type: GrenadeType | 'all'
  side: Side | 'all'
  search: string
  tab: 'all' | 'favorites'
}
