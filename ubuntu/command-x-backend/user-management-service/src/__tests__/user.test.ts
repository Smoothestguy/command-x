import request from 'supertest';
import { app } from '../server'; // Adjust path as needed
import { pool } from '../db'; // Adjust path as needed
import jwt from 'jsonwebtoken'; // Import jwt
import { config } from '../config'; // Import config for JWT secret

// Run tests sequentially to ensure testUserId is set before dependent tests
describe('User CRUD Endpoints', () => {
  let server: any;
  let authToken: string; // To store the auth token for protected routes
  let testUserId: number | null = null; // Initialize to null

  beforeAll(async () => {
    // Start server
    await new Promise<void>((resolve, reject) => {
        server = app.listen(0, async () => {
            const port = (server.address() as any).port;
            console.log(`User CRUD Test server running on port ${port}`);
            
            // Register and login a test admin user to get a token
            try {
                // Ensure clean state
                await pool.query("DELETE FROM users WHERE username = 'testadmin'");
                await pool.query("DELETE FROM users WHERE username = 'cruduser'"); // Also clean cruduser initially
                
                const registerRes = await request(server)
                    .post('/api/auth/register')
                    .send({
                        username: 'testadmin',
                        email: 'admin@test.com',
                        password: 'password123',
                        role: 'Admin' // Ensure Admin role is correctly cased
                    });
                
                if (registerRes.statusCode !== 201) {
                    throw new Error(`Admin registration failed: ${registerRes.statusCode} ${JSON.stringify(registerRes.body)}`);
                }

                const loginRes = await request(server)
                    .post('/api/auth/login')
                    .send({
                        username: 'testadmin',
                        password: 'password123'
                    });

                if (loginRes.body.token) {
                    authToken = loginRes.body.token;
                    console.log('Auth token obtained for tests.');
                    // Decode token to verify role
                    try {
                        const decoded: any = jwt.verify(authToken, config.jwtSecret);
                        console.log('Decoded token user role:', decoded.role);
                        if (decoded.role !== 'Admin') {
                            throw new Error(`Token role mismatch: Expected 'Admin', got '${decoded.role}'`);
                        }
                    } catch (jwtError) {
                        throw new Error(`Failed to verify token or role: ${jwtError}`);
                    }
                } else {
                    throw new Error(`Failed to obtain auth token for tests: ${loginRes.statusCode} ${JSON.stringify(loginRes.body)}`);
                }
                resolve();
            } catch (err) {
                console.error('Setup failed:', err);
                reject(err);
            }
        });
        server.on('error', (err: any) => {
            console.error('Test server failed to start:', err);
            reject(err);
        });
    });
  });

  afterAll(async () => {
    // Clean up test admin user and close server/pool
    try {
        await pool.query("DELETE FROM users WHERE username = 'testadmin'");
        if (testUserId) { // Only delete if ID was set
            await pool.query("DELETE FROM users WHERE user_id = $1", [testUserId]);
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
    
    if (server) {
        await new Promise<void>(resolve => server.close(() => resolve()));
    }
    await pool.end(); 
    console.log('User CRUD Test server closed');
  });

  // Test order matters here if we rely on testUserId propagation
  // Use .serial() or structure tests to ensure order if needed, or create user in each test

  it('1. should create a new user', async () => {
    const res = await request(server)
      .post('/api/users') 
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        username: 'cruduser',
        email: 'crud@test.com',
        password: 'password123',
        role: 'FieldStaff',
        status: 'Active'
      });
    if (res.statusCode !== 201) {
        console.error('Create user failed:', res.statusCode, res.body);
    }
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
    expect(res.body).toHaveProperty('userId');
    testUserId = res.body.userId; 
    expect(testUserId).toBeDefined(); 
    console.log(`Created user with ID: ${testUserId}`); 
  });

  it('2. should get all users', async () => {
    expect(testUserId).toBeDefined(); // Ensure previous test set the ID

    const res = await request(server)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((user: any) => user.username === 'cruduser')).toBe(true);
    expect(res.body.some((user: any) => user.username === 'testadmin')).toBe(true);
  });

  it('3. should get a specific user by ID', async () => {
     expect(testUserId).toBeDefined();
     
    const res = await request(server)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user_id', testUserId);
    expect(res.body).toHaveProperty('username', 'cruduser');
  });

  it('4. should update a user', async () => {
    expect(testUserId).toBeDefined();

    const res = await request(server)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'updatedcrud@test.com',
        status: 'Inactive'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');

    // Verify the update
    const verifyRes = await request(server)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verifyRes.body.email).toEqual('updatedcrud@test.com');
    expect(verifyRes.body.status).toEqual('Inactive');
  });

  it('5. should delete a user', async () => {
    expect(testUserId).toBeDefined();

    const res = await request(server)
      .delete(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(res.statusCode).toEqual(200); 
    expect(res.body).toHaveProperty('message', 'User deleted successfully');

    // Verify deletion by trying to get the user again
    const verifyRes = await request(server)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);
    // Since the user is deleted, the controller should return 404
    expect(verifyRes.statusCode).toEqual(404); 
    testUserId = null; // Reset ID after deletion
  });

  it('6. should return 404 for non-existent user ID on GET', async () => {
    const nonExistentId = 999999;
    const res = await request(server)
      .get(`/api/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);
    // The authorizeRole middleware passes (Admin role), so the controller's 404 should be hit
    expect(res.statusCode).toEqual(404); // Changed from 403 back to 404
  });

  it('7. should return 401 if no auth token is provided for protected routes', async () => {
    const res = await request(server).get('/api/users');
    expect(res.statusCode).toEqual(401);
  });

});

