export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface ProjectSubcontractor {
  subcontractor_id: string;
  company_name: string;
  role?: string;
  assigned_date?: string;
}

export interface ProjectData {
  project_id?: string;
  project_name: string;
  location: string;
  client_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: string;
  description?: string;
  progress_percentage?: number;
  priority?: string;
  category?: string;
  manager_id?: string;
  manager_name?: string;
  team_members?: TeamMember[];
  subcontractors?: ProjectSubcontractor[]; // Added for subcontractor assignments
  actual_cost?: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  risk_level?: string;
  budget_utilization?: number;
  total_invoiced?: number;
  total_paid?: number;
  outstanding_balance?: number;
  retainage_held?: number;
  payment_terms?: string;
  contract_number?: string;
  contract_type?: string;
  change_orders_count?: number;
  change_orders_value?: number;
}
