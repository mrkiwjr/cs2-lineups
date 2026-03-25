export interface Comment {
  id: number
  lineup_id: number
  user_id: string
  text: string
  created_at: string
  updated_at: string
  author?: {
    username: string | null
    avatar_url: string | null
  }
}
