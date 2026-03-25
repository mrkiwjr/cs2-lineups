export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
        }
      }
      lineups: {
        Row: {
          id: number
          map: string
          side: string
          type: string
          name: string
          from: string
          to: string
          throw_type: string
          description: string
          video: string
          video_url: string
          screenshots: string[]
          author_id: string | null
          is_seed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          map: string
          side: string
          type: string
          name: string
          from: string
          to: string
          throw_type: string
          description: string
          video?: string
          video_url?: string
          screenshots?: string[]
          author_id?: string | null
          is_seed?: boolean
        }
        Update: {
          name?: string
          from?: string
          to?: string
          throw_type?: string
          description?: string
          video?: string
          video_url?: string
          screenshots?: string[]
        }
      }
      favorites: {
        Row: {
          user_id: string
          lineup_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          lineup_id: number
        }
        Update: never
      }
      lineup_views: {
        Row: {
          id: number
          lineup_id: number
          viewer_ip: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          lineup_id: number
          viewer_ip?: string | null
          user_id?: string | null
        }
        Update: never
      }
      comments: {
        Row: {
          id: number
          lineup_id: number
          user_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          lineup_id: number
          user_id: string
          text: string
        }
        Update: {
          text?: string
        }
      }
      map_positions: {
        Row: {
          map: string
          name: string
          x: number
          y: number
        }
        Insert: {
          map: string
          name: string
          x: number
          y: number
        }
        Update: never
      }
    }
    Views: {
      lineup_favorites_count: {
        Row: {
          lineup_id: number
          count: number
        }
      }
      lineup_view_count: {
        Row: {
          lineup_id: number
          count: number
        }
      }
    }
  }
}
