# 📋 COPY-PASTE SQL TO SUPABASE

## 🎯 QUICK INSTRUCTIONS

1. Go to: https://app.supabase.com
2. Select: **Command-X Construction** project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. **Copy everything below** (from "-- Enable UUID" to the last SELECT)
6. **Paste** into Supabase SQL editor
7. Click: **Run** button
8. Wait for: "Database setup complete!" message

---

## 📋 COPY THIS ENTIRE SQL BLOCK

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
  worker_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  home_address TEXT,
  position_applying_for VARCHAR(100),
  role VARCHAR(100),
  hire_date DATE,
  subcontractor_id UUID,
  personal_id_document_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.workers(worker_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  project_id UUID,
  work_order_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_email ON public.workers(email);
CREATE INDEX IF NOT EXISTS idx_time_entries_worker ON public.time_entries(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);

-- Disable RLS for testing
ALTER TABLE public.workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries DISABLE ROW LEVEL SECURITY;

-- Insert sample data
INSERT INTO public.workers (first_name, last_name, email, phone, home_address, position_applying_for, role, is_active) VALUES
('John', 'Smith', 'john.smith@example.com', '555-0101', '123 Main St', 'Construction Worker', 'Field Worker', true),
('Maria', 'Garcia', 'maria.garcia@example.com', '555-0102', '456 Oak Ave', 'Electrician', 'Electrician', true),
('David', 'Johnson', 'david.johnson@example.com', '555-0103', '789 Pine Rd', 'Plumber', 'Plumber', true)
ON CONFLICT (email) DO NOTHING;

SELECT 'Database setup complete!' as status;
```

---

## ✅ WHAT THIS SQL DOES

1. ✅ Creates `workers` table
2. ✅ Creates `time_entries` table
3. ✅ Adds performance indexes
4. ✅ Disables RLS (for testing)
5. ✅ Inserts 3 sample workers
6. ✅ Shows success message

---

## 🎯 AFTER RUNNING SQL

1. **Refresh browser**: http://localhost:5173/personnel
2. **You should see**: 3 workers (John, Maria, David)
3. **Buttons should work**: Add Worker, Time Tracking, CSV Import

---

## 🆘 IF IT DOESN'T WORK

**Check 1: Did you see "Database setup complete!" message?**
- If YES: Database is set up ✅
- If NO: Check for error messages in red

**Check 2: Are workers showing on Personnel page?**
- If YES: Everything works! ✅
- If NO: Refresh browser (F5)

**Check 3: Still not working?**
- Open browser console (F12)
- Look for error messages
- Check Supabase connection

---

## 📞 NEED HELP?

If you get an error:
1. Copy the error message
2. Check if it mentions "already exists" (that's OK, just means tables exist)
3. Try running the SQL again
4. If still stuck, check GET_WORKING_NOW.md for troubleshooting

---

## ✨ YOU'RE DONE!

Once you run this SQL, your Personnel page will be fully functional with:
- ✅ Worker list
- ✅ Add Worker button
- ✅ Time Tracking
- ✅ CSV Import/Export
- ✅ Real data in Supabase

**Let's go! 🚀**

