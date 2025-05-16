const express = require('express');
const router = express.Router();

// Mock work order data for demonstration
let workOrders = [
  {
    id: 1,
    projectId: 1,
    title: 'Foundation Work',
    description: 'Excavation and foundation pouring for Building A',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Crew A',
    startDate: '2023-02-01',
    dueDate: '2023-02-15',
    completedDate: null
  },
  {
    id: 2,
    projectId: 1,
    title: 'Framing',
    description: 'Structural framing for Building A',
    status: 'Pending',
    priority: 'Medium',
    assignedTo: 'Crew B',
    startDate: '2023-02-16',
    dueDate: '2023-03-01',
    completedDate: null
  }
];

// Get all work orders
router.get('/', (req, res) => {
  // Filter by project ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  
  if (projectId) {
    const filteredWorkOrders = workOrders.filter(wo => wo.projectId === projectId);
    return res.json(filteredWorkOrders);
  }
  
  res.json(workOrders);
});

// Get work order by ID
router.get('/:id', (req, res) => {
  const workOrder = workOrders.find(wo => wo.id === parseInt(req.params.id));
  
  if (!workOrder) {
    return res.status(404).json({ message: 'Work order not found' });
  }
  
  res.json(workOrder);
});

// Create new work order
router.post('/', (req, res) => {
  const newWorkOrder = {
    id: workOrders.length + 1,
    ...req.body
  };
  
  workOrders.push(newWorkOrder);
  
  res.status(201).json(newWorkOrder);
});

// Update work order
router.put('/:id', (req, res) => {
  const workOrderIndex = workOrders.findIndex(wo => wo.id === parseInt(req.params.id));
  
  if (workOrderIndex === -1) {
    return res.status(404).json({ message: 'Work order not found' });
  }
  
  workOrders[workOrderIndex] = {
    ...workOrders[workOrderIndex],
    ...req.body
  };
  
  res.json(workOrders[workOrderIndex]);
});

// Update work order status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const workOrderIndex = workOrders.findIndex(wo => wo.id === parseInt(req.params.id));
  
  if (workOrderIndex === -1) {
    return res.status(404).json({ message: 'Work order not found' });
  }
  
  workOrders[workOrderIndex].status = status;
  
  // If status is 'Completed', set completedDate to current date
  if (status === 'Completed') {
    workOrders[workOrderIndex].completedDate = new Date().toISOString().split('T')[0];
  }
  
  res.json(workOrders[workOrderIndex]);
});

// Delete work order
router.delete('/:id', (req, res) => {
  const workOrderIndex = workOrders.findIndex(wo => wo.id === parseInt(req.params.id));
  
  if (workOrderIndex === -1) {
    return res.status(404).json({ message: 'Work order not found' });
  }
  
  const deletedWorkOrder = workOrders[workOrderIndex];
  workOrders = workOrders.filter(wo => wo.id !== parseInt(req.params.id));
  
  res.json(deletedWorkOrder);
});

module.exports = router;
