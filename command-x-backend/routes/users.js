const express = require('express');
const router = express.Router();

// Mock user data for demonstration
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@commandx.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    active: true
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@commandx.com',
    firstName: 'Project',
    lastName: 'Manager',
    role: 'manager',
    active: true
  },
  {
    id: 3,
    username: 'user',
    email: 'user@commandx.com',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
    active: true
  }
];

// Get all users
router.get('/', (req, res) => {
  // Don't return password field
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Don't return password field
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// Create new user
router.post('/', (req, res) => {
  const { username, email } = req.body;
  
  // Check if username or email already exists
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    active: true, // Default to active
    ...req.body
  };
  
  users.push(newUser);
  
  // Don't return password field
  const { password, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// Update user
router.put('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if username or email already exists (if being updated)
  if (req.body.username && req.body.username !== users[userIndex].username) {
    if (users.some(u => u.username === req.body.username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }
  }
  
  if (req.body.email && req.body.email !== users[userIndex].email) {
    if (users.some(u => u.email === req.body.email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...req.body
  };
  
  // Don't return password field
  const { password, ...safeUser } = users[userIndex];
  res.json(safeUser);
});

// Delete user (soft delete by setting active to false)
router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Soft delete by setting active to false
  users[userIndex].active = false;
  
  // Don't return password field
  const { password, ...safeUser } = users[userIndex];
  res.json(safeUser);
});

module.exports = router;
