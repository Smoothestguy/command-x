const express = require('express');
const router = express.Router();

// Mock document data for demonstration
let documents = [
  {
    id: 1,
    name: 'Project A - Contract',
    type: 'Contract',
    projectId: 1,
    uploadedBy: 'admin',
    uploadDate: '2023-01-20',
    fileSize: '2.5MB',
    filePath: '/uploads/project_a_contract.pdf',
    tags: ['contract', 'legal', 'project-a']
  },
  {
    id: 2,
    name: 'Project A - Blueprint',
    type: 'Blueprint',
    projectId: 1,
    uploadedBy: 'admin',
    uploadDate: '2023-01-22',
    fileSize: '5.8MB',
    filePath: '/uploads/project_a_blueprint.pdf',
    tags: ['blueprint', 'design', 'project-a']
  }
];

// Get all documents
router.get('/', (req, res) => {
  // Filter by project ID if provided
  const projectId = req.query.projectId ? parseInt(req.query.projectId) : null;
  
  if (projectId) {
    const filteredDocuments = documents.filter(d => d.projectId === projectId);
    return res.json(filteredDocuments);
  }
  
  res.json(documents);
});

// Get document by ID
router.get('/:id', (req, res) => {
  const document = documents.find(d => d.id === parseInt(req.params.id));
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  res.json(document);
});

// Create new document
router.post('/', (req, res) => {
  const newDocument = {
    id: documents.length + 1,
    uploadDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    ...req.body
  };
  
  documents.push(newDocument);
  
  res.status(201).json(newDocument);
});

// Update document
router.put('/:id', (req, res) => {
  const documentIndex = documents.findIndex(d => d.id === parseInt(req.params.id));
  
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  documents[documentIndex] = {
    ...documents[documentIndex],
    ...req.body
  };
  
  res.json(documents[documentIndex]);
});

// Delete document
router.delete('/:id', (req, res) => {
  const documentIndex = documents.findIndex(d => d.id === parseInt(req.params.id));
  
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  const deletedDocument = documents[documentIndex];
  documents = documents.filter(d => d.id !== parseInt(req.params.id));
  
  res.json(deletedDocument);
});

module.exports = router;
