const express = require('express');
const router = express.Router();

// Mock change order data for demonstration
let changeOrders = [
  {
    id: 1,
    workOrderId: 1,
    projectId: 1,
    title: 'Additional Foundation Work',
    description: 'Extended foundation footprint by 10%',
    requestedBy: 'Client',
    requestDate: '2023-02-10',
    status: 'Approved',
    approvedBy: 'Project Manager',
    approvalDate: '2023-02-12',
    costImpact: 2500.00,
    scheduleImpact: 3 // days
  },
  {
    id: 2,
    workOrderId: 1,
    projectId: 1,
    title: 'Material Upgrade',
    description: 'Upgrade to premium concrete mix',
    requestedBy: 'Project Manager',
    requestDate: '2023-02-15',
    status: 'Pending',
    approvedBy: null,
    approvalDate: null,
    costImpact: 1800.00,
    scheduleImpact: 0 // days
  }
];

// Get all change orders
router.get('/', (req, res) => {
  // Filter by project ID or work order ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  const workOrderId = req.query.workOrderId ? parseInt(req.query.workOrderId) : null;
  
  if (projectId) {
    const filteredChangeOrders = changeOrders.filter(co => co.projectId === projectId);
    return res.json(filteredChangeOrders);
  }
  
  if (workOrderId) {
    const filteredChangeOrders = changeOrders.filter(co => co.workOrderId === workOrderId);
    return res.json(filteredChangeOrders);
  }
  
  res.json(changeOrders);
});

// Get change order by ID
router.get('/:id', (req, res) => {
  const changeOrder = changeOrders.find(co => co.id === parseInt(req.params.id));
  
  if (!changeOrder) {
    return res.status(404).json({ message: 'Change order not found' });
  }
  
  res.json(changeOrder);
});

// Create new change order
router.post('/', (req, res) => {
  const newChangeOrder = {
    id: changeOrders.length + 1,
    requestDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    status: 'Pending', // Default status
    approvedBy: null,
    approvalDate: null,
    ...req.body
  };
  
  changeOrders.push(newChangeOrder);
  
  res.status(201).json(newChangeOrder);
});

// Update change order
router.put('/:id', (req, res) => {
  const changeOrderIndex = changeOrders.findIndex(co => co.id === parseInt(req.params.id));
  
  if (changeOrderIndex === -1) {
    return res.status(404).json({ message: 'Change order not found' });
  }
  
  changeOrders[changeOrderIndex] = {
    ...changeOrders[changeOrderIndex],
    ...req.body
  };
  
  res.json(changeOrders[changeOrderIndex]);
});

// Update change order status
router.patch('/:id/status', (req, res) => {
  const { status, approvedBy } = req.body;
  const changeOrderIndex = changeOrders.findIndex(co => co.id === parseInt(req.params.id));
  
  if (changeOrderIndex === -1) {
    return res.status(404).json({ message: 'Change order not found' });
  }
  
  changeOrders[changeOrderIndex].status = status;
  
  // If status is 'Approved', set approvalDate to current date and update approvedBy
  if (status === 'Approved') {
    changeOrders[changeOrderIndex].approvalDate = new Date().toISOString().split('T')[0];
    if (approvedBy) {
      changeOrders[changeOrderIndex].approvedBy = approvedBy;
    }
  }
  
  res.json(changeOrders[changeOrderIndex]);
});

// Delete change order
router.delete('/:id', (req, res) => {
  const changeOrderIndex = changeOrders.findIndex(co => co.id === parseInt(req.params.id));
  
  if (changeOrderIndex === -1) {
    return res.status(404).json({ message: 'Change order not found' });
  }
  
  const deletedChangeOrder = changeOrders[changeOrderIndex];
  changeOrders = changeOrders.filter(co => co.id !== parseInt(req.params.id));
  
  res.json(deletedChangeOrder);
});

module.exports = router;
