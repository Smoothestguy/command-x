const express = require('express');
const router = express.Router();

// Mock subcontractor data for demonstration
let subcontractors = [
  {
    id: 1,
    name: 'ABC Electrical',
    contactPerson: 'John Smith',
    email: 'john@abcelectrical.com',
    phone: '555-123-4567',
    specialty: 'Electrical',
    rating: 4.5,
    active: true
  },
  {
    id: 2,
    name: 'XYZ Plumbing',
    contactPerson: 'Jane Doe',
    email: 'jane@xyzplumbing.com',
    phone: '555-987-6543',
    specialty: 'Plumbing',
    rating: 4.2,
    active: true
  }
];

// Get all subcontractors
router.get('/', (req, res) => {
  // Filter by active status if provided
  const activeOnly = req.query.active === 'true';
  
  if (activeOnly) {
    const activeSubcontractors = subcontractors.filter(s => s.active);
    return res.json(activeSubcontractors);
  }
  
  res.json(subcontractors);
});

// Get subcontractor by ID
router.get('/:id', (req, res) => {
  const subcontractor = subcontractors.find(s => s.id === parseInt(req.params.id));
  
  if (!subcontractor) {
    return res.status(404).json({ message: 'Subcontractor not found' });
  }
  
  res.json(subcontractor);
});

// Create new subcontractor
router.post('/', (req, res) => {
  const newSubcontractor = {
    id: subcontractors.length + 1,
    active: true, // Default to active
    ...req.body
  };
  
  subcontractors.push(newSubcontractor);
  
  res.status(201).json(newSubcontractor);
});

// Update subcontractor
router.put('/:id', (req, res) => {
  const subcontractorIndex = subcontractors.findIndex(s => s.id === parseInt(req.params.id));
  
  if (subcontractorIndex === -1) {
    return res.status(404).json({ message: 'Subcontractor not found' });
  }
  
  subcontractors[subcontractorIndex] = {
    ...subcontractors[subcontractorIndex],
    ...req.body
  };
  
  res.json(subcontractors[subcontractorIndex]);
});

// Delete subcontractor (soft delete by setting active to false)
router.delete('/:id', (req, res) => {
  const subcontractorIndex = subcontractors.findIndex(s => s.id === parseInt(req.params.id));
  
  if (subcontractorIndex === -1) {
    return res.status(404).json({ message: 'Subcontractor not found' });
  }
  
  // Soft delete by setting active to false
  subcontractors[subcontractorIndex].active = false;
  
  res.json(subcontractors[subcontractorIndex]);
});

module.exports = router;
