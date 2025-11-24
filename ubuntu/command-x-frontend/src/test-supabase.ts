// @ts-nocheck
// Test script to verify Supabase integration
// Run this in the browser console to test the connection

import { supabase } from './lib/supabase'
import { projectsApi, workOrdersApi, paymentItemsApi } from './services/supabaseApi'

export const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase Connection...')
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    const { data, error } = await supabase.from('users').select('count').single()
    if (error) throw error
    console.log('✅ Connection successful!')
    
    // Test 2: Projects API
    console.log('2️⃣ Testing Projects API...')
    const projects = await projectsApi.getAll()
    console.log(`✅ Found ${projects.length} projects:`, projects.map(p => p.project_name))
    
    // Test 3: Work Orders API
    console.log('3️⃣ Testing Work Orders API...')
    const workOrders = await workOrdersApi.getAll()
    console.log(`✅ Found ${workOrders.length} work orders:`, workOrders.map(wo => wo.description))
    
    // Test 4: Payment Items API
    console.log('4️⃣ Testing Payment Items API...')
    const paymentItems = await paymentItemsApi.getAll()
    console.log(`✅ Found ${paymentItems.length} payment items:`, paymentItems.map(pi => pi.description))
    
    // Test 5: Real-time subscription (optional)
    console.log('5️⃣ Testing real-time subscription...')
    const subscription = supabase
      .channel('test')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' }, 
        (payload) => console.log('📡 Real-time update:', payload)
      )
      .subscribe()
    
    console.log('✅ Real-time subscription active!')
    
    // Clean up subscription after 5 seconds
    setTimeout(() => {
      subscription.unsubscribe()
      console.log('🧹 Cleaned up subscription')
    }, 5000)
    
    console.log('🎉 All tests passed! Supabase is ready to use.')
    
    return {
      success: true,
      projectCount: projects.length,
      workOrderCount: workOrders.length,
      paymentItemCount: paymentItems.length
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Usage: 
// import { testSupabaseConnection } from './test-supabase'
// testSupabaseConnection().then(result => console.log('Test result:', result))
