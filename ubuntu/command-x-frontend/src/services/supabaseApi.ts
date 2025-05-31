import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'

type Tables = Database['public']['Tables']

// Projects API
export const projectsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users:created_by(first_name, last_name)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        users:created_by(first_name, last_name),
        work_orders(count),
        payment_items(count)
      `)
      .eq('project_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (project: Tables['projects']['Insert']) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Tables['projects']['Update']) => {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('project_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('project_id', id)
    
    if (error) throw error
  }
}

// Work Orders API
export const workOrdersApi = {
  getAll: async (projectId?: string) => {
    let query = supabase
      .from('work_orders')
      .select(`
        *,
        projects(project_name),
        subcontractors(company_name, primary_contact_name),
        users:created_by(first_name, last_name)
      `)
    
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        projects(project_name, location),
        subcontractors(company_name, primary_contact_name, email, phone_number),
        users:created_by(first_name, last_name),
        line_items(*),
        contractor_assignments(
          *,
          subcontractors(company_name, primary_contact_name)
        )
      `)
      .eq('work_order_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (workOrder: Tables['work_orders']['Insert']) => {
    const { data, error } = await supabase
      .from('work_orders')
      .insert(workOrder)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Tables['work_orders']['Update']) => {
    const { data, error } = await supabase
      .from('work_orders')
      .update(updates)
      .eq('work_order_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('work_order_id', id)
    
    if (error) throw error
  }
}

// Payment Items API
export const paymentItemsApi = {
  getAll: async (projectId?: string) => {
    let query = supabase
      .from('payment_items')
      .select(`
        *,
        projects(project_name),
        work_orders(description),
        locations(name),
        vendors(name),
        users:created_by(first_name, last_name)
      `)
    
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('payment_items')
      .select(`
        *,
        projects(project_name),
        work_orders(description),
        locations(name),
        vendors(name, contact_name, email, phone)
      `)
      .eq('item_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (paymentItem: Tables['payment_items']['Insert']) => {
    const { data, error } = await supabase
      .from('payment_items')
      .insert(paymentItem)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Tables['payment_items']['Update']) => {
    const { data, error } = await supabase
      .from('payment_items')
      .update(updates)
      .eq('item_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('payment_items')
      .delete()
      .eq('item_id', id)
    
    if (error) throw error
  },

  getByCategory: async (projectId: string, category?: string) => {
    let query = supabase
      .from('payment_items')
      .select(`
        *,
        locations(name),
        vendors(name)
      `)
      .eq('project_id', projectId)
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query.order('category', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Subcontractors API
export const subcontractorsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .order('company_name', { ascending: true })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('subcontractor_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (subcontractor: Tables['subcontractors']['Insert']) => {
    const { data, error } = await supabase
      .from('subcontractors')
      .insert(subcontractor)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Tables['subcontractors']['Update']) => {
    const { data, error } = await supabase
      .from('subcontractors')
      .update(updates)
      .eq('subcontractor_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('subcontractors')
      .delete()
      .eq('subcontractor_id', id)
    
    if (error) throw error
  }
}

// Vendors API
export const vendorsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (vendor: Tables['vendors']['Insert']) => {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: string, updates: Tables['vendors']['Update']) => {
    const { data, error } = await supabase
      .from('vendors')
      .update(updates)
      .eq('vendor_id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('vendor_id', id)
    
    if (error) throw error
  }
}

// Locations API
export const locationsApi = {
  getByProject: async (projectId: string) => {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  create: async (location: Tables['locations']['Insert']) => {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}
