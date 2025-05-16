const express = require('express');
const router = express.Router();

// Mock invoice data for demonstration
let invoices = [
  {
    id: 1,
    projectId: 1,
    number: 'INV-2023-001',
    client: 'ABC Corporation',
    amount: 25000.00,
    status: 'Paid',
    issueDate: '2023-02-15',
    dueDate: '2023-03-15',
    paidDate: '2023-03-10',
    items: [
      { description: 'Foundation Work', amount: 15000.00 },
      { description: 'Materials', amount: 10000.00 }
    ]
  },
  {
    id: 2,
    projectId: 1,
    number: 'INV-2023-002',
    client: 'ABC Corporation',
    amount: 35000.00,
    status: 'Pending',
    issueDate: '2023-03-15',
    dueDate: '2023-04-15',
    paidDate: null,
    items: [
      { description: 'Framing Work', amount: 20000.00 },
      { description: 'Materials', amount: 15000.00 }
    ]
  }
];

// Mock expense data for demonstration
let expenses = [
  {
    id: 1,
    projectId: 1,
    description: 'Concrete Materials',
    category: 'Materials',
    amount: 8500.00,
    vendor: 'ABC Supplies',
    date: '2023-02-01',
    approvedBy: 'Admin User',
    receiptPath: '/uploads/receipt_001.pdf'
  },
  {
    id: 2,
    projectId: 1,
    description: 'Equipment Rental',
    category: 'Equipment',
    amount: 3200.00,
    vendor: 'XYZ Rentals',
    date: '2023-02-05',
    approvedBy: 'Admin User',
    receiptPath: '/uploads/receipt_002.pdf'
  }
];

// Get all invoices
router.get('/invoices', (req, res) => {
  // Filter by project ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  
  if (projectId) {
    const filteredInvoices = invoices.filter(i => i.projectId === projectId);
    return res.json(filteredInvoices);
  }
  
  res.json(invoices);
});

// Get invoice by ID
router.get('/invoices/:id', (req, res) => {
  const invoice = invoices.find(i => i.id === parseInt(req.params.id));
  
  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  res.json(invoice);
});

// Create new invoice
router.post('/invoices', (req, res) => {
  const newInvoice = {
    id: invoices.length + 1,
    issueDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    ...req.body
  };
  
  invoices.push(newInvoice);
  
  res.status(201).json(newInvoice);
});

// Update invoice
router.put('/invoices/:id', (req, res) => {
  const invoiceIndex = invoices.findIndex(i => i.id === parseInt(req.params.id));
  
  if (invoiceIndex === -1) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  invoices[invoiceIndex] = {
    ...invoices[invoiceIndex],
    ...req.body
  };
  
  res.json(invoices[invoiceIndex]);
});

// Delete invoice
router.delete('/invoices/:id', (req, res) => {
  const invoiceIndex = invoices.findIndex(i => i.id === parseInt(req.params.id));
  
  if (invoiceIndex === -1) {
    return res.status(404).json({ message: 'Invoice not found' });
  }
  
  const deletedInvoice = invoices[invoiceIndex];
  invoices = invoices.filter(i => i.id !== parseInt(req.params.id));
  
  res.json(deletedInvoice);
});

// Get all expenses
router.get('/expenses', (req, res) => {
  // Filter by project ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  
  if (projectId) {
    const filteredExpenses = expenses.filter(e => e.projectId === projectId);
    return res.json(filteredExpenses);
  }
  
  res.json(expenses);
});

// Get expense by ID
router.get('/expenses/:id', (req, res) => {
  const expense = expenses.find(e => e.id === parseInt(req.params.id));
  
  if (!expense) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  res.json(expense);
});

// Create new expense
router.post('/expenses', (req, res) => {
  const newExpense = {
    id: expenses.length + 1,
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    ...req.body
  };
  
  expenses.push(newExpense);
  
  res.status(201).json(newExpense);
});

// Update expense
router.put('/expenses/:id', (req, res) => {
  const expenseIndex = expenses.findIndex(e => e.id === parseInt(req.params.id));
  
  if (expenseIndex === -1) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  expenses[expenseIndex] = {
    ...expenses[expenseIndex],
    ...req.body
  };
  
  res.json(expenses[expenseIndex]);
});

// Delete expense
router.delete('/expenses/:id', (req, res) => {
  const expenseIndex = expenses.findIndex(e => e.id === parseInt(req.params.id));
  
  if (expenseIndex === -1) {
    return res.status(404).json({ message: 'Expense not found' });
  }
  
  const deletedExpense = expenses[expenseIndex];
  expenses = expenses.filter(e => e.id !== parseInt(req.params.id));
  
  res.json(deletedExpense);
});

module.exports = router;
