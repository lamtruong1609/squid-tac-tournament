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
          current_round: number
          is_final_round: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          status?: 'waiting' | 'in_progress' | 'completed'
          max_players?: number
          current_players?: number
          current_round?: number
          is_final_round?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          status?: 'waiting' | 'in_progress' | 'completed'
          max_players?: number
          current_players?: number
          current_round?: number
          is_final_round?: boolean
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
          status: 'waiting' | 'in_progress' | 'completed' | 'rps_tiebreaker'
          round: number
          current_turn: number
          turns_history: string
          rps_history: string | null
          player_x_ready: boolean
          player_o_ready: boolean
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
          status?: 'waiting' | 'in_progress' | 'completed' | 'rps_tiebreaker'
          round?: number
          current_turn?: number
          turns_history?: string
          rps_history?: string | null
          player_x_ready?: boolean
          player_o_ready?: boolean
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
          status?: 'waiting' | 'in_progress' | 'completed' | 'rps_tiebreaker'
          round?: number
          current_turn?: number
          turns_history?: string
          rps_history?: string | null
          player_x_ready?: boolean
          player_o_ready?: boolean
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          password: string
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
          password: string
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
          password?: string
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