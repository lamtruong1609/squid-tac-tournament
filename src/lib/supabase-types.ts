export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          created_at: string
          name: string
          status: 'waiting' | 'in_progress' | 'completed'
          max_players: number
          current_players: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          status?: 'waiting' | 'in_progress' | 'completed'
          max_players?: number
          current_players?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          status?: 'waiting' | 'in_progress' | 'completed'
          max_players?: number
          current_players?: number
        }
      }
      games: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          player_x: string
          player_o: string | null
          board: string
          next_player: 'X' | 'O'
          winner: string | null
          status: 'waiting' | 'in_progress' | 'completed'
        }
        Insert: {
          id?: string
          created_at?: string
          tournament_id: string
          player_x: string
          player_o?: string | null
          board?: string
          next_player?: 'X' | 'O'
          winner?: string | null
          status?: 'waiting' | 'in_progress' | 'completed'
        }
        Update: {
          id?: string
          created_at?: string
          tournament_id?: string
          player_x?: string
          player_o?: string | null
          board?: string
          next_player?: 'X' | 'O'
          winner?: string | null
          status?: 'waiting' | 'in_progress' | 'completed'
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          telegram_url: string | null
          x_url: string | null
          wins: number
          losses: number
          draws: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          telegram_url?: string | null
          x_url?: string | null
          wins?: number
          losses?: number
          draws?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          telegram_url?: string | null
          x_url?: string | null
          wins?: number
          losses?: number
          draws?: number
        }
      }
    }
  }
}