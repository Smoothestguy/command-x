import { query } from './db';

async function testSubcontractorsTable() {
    try {
        console.log('Testing subcontractors table...');
        
        // Check if table exists
        const tableCheck = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'subcontractors'
            );
        `);
        
        console.log('Table exists:', tableCheck.rows[0].exists);
        
        if (tableCheck.rows[0].exists) {
            // Check table structure
            const columns = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'subcontractors';
            `);
            
            console.log('Table columns:', columns.rows);
        }
    } catch (error) {
        console.error('Error testing subcontractors table:', error);
    }
}

testSubcontractorsTable();
