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
      users: {
        Row: {
          user_id: string
          auth_user_id: string | null
          username: string | null
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          auth_user_id?: string | null
          username?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          auth_user_id?: string | null
          username?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          project_id: string
          project_name: string
          location: string | null
          client_name: string | null
          start_date: string | null
          end_date: string | null
          budget: number | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id?: string
          project_name: string
          location?: string | null
          client_name?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          project_name?: string
          location?: string | null
          client_name?: string | null
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          work_order_id: string
          project_id: string
          assigned_subcontractor_id: string | null
          description: string
          status: 'Pending' | 'Assigned' | 'Started' | 'In Progress' | 'Quality Check' | 'Completed' | 'Cancelled'
          scheduled_date: string | null
          completion_date: string | null
          estimated_cost: number | null
          actual_cost: number | null
          retainage_percentage: number
          amount_billed: number
          amount_paid: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          work_order_id?: string
          project_id: string
          assigned_subcontractor_id?: string | null
          description: string
          status?: 'Pending' | 'Assigned' | 'Started' | 'In Progress' | 'Quality Check' | 'Completed' | 'Cancelled'
          scheduled_date?: string | null
          completion_date?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          retainage_percentage?: number
          amount_billed?: number
          amount_paid?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_order_id?: string
          project_id?: string
          assigned_subcontractor_id?: string | null
          description?: string
          status?: 'Pending' | 'Assigned' | 'Started' | 'In Progress' | 'Quality Check' | 'Completed' | 'Cancelled'
          scheduled_date?: string | null
          completion_date?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          retainage_percentage?: number
          amount_billed?: number
          amount_paid?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subcontractors: {
        Row: {
          subcontractor_id: string
          company_name: string
          address: string | null
          phone_number: string | null
          email: string | null
          primary_contact_name: string | null
          primary_contact_email: string | null
          primary_contact_phone: string | null
          performance_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          subcontractor_id?: string
          company_name: string
          address?: string | null
          phone_number?: string | null
          email?: string | null
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          primary_contact_phone?: string | null
          performance_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          subcontractor_id?: string
          company_name?: string
          address?: string | null
          phone_number?: string | null
          email?: string | null
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          primary_contact_phone?: string | null
          performance_rating?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          vendor_id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          payment_terms: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          vendor_id?: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          vendor_id?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          location_id: string
          project_id: string
          parent_location_id: string | null
          name: string
          description: string | null
          location_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          location_id?: string
          project_id: string
          parent_location_id?: string | null
          name: string
          description?: string | null
          location_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          location_id?: string
          project_id?: string
          parent_location_id?: string | null
          name?: string
          description?: string | null
          location_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_items: {
        Row: {
          item_id: string
          project_id: string
          work_order_id: string | null
          location_id: string | null
          description: string
          item_code: string | null
          unit_of_measure: string
          unit_price: number
          original_quantity: number
          actual_quantity: number | null
          total_price: number
          actual_total_price: number
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          qc_approval_status: 'pending' | 'approved' | 'rejected'
          supervisor_approval_status: 'pending' | 'approved' | 'rejected'
          accountant_approval_status: 'pending' | 'approved' | 'rejected'
          notes: string | null
          category: string | null
          specifications: string | null
          vendor_id: string | null
          purchase_order_id: string | null
          balance: number | null
          received_quantity: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          item_id?: string
          project_id: string
          work_order_id?: string | null
          location_id?: string | null
          description: string
          item_code?: string | null
          unit_of_measure: string
          unit_price: number
          original_quantity: number
          actual_quantity?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          qc_approval_status?: 'pending' | 'approved' | 'rejected'
          supervisor_approval_status?: 'pending' | 'approved' | 'rejected'
          accountant_approval_status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          category?: string | null
          specifications?: string | null
          vendor_id?: string | null
          purchase_order_id?: string | null
          balance?: number | null
          received_quantity?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          item_id?: string
          project_id?: string
          work_order_id?: string | null
          location_id?: string | null
          description?: string
          item_code?: string | null
          unit_of_measure?: string
          unit_price?: number
          original_quantity?: number
          actual_quantity?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          qc_approval_status?: 'pending' | 'approved' | 'rejected'
          supervisor_approval_status?: 'pending' | 'approved' | 'rejected'
          accountant_approval_status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          category?: string | null
          specifications?: string | null
          vendor_id?: string | null
          purchase_order_id?: string | null
          balance?: number | null
          received_quantity?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      work_order_status: 'Pending' | 'Assigned' | 'Started' | 'In Progress' | 'Quality Check' | 'Completed' | 'Cancelled'
      line_item_status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
      payment_item_status: 'pending' | 'approved' | 'rejected' | 'completed'
      approval_status: 'pending' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
