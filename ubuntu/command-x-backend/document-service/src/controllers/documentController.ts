import { Request, Response } from 'express';
import { query } from '../db';
import { uploadFile, getFileStream, deleteFile } from '../storage';
import { config } from '../config';
import path from 'path';
import { S3 } from 'aws-sdk'; // Import S3 type
import { Readable } from 'stream'; // Import Readable for type checking

// Handle file upload and record metadata
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded.' });
        return;
    }

    const { project_id, work_order_id, description } = req.body;
    // TODO: Get uploaded_by from authenticated user context
    const uploaded_by = 1; // Placeholder user ID

    try {
        // Upload file to storage (S3 or Local)
        const filePathOrUrl = await uploadFile(req.file);

        // Record document metadata in the database
        const result = await query(
            'INSERT INTO documents (project_id, work_order_id, file_name, file_path, file_type, file_size, description, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [project_id || null, work_order_id || null, req.file.originalname, filePathOrUrl, req.file.mimetype, req.file.size, description, uploaded_by]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error uploading document:', error);
        // TODO: Add cleanup logic if DB insert fails after file upload
        res.status(500).json({ message: 'Internal server error while uploading document.' });
    }
};

// Get document metadata
export const getDocumentMetadata = async (req: Request, res: Response): Promise<void> => {
    const { documentId } = req.params;
    try {
        const result = await query('SELECT * FROM documents WHERE document_id = $1', [documentId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Document metadata not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching document metadata ${documentId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching document metadata.' });
    }
};

// Download a document file
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
    const { documentId } = req.params;
    try {
        // 1. Get document metadata (including file_path/key and original file_name)
        const result = await query('SELECT file_path, file_name, file_type FROM documents WHERE document_id = $1', [documentId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Document not found.' });
            return;
        }
        const { file_path, file_name, file_type } = result.rows[0];

        // 2. Get file stream from storage
        const fileStream = getFileStream(file_path);

        if (!fileStream) {
            res.status(404).json({ message: 'File not found in storage.' });
            return;
        }

        // 3. Stream the file to the client
        res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
        if (file_type) {
            res.setHeader('Content-Type', file_type);
        }

        // Check if fileStream is a readable stream (for local files or S3 streams)
        if (fileStream instanceof Readable) {
            fileStream.pipe(res);
        } else if (fileStream instanceof Buffer || typeof fileStream === 'string') {
            // Handle cases where S3 getObject might return Buffer/string directly (less common for streams)
            res.send(fileStream);
        } else {
            console.error('Cannot handle file stream type');
            if (!res.headersSent) {
                res.status(500).send('Error streaming file');
            }
        }

    } catch (error) {
        console.error(`Error downloading document ${documentId}:`, error);
        // Avoid sending headers twice if error occurs mid-stream
        if (!res.headersSent) {
            res.status(500).json({ message: 'Internal server error while downloading document.' });
        }
    }
};

// Delete a document (metadata and file)
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    const { documentId } = req.params;
    try {
        // 1. Get file path/key from DB
        const result = await query('SELECT file_path FROM documents WHERE document_id = $1', [documentId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Document metadata not found.' });
            return;
        }
        const { file_path } = result.rows[0];

        // 2. Delete metadata from DB
        const deleteMetaResult = await query('DELETE FROM documents WHERE document_id = $1 RETURNING document_id', [documentId]);
        if (deleteMetaResult.rows.length === 0) {
            // Should not happen if previous query succeeded, but good practice to check
            res.status(404).json({ message: 'Document metadata not found during delete.' });
            return;
        }

        // 3. Delete file from storage
        await deleteFile(file_path);

        res.status(204).send(); // No content on successful deletion
    } catch (error) {
        console.error(`Error deleting document ${documentId}:`, error);
        // TODO: Add rollback logic if file deletion fails after DB deletion?
        res.status(500).json({ message: 'Internal server error while deleting document.' });
    }
};

// List documents (filtered)
export const listDocuments = async (req: Request, res: Response): Promise<void> => {
    const { projectId, workOrderId } = req.query;
    let queryString = 'SELECT document_id, project_id, work_order_id, file_name, file_type, file_size, description, uploaded_by, uploaded_at FROM documents WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (projectId) {
        queryString += ` AND project_id = $${paramIndex++}`;
        queryParams.push(projectId);
    }
    if (workOrderId) {
        queryString += ` AND work_order_id = $${paramIndex++}`;
        queryParams.push(workOrderId);
    }

    queryString += ' ORDER BY uploaded_at DESC';

    try {
        const result = await query(queryString, queryParams);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error listing documents:', error);
        res.status(500).json({ message: 'Internal server error while listing documents.' });
    }
};

