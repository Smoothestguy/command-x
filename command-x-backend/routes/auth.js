const express = require('express');
const router = express.Router();

// Mock user data for demonstration
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'user' }
];

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // In a real app, you would generate a JWT token here
  const token = 'mock-jwt-token';
  
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    token
  });
});

// Register route
router.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  
  // Check if username already exists
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username,
    password,
    role: role || 'user'
  };
  
  // In a real app, you would save to database here
  users.push(newUser);
  
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    }
  });
});

module.exports = router;
