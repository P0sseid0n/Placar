export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
	public: {
		Tables: {
			placar: {
				Row: {
					created_at: string | null
					creator: string | null
					id: string
					score_increment: number
					team_a_name: string
					team_a_score: number | null
					team_b_name: string | null
					team_b_score: number
				}
				Insert: {
					created_at?: string | null
					creator?: string | null
					id: string
					score_increment?: number
					team_a_name: string
					team_a_score?: number | null
					team_b_name?: string | null
					team_b_score?: number
				}
				Update: {
					created_at?: string | null
					creator?: string | null
					id?: string
					score_increment?: number
					team_a_name?: string
					team_a_score?: number | null
					team_b_name?: string | null
					team_b_score?: number
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			[_ in never]: never
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}
