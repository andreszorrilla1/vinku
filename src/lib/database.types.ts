// Auto-generado: npx supabase gen types typescript --project-id <PROJECT_ID>
// Actualizar después de conectar el proyecto Supabase real.

export type UserRole = 'student' | 'corporate_admin' | 'university_admin' | 'superadmin';
export type CourseLevel = 'Pregrado' | 'Posgrado' | 'Educación Continua';
export type EnrollmentStatus = 'Cursando' | 'Certificado' | 'Abandonado';
export type DiagStatus = 'Pendiente' | 'Ruta Generada' | 'Matriculado';
export type AchievementStatus = 'Definido' | 'En Progreso' | 'Cumplido';
export type UniversityApproval = 'Pendiente' | 'En Revisión' | 'Aprobada' | 'Rechazada';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          wallet_balance: number;
          credit_approved: number;
          diagnosed: boolean;
          suggested_route: string[] | null;
          company_id: string | null;
          university_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          university_id: string;
          title: string;
          description: string | null;
          level: CourseLevel;
          duration: string;
          cost_credits: number;
          skills: string[];
          category: string;
          is_active: boolean;
          prerequisites?: string[] | null;
          required_docs?: string[] | null;
          max_seats?: number | null;
          modality?: string | null;
          start_date?: string | null;
          access_link?: string | null;
          classroom?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      universities: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          email_domain: string | null;
          approval_status: UniversityApproval;
          approved_at: string | null;
          approved_by: string | null;
          legal_nit: string | null;
          contact_email: string;
          total_earnings: number;
          liquid_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['universities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['universities']['Insert']>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          nit: string | null;
          industry: string | null;
          size_employees: number | null;
          contact_name: string;
          contact_email: string;
          wallet_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          profile_id: string | null;
          name: string;
          email: string;
          role_title: string | null;
          department: string | null;
          diag_status: DiagStatus;
          active_path: string[] | null;
          progress_pct: number;
          assigned_budget: number;
          suggested_route_cost: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: EnrollmentStatus;
          enrolled_at: string;
          started_at?: string | null;
          completed_at: string | null;
          certificate_url: string | null;
          credits_spent: number;
        };
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>;
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>;
      };
      passport_stamps: {
        Row: {
          id: string;
          student_id: string;
          university_id: string;
          enroll_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['passport_stamps']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['passport_stamps']['Insert']>;
      };
      skill_badges: {
        Row: {
          id: string;
          student_id: string;
          skill_name: string;
          icon_name: string | null;
          earned_at: string;
        };
        Insert: Omit<Database['public']['Tables']['skill_badges']['Row'], 'id' | 'earned_at'>;
        Update: Partial<Database['public']['Tables']['skill_badges']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          student_id: string;
          goal: string;
          associated_products: string[] | null;
          status: AchievementStatus;
          evidence_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      mentor_sessions: {
        Row: {
          id: string;
          student_id: string;
          mentor_name: string;
          topic: string;
          scheduled_at: string;
          zoom_link: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['mentor_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['mentor_sessions']['Insert']>;
      };
      leads: {
        Row: {
          id: string;
          company_name: string;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          employee_count: number | null;
          message: string | null;
          source: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      wallet_transactions: {
        Row: {
          id: string;
          profile_id: string | null;
          company_id: string | null;
          amount: number;
          type: string;
          description: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['wallet_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['wallet_transactions']['Insert']>;
      };
    };
  };
}
