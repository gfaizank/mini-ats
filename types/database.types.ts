export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberRole = 'admin' | 'member'
export type JobStatus = 'open' | 'closed' | 'archived'
export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: {
          id: string
          name: string
          max_jobs: number
          max_candidates: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          max_jobs: number
          max_candidates: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          max_jobs?: number
          max_candidates?: number
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          plan_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      company_members: {
        Row: {
          id: string
          user_id: string
          company_id: string
          role: MemberRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          role?: MemberRole
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          role?: MemberRole
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string | null
          location: string | null
          department: string | null
          status: JobStatus
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description?: string | null
          location?: string | null
          department?: string | null
          status?: JobStatus
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string | null
          location?: string | null
          department?: string | null
          status?: JobStatus
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
      }
      candidates: {
        Row: {
          id: string
          company_id: string
          name: string
          email: string
          phone: string | null
          resume_url: string | null
          linkedin_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          email: string
          phone?: string | null
          resume_url?: string | null
          linkedin_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          email?: string
          phone?: string | null
          resume_url?: string | null
          linkedin_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          job_id: string
          stage: ApplicationStage
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id: string
          stage?: ApplicationStage
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_id?: string
          stage?: ApplicationStage
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      get_active_jobs_count: {
        Args: { company_uuid: string }
        Returns: number
      }
      get_candidates_count: {
        Args: { company_uuid: string }
        Returns: number
      }
      is_company_admin: {
        Args: { company_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      member_role: MemberRole
      job_status: JobStatus
      application_stage: ApplicationStage
    }
  }
}

