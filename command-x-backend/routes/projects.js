const express = require('express');
const router = express.Router();

// Mock project data for demonstration
let projects = [
  {
    id: 1,
    name: 'Commercial Building A',
    client: 'ABC Corporation',
    location: '123 Main St, Anytown, USA',
    startDate: '2023-01-15',
    endDate: '2023-12-31',
    budget: 1500000,
    status: 'In Progress',
    description: 'Construction of a 5-story commercial building'
  },
  {
    id: 2,
    name: 'Residential Complex',
    client: 'XYZ Developers',
    location: '456 Oak Ave, Somewhere, USA',
    startDate: '2023-03-01',
    endDate: '2024-06-30',
    budget: 3000000,
    status: 'Planning',
    description: 'Development of a 50-unit residential complex'
  }
];

// Get all projects
router.get('/', (req, res) => {
  res.json(projects);
});

// Get project by ID
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(project);
});

// Create new project
router.post('/', (req, res) => {
  const newProject = {
    id: projects.length + 1,
    ...req.body
  };
  
  projects.push(newProject);
  
  res.status(201).json(newProject);
});

// Update project
router.put('/:id', (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id));
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...req.body
  };
  
  res.json(projects[projectIndex]);
});

// Delete project
router.delete('/:id', (req, res) => {
  const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id));
  
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const deletedProject = projects[projectIndex];
  projects = projects.filter(p => p.id !== parseInt(req.params.id));
  
  res.json(deletedProject);
});

module.exports = router;
