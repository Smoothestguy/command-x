const express = require('express');
const router = express.Router();

// Mock crew data for demonstration
let crews = [
  {
    id: 1,
    name: 'Crew A',
    leader: 'Michael Johnson',
    members: ['John Doe', 'Jane Smith', 'Robert Brown'],
    specialty: 'Foundation',
    projectId: 1,
    active: true
  },
  {
    id: 2,
    name: 'Crew B',
    leader: 'Sarah Williams',
    members: ['David Jones', 'Emily Davis', 'James Wilson'],
    specialty: 'Framing',
    projectId: 1,
    active: true
  }
];

// Get all crews
router.get('/', (req, res) => {
  // Filter by project ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  
  if (projectId) {
    const filteredCrews = crews.filter(c => c.projectId === projectId);
    return res.json(filteredCrews);
  }
  
  res.json(crews);
});

// Get crew by ID
router.get('/:id', (req, res) => {
  const crew = crews.find(c => c.id === parseInt(req.params.id));
  
  if (!crew) {
    return res.status(404).json({ message: 'Crew not found' });
  }
  
  res.json(crew);
});

// Create new crew
router.post('/', (req, res) => {
  const newCrew = {
    id: crews.length + 1,
    active: true, // Default to active
    ...req.body
  };
  
  crews.push(newCrew);
  
  res.status(201).json(newCrew);
});

// Update crew
router.put('/:id', (req, res) => {
  const crewIndex = crews.findIndex(c => c.id === parseInt(req.params.id));
  
  if (crewIndex === -1) {
    return res.status(404).json({ message: 'Crew not found' });
  }
  
  crews[crewIndex] = {
    ...crews[crewIndex],
    ...req.body
  };
  
  res.json(crews[crewIndex]);
});

// Delete crew (soft delete by setting active to false)
router.delete('/:id', (req, res) => {
  const crewIndex = crews.findIndex(c => c.id === parseInt(req.params.id));
  
  if (crewIndex === -1) {
    return res.status(404).json({ message: 'Crew not found' });
  }
  
  // Soft delete by setting active to false
  crews[crewIndex].active = false;
  
  res.json(crews[crewIndex]);
});

module.exports = router;
