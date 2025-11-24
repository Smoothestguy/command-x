// @ts-nocheck
import { supabase } from "@/lib/supabase";

// Lightweight types (don't rely on generated Database types yet)
export type Worker = {
  worker_id: string;
  first_name: string;
  last_name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  home_address?: string | null;
  position_applying_for?: string | null;
  hire_date?: string | null;
  subcontractor_id?: string | null;
  personal_id_document_id?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

// Extended type for personnel registration
export type PersonnelRegistration = {
  worker_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  home_address: string;
  position_applying_for: string;
  role?: string | null;
  hire_date?: string | null;
  subcontractor_id?: string | null;
  personal_id_document_id?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type TimeEntry = {
  entry_id: string;
  worker_id: string;
  date: string; // ISO date
  hours: number;
  project_id?: string | null;
  work_order_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WorkerWithTotals = Worker & {
  totals: {
    daily: number;
    weekly: number;
    monthly: number;
    overtime: number;
  };
  assignments: {
    projects: number;
    work_orders_assigned: number;
    work_orders_completed: number;
  };
};

const tableWorkers = "workers";
const tableTimeEntries = "time_entries";

export const personnelApi = {
  // Workers
  getWorkers: async (subcontractorId?: string): Promise<Worker[]> => {
    let q = supabase
      .from(tableWorkers)
      .select("*")
      .order("first_name", { ascending: true });
    if (subcontractorId) q = q.eq("subcontractor_id", subcontractorId);
    const { data, error } = await q;
    if (error) throw error;
    return data as Worker[];
  },

  createWorker: async (worker: Omit<Worker, "worker_id">): Promise<Worker> => {
    const { data, error } = await supabase
      .from(tableWorkers)
      .insert(worker)
      .select()
      .single();
    if (error) throw error;
    return data as Worker;
  },

  // Create personnel registration with all required fields
  createPersonnelRegistration: async (
    registration: Omit<PersonnelRegistration, "worker_id">
  ): Promise<Worker> => {
    const { data, error } = await supabase
      .from(tableWorkers)
      .insert({
        ...registration,
        role: registration.position_applying_for, // Set role to position applying for initially
        hire_date: new Date().toISOString(), // Set hire date to today
      })
      .select()
      .single();
    if (error) throw error;
    return data as Worker;
  },

  updateWorker: async (
    id: string,
    updates: Partial<Worker>
  ): Promise<Worker> => {
    const { data, error } = await supabase
      .from(tableWorkers)
      .update(updates)
      .eq("worker_id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Worker;
  },

  deleteWorker: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(tableWorkers)
      .delete()
      .eq("worker_id", id);
    if (error) throw error;
  },

  // Time entries
  getTimeEntriesByWorker: async (
    workerId: string,
    from?: string,
    to?: string
  ): Promise<TimeEntry[]> => {
    let q = supabase
      .from(tableTimeEntries)
      .select("*")
      .eq("worker_id", workerId)
      .order("date", { ascending: false });
    if (from) q = q.gte("date", from);
    if (to) q = q.lte("date", to);
    const { data, error } = await q;
    if (error) throw error;
    return data as TimeEntry[];
  },

  addTimeEntry: async (
    entry: Omit<TimeEntry, "entry_id">
  ): Promise<TimeEntry> => {
    const { data, error } = await supabase
      .from(tableTimeEntries)
      .insert(entry)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  updateTimeEntry: async (
    entryId: string,
    updates: Partial<TimeEntry>
  ): Promise<TimeEntry> => {
    const { data, error } = await supabase
      .from(tableTimeEntries)
      .update(updates)
      .eq("entry_id", entryId)
      .select()
      .single();
    if (error) throw error;
    return data as TimeEntry;
  },

  deleteTimeEntry: async (entryId: string): Promise<void> => {
    const { error } = await supabase
      .from(tableTimeEntries)
      .delete()
      .eq("entry_id", entryId);
    if (error) throw error;
  },

  // Derived metrics using time entries and work orders
  getWorkerMetrics: async (
    workerId: string
  ): Promise<WorkerWithTotals["totals"] & WorkerWithTotals["assignments"]> => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - (day - 1));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const fmt = (d: Date) => d.toISOString();
    const [dailyEntries, weeklyEntries, monthlyEntries] = await Promise.all([
      personnelApi.getTimeEntriesByWorker(workerId, fmt(startOfDay)),
      personnelApi.getTimeEntriesByWorker(workerId, fmt(startOfWeek)),
      personnelApi.getTimeEntriesByWorker(workerId, fmt(startOfMonth)),
    ]);

    const sum = (arr: TimeEntry[]) =>
      arr.reduce((acc, e) => acc + (e.hours || 0), 0);

    // Overtime: per-day totals above 8
    const mapByDate = new Map<string, number>();
    weeklyEntries.forEach((e) => {
      const key = e.date.slice(0, 10);
      mapByDate.set(key, (mapByDate.get(key) || 0) + (e.hours || 0));
    });
    let overtime = 0;
    mapByDate.forEach((v) => {
      if (v > 8) overtime += v - 8;
    });

    // Assignments via time entries -> distinct project/work_order
    const projectSet = new Set<string>();
    const workOrderIds = new Set<string>();
    monthlyEntries.forEach((e) => {
      if (e.project_id) projectSet.add(e.project_id);
      if (e.work_order_id) workOrderIds.add(e.work_order_id);
    });

    let completed = 0;
    if (workOrderIds.size > 0) {
      const { data: wos, error } = await supabase
        .from("work_orders")
        .select("work_order_id,status")
        .in("work_order_id", Array.from(workOrderIds));
      if (error) console.warn("work order fetch error:", error.message);
      else
        completed = (wos || []).filter(
          (w: any) => w.status === "Completed"
        ).length;
    }

    return {
      daily: Number(sum(dailyEntries).toFixed(2)),
      weekly: Number(sum(weeklyEntries).toFixed(2)),
      monthly: Number(sum(monthlyEntries).toFixed(2)),
      overtime: Number(overtime.toFixed(2)),
      projects: projectSet.size,
      work_orders_assigned: workOrderIds.size,
      work_orders_completed: completed,
    };
  },
};
