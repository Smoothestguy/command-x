import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Add SSL configuration if required for production database
  // ssl: {
  //   rejectUnauthorized: false // Adjust based on your security requirements
  // }
});

// Export the pool for testing purposes
export { pool };

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Optional: Add a function to test the connection
export const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err);
    // Don't exit in test environment
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1); // Exit if DB connection fails on startup (outside tests)
    }
  }
};

