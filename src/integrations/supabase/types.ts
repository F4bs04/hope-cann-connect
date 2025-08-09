export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_balances: {
        Row: {
          balance: number
          id: string
          last_updated: string
          user_id: string
        }
        Insert: {
          balance?: number
          id?: string
          last_updated?: string
          user_id: string
        }
        Update: {
          balance?: number
          id?: string
          last_updated?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      active_chats: {
        Row: {
          appointment_id: string | null
          created_at: string
          doctor_id: string
          ends_at: string
          id: string
          is_active: boolean
          patient_id: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          doctor_id: string
          ends_at: string
          id?: string
          is_active?: boolean
          patient_id: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          patient_id?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_chats_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_chats_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_chats_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "active_chats_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          clinic_id: string | null
          consultation_type: Database["public"]["Enums"]["consultation_type"]
          created_at: string
          doctor_id: string
          fee: number | null
          id: string
          notes: string | null
          patient_id: string
          payment_status: string | null
          reason: string
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          doctor_id: string
          fee?: number | null
          id?: string
          notes?: string | null
          patient_id: string
          payment_status?: string | null
          reason: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          consultation_type?: Database["public"]["Enums"]["consultation_type"]
          created_at?: string
          doctor_id?: string
          fee?: number | null
          id?: string
          notes?: string | null
          patient_id?: string
          payment_status?: string | null
          reason?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      cannabis_products: {
        Row: {
          cbd_concentration: number | null
          created_at: string
          default_dosage: string | null
          description: string | null
          id: string
          is_active: boolean
          manufacturer: string
          name: string
          product_type: string
          thc_concentration: number | null
          updated_at: string
        }
        Insert: {
          cbd_concentration?: number | null
          created_at?: string
          default_dosage?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          manufacturer: string
          name: string
          product_type: string
          thc_concentration?: number | null
          updated_at?: string
        }
        Update: {
          cbd_concentration?: number | null
          created_at?: string
          default_dosage?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          manufacturer?: string
          name?: string
          product_type?: string
          thc_concentration?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_read: boolean
          message: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "active_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string
          cnpj: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          cnpj: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          cnpj?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_patients: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: Database["public"]["Enums"]["day_of_week"]
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["day_of_week"]
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          approved_at: string | null
          biography: string | null
          clinic_id: string | null
          consultation_fee: number | null
          cpf: string
          created_at: string
          crm: string
          id: string
          is_approved: boolean
          is_available: boolean
          is_suspended: boolean
          specialty: string
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          biography?: string | null
          clinic_id?: string | null
          consultation_fee?: number | null
          cpf: string
          created_at?: string
          crm: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          is_suspended?: boolean
          specialty: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          biography?: string | null
          clinic_id?: string | null
          consultation_fee?: number | null
          cpf?: string
          created_at?: string
          crm?: string
          id?: string
          is_approved?: boolean
          is_available?: boolean
          is_suspended?: boolean
          specialty?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          doctor_id: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_bucket: string | null
          file_path: string | null
          id: string
          is_signed: boolean
          issued_at: string
          patient_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          doctor_id?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: string
          is_signed?: boolean
          issued_at?: string
          patient_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          doctor_id?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_bucket?: string | null
          file_path?: string | null
          id?: string
          is_signed?: boolean
          issued_at?: string
          patient_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_templates: {
        Row: {
          created_at: string
          doctor_id: string
          exam_name: string
          id: string
          instructions: string | null
          justification: string | null
          name: string
          priority: string | null
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          doctor_id: string
          exam_name: string
          id?: string
          instructions?: string | null
          justification?: string | null
          name: string
          priority?: string | null
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          doctor_id?: string
          exam_name?: string
          id?: string
          instructions?: string | null
          justification?: string | null
          name?: string
          priority?: string | null
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          description: string
          doctor_id: string | null
          id: string
          patient_id: string | null
          processed_at: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          description: string
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          processed_at?: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          description?: string
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          processed_at?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          appointment_id: string | null
          assessment: string | null
          chief_complaint: string | null
          created_at: string
          current_medications: string | null
          diagnosis: string | null
          doctor_id: string
          family_history: string | null
          history_present_illness: string | null
          id: string
          lifestyle_habits: string | null
          notes: string | null
          past_medical_history: string | null
          patient_id: string
          physical_examination: string | null
          plan: string | null
          symptoms: string | null
          treatment: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          current_medications?: string | null
          diagnosis?: string | null
          doctor_id: string
          family_history?: string | null
          history_present_illness?: string | null
          id?: string
          lifestyle_habits?: string | null
          notes?: string | null
          past_medical_history?: string | null
          patient_id: string
          physical_examination?: string | null
          plan?: string | null
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assessment?: string | null
          chief_complaint?: string | null
          created_at?: string
          current_medications?: string | null
          diagnosis?: string | null
          doctor_id?: string
          family_history?: string | null
          history_present_illness?: string | null
          id?: string
          lifestyle_habits?: string | null
          notes?: string | null
          past_medical_history?: string | null
          patient_id?: string
          physical_examination?: string | null
          plan?: string | null
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          birth_date: string
          cpf: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          gender: string | null
          id: string
          medical_condition: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_date: string
          cpf?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_condition?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string
          cpf?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          medical_condition?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          pagarme_transaction_id: string | null
          payment_data: Json | null
          payment_method: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pagarme_transaction_id?: string | null
          payment_data?: Json | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          pagarme_transaction_id?: string | null
          payment_data?: Json | null
          payment_method?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          arquivo_pdf: string | null
          created_at: string
          data_validade: string | null
          doctor_id: string
          dosage: string
          duration: string
          expires_at: string | null
          file_path: string | null
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean
          issued_at: string
          medicamento: string | null
          medication_name: string
          notes: string | null
          observacoes: string | null
          patient_id: string
          posologia: string | null
          product_id: string | null
          status: string | null
          updated_at: string
          verification_code: string
        }
        Insert: {
          appointment_id?: string | null
          arquivo_pdf?: string | null
          created_at?: string
          data_validade?: string | null
          doctor_id: string
          dosage: string
          duration: string
          expires_at?: string | null
          file_path?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          issued_at?: string
          medicamento?: string | null
          medication_name: string
          notes?: string | null
          observacoes?: string | null
          patient_id: string
          posologia?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
          verification_code: string
        }
        Update: {
          appointment_id?: string | null
          arquivo_pdf?: string | null
          created_at?: string
          data_validade?: string | null
          doctor_id?: string
          dosage?: string
          duration?: string
          expires_at?: string | null
          file_path?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          issued_at?: string
          medicamento?: string | null
          medication_name?: string
          notes?: string | null
          observacoes?: string | null
          patient_id?: string
          posologia?: string | null
          product_id?: string | null
          status?: string | null
          updated_at?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_doctors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "cannabis_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_doctors_public: {
        Row: {
          consultation_fee: number | null
          doctor_name: string | null
          id: string | null
          is_approved: boolean | null
          is_available: boolean | null
          price_cents: number | null
          specialty: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_patient_data: {
        Args: { patient_user_id: string }
        Returns: boolean
      }
      delete_all_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_authenticated_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_doctor_available: {
        Args:
          | {
              p_doctor_id: string
              p_scheduled_at: string
              p_appointment_id?: string
            }
          | { p_medico_id: number; p_data_hora: string; p_consulta_id?: number }
        Returns: boolean
      }
      rpc_slots_available: {
        Args: {
          p_doctor: string
          p_from: string
          p_to: string
          p_slot_minutes?: number
          p_step_minutes?: number
          p_tz?: string
        }
        Returns: {
          slot_start: string
          slot_end: string
        }[]
      }
      verificar_chats_expirados: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_clinic_password: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
      verify_user_password: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
      verify_user_password_v2: {
        Args: { p_email: string; p_password: string }
        Returns: {
          user_id: number
          user_type: string
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      consultation_type:
        | "in_person"
        | "telemedicine"
        | "follow_up"
        | "emergency"
      day_of_week:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
      document_type:
        | "prescription"
        | "certificate"
        | "medical_report"
        | "exam_request"
        | "medical_record"
      transaction_type: "credit" | "debit" | "fee" | "refund"
      user_role: "patient" | "doctor" | "clinic_admin" | "system_admin"
      user_type: "administrador" | "medico" | "paciente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      consultation_type: [
        "in_person",
        "telemedicine",
        "follow_up",
        "emergency",
      ],
      day_of_week: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      document_type: [
        "prescription",
        "certificate",
        "medical_report",
        "exam_request",
        "medical_record",
      ],
      transaction_type: ["credit", "debit", "fee", "refund"],
      user_role: ["patient", "doctor", "clinic_admin", "system_admin"],
      user_type: ["administrador", "medico", "paciente"],
    },
  },
} as const
