const express = require('express');
const router = express.Router();

// Mock pay item data for demonstration
let payItems = [
  {
    id: 1,
    workOrderId: 1,
    description: 'Foundation Excavation',
    quantity: 1,
    unit: 'LS',
    unitPrice: 5000.00,
    totalPrice: 5000.00,
    status: 'Completed',
    completedDate: '2023-02-05'
  },
  {
    id: 2,
    workOrderId: 1,
    description: 'Concrete Pouring',
    quantity: 50,
    unit: 'CY',
    unitPrice: 200.00,
    totalPrice: 10000.00,
    status: 'In Progress',
    completedDate: null
  }
];

// Get all pay items
router.get('/', (req, res) => {
  // Filter by work order ID if provided
  const workOrderId = req.query.workOrderId ? parseInt(req.query.workOrderId) : null;
  
  if (workOrderId) {
    const filteredPayItems = payItems.filter(p => p.workOrderId === workOrderId);
    return res.json(filteredPayItems);
  }
  
  res.json(payItems);
});

// Get pay item by ID
router.get('/:id', (req, res) => {
  const payItem = payItems.find(p => p.id === parseInt(req.params.id));
  
  if (!payItem) {
    return res.status(404).json({ message: 'Pay item not found' });
  }
  
  res.json(payItem);
});

// Create new pay item
router.post('/', (req, res) => {
  const { quantity, unitPrice } = req.body;
  const totalPrice = quantity * unitPrice;
  
  const newPayItem = {
    id: payItems.length + 1,
    totalPrice,
    status: 'Pending', // Default status
    completedDate: null,
    ...req.body
  };
  
  payItems.push(newPayItem);
  
  res.status(201).json(newPayItem);
});

// Update pay item
router.put('/:id', (req, res) => {
  const payItemIndex = payItems.findIndex(p => p.id === parseInt(req.params.id));
  
  if (payItemIndex === -1) {
    return res.status(404).json({ message: 'Pay item not found' });
  }
  
  // Recalculate total price if quantity or unit price is updated
  let totalPrice = payItems[payItemIndex].totalPrice;
  if (req.body.quantity !== undefined || req.body.unitPrice !== undefined) {
    const quantity = req.body.quantity !== undefined ? req.body.quantity : payItems[payItemIndex].quantity;
    const unitPrice = req.body.unitPrice !== undefined ? req.body.unitPrice : payItems[payItemIndex].unitPrice;
    totalPrice = quantity * unitPrice;
  }
  
  payItems[payItemIndex] = {
    ...payItems[payItemIndex],
    ...req.body,
    totalPrice
  };
  
  res.json(payItems[payItemIndex]);
});

// Update pay item status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const payItemIndex = payItems.findIndex(p => p.id === parseInt(req.params.id));
  
  if (payItemIndex === -1) {
    return res.status(404).json({ message: 'Pay item not found' });
  }
  
  payItems[payItemIndex].status = status;
  
  // If status is 'Completed', set completedDate to current date
  if (status === 'Completed') {
    payItems[payItemIndex].completedDate = new Date().toISOString().split('T')[0];
  }
  
  res.json(payItems[payItemIndex]);
});

// Delete pay item
router.delete('/:id', (req, res) => {
  const payItemIndex = payItems.findIndex(p => p.id === parseInt(req.params.id));
  
  if (payItemIndex === -1) {
    return res.status(404).json({ message: 'Pay item not found' });
  }
  
  const deletedPayItem = payItems[payItemIndex];
  payItems = payItems.filter(p => p.id !== parseInt(req.params.id));
  
  res.json(deletedPayItem);
});

module.exports = router;
