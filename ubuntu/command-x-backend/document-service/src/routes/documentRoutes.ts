import { Router } from 'express';
import multer from 'multer';
import {
    uploadDocument,
    getDocumentMetadata,
    downloadDocument,
    deleteDocument,
    listDocuments
} from '../controllers/documentController';

// TODO: Add authentication middleware

const router = Router();

// Configure multer for file uploads (using memory storage for simplicity)
// For production, consider disk storage or direct streaming to S3
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Document Routes
router.post('/upload', upload.single('file'), uploadDocument); // 'file' is the field name in the form-data
router.get('/', listDocuments);
router.get('/:documentId/metadata', getDocumentMetadata);
router.get('/:documentId/download', downloadDocument);
router.delete('/:documentId', deleteDocument);

export default router;

