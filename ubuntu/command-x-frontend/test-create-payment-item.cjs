// Simple Node.js test script to test payment item creation
// Run with: node test-create-payment-item.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://riwruahskjexyamsekgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd3J1YWhza2pleHlhbXNla2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Nzk1ODksImV4cCI6MjA2NDE1NTU4OX0.T1Mnoyh7yPUA8lyrm9x5D5L7euuRGk8ZEFoachfMSpw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreatePaymentItem() {
  try {
    console.log('Testing payment item creation...');
    
    // First get a valid project ID
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .select('project_id, project_name')
      .limit(1);
    
    if (projectError) {
      throw new Error(`Failed to get project: ${projectError.message}`);
    }
    
    if (!projects || projects.length === 0) {
      throw new Error('No projects found');
    }
    
    const project = projects[0];
    console.log('Using project:', project);
    
    // Test data
    const testData = {
      project_id: project.project_id,
      description: 'Test Payment Item from Node.js',
      unit_of_measure: 'each',
      unit_price: 15.75,
      original_quantity: 3,
      status: 'pending'
    };
    
    console.log('Inserting test data:', testData);
    
    // Insert the payment item
    const { data, error } = await supabase
      .from('payment_items')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Insert failed: ${error.message}`);
    }
    
    console.log('✅ Payment item created successfully!');
    console.log('Created item:', data);
    
    // Verify the total_price was calculated correctly
    const expectedTotal = testData.original_quantity * testData.unit_price;
    console.log(`Expected total: ${expectedTotal}, Actual total: ${data.total_price}`);
    
    if (parseFloat(data.total_price) === expectedTotal) {
      console.log('✅ Total price calculation is correct!');
    } else {
      console.log('❌ Total price calculation is incorrect!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCreatePaymentItem();
