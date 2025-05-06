import request from 'supertest';
import { app } from '../server'; // Assuming your Express app is exported from server.ts
import { pool } from '../db'; // Import the pool to potentially clean up test data

// Note: For a real application, you'd want a dedicated test database and setup/teardown logic.
// This is a simplified example.

describe('Auth Endpoints', () => {
  let server: any;

  beforeAll((done) => {
    // Start the server before tests run
    // Ensure the server doesn't log during tests or use a test-specific config
    server = app.listen(0, () => { // Listen on a random available port
        console.log(`Auth Test server running on port ${(server.address() as any).port}`);
        done();
    });
    server.on('error', (err: any) => {
        console.error('Auth Test server failed to start:', err);
        done(err);
    });
  });

  // Corrected async signature for afterAll
  afterAll(async () => {
    // Close the server and database connection after tests
    if (server) {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
    // Pool might be shared, consider closing it in a global teardown if needed
    await pool.end(); // Ensure pool is closed 
    console.log('Auth Test server closed');
  });

  // Clean up test user after each test if needed
  afterEach(async () => {
    try {
        await pool.query("DELETE FROM users WHERE username = 'testuser'");
    } catch (error) {
        // Ignore errors if user doesn't exist
    }
  });

  it('should register a new user', async () => {
    const res = await request(server)
      .post('/api/auth/register') // Ensure this matches your actual route
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'FieldStaff' // Assuming role is required
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('userId');
  });

  it('should not register a user with an existing username', async () => {
    // First, register the user
    await request(server)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'FieldStaff'
      });

    // Then, try to register again with the same username
    const res = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'another@example.com',
        password: 'password123',
        role: 'FieldStaff'
      });
    expect(res.statusCode).toEqual(409); // Changed from 400 to 409 (Conflict)
    // Check for specific error message if your API provides one
    expect(res.body).toHaveProperty('message', 'Username or email already exists.'); // Added period and specific message
  });

  it('should log in an existing user', async () => {
    // Register the user first
    await request(server)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'FieldStaff'
      });

    // Attempt to log in
    const res = await request(server)
      .post('/api/auth/login') // Ensure this matches your actual route
      .send({
        username: 'testuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', 'testuser');
  });

  it('should not log in with incorrect password', async () => {
    // Register the user first
    await request(server)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'FieldStaff'
      });

    // Attempt to log in with wrong password
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401); // Unauthorized
    expect(res.body).toHaveProperty('message', 'Invalid credentials.'); // Added period
  });

   it('should not log in a non-existent user', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send({
        username: 'nonexistentuser',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(401); // Unauthorized or 404 depending on implementation
    expect(res.body).toHaveProperty('message', 'Invalid credentials.'); // Added period
  });

});

