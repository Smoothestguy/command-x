import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Auth helper functions
export const signUp = async (
  email: string,
  password: string,
  userData: any
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (data.user && !error) {
    // Create user profile in public.users table
    const { error: profileError } = await supabase.from("users").insert({
      auth_user_id: data.user.id,
      email: data.user.email!,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      role: userData.role || "user",
    });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
    }
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Get user profile from public.users table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    return { user, profile };
  }

  return { user: null, profile: null };
};

// Real-time subscriptions
export const subscribeToProjects = (callback: (payload: any) => void) => {
  return supabase
    .channel("projects")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      callback
    )
    .subscribe();
};

export const subscribeToWorkOrders = (
  projectId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel("work_orders")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "work_orders",
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToPaymentItems = (
  projectId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel("payment_items")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "payment_items",
        filter: `project_id=eq.${projectId}`,
      },
      callback
    )
    .subscribe();
};
