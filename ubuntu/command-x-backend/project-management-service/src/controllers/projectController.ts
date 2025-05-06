import { Request, Response } from 'express';
import { query } from '../db';

// Get all projects
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await query('SELECT project_id, project_name, location, client_name, start_date, end_date, budget, status, created_at FROM projects ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error while fetching projects.' });
    }
};

// Get a single project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        const result = await query('SELECT * FROM projects WHERE project_id = $1', [projectId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Project not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching project ${projectId}:`, error);
        res.status(500).json({ message: 'Internal server error while fetching project.' });
    }
};

// Create a new project
export const createProject = async (req: Request, res: Response): Promise<void> => {
    const { project_name, location, client_name, start_date, end_date, budget, status } = req.body;
    // TODO: Get created_by from authenticated user context (requires auth middleware)
    const created_by = 1; // Placeholder user ID

    if (!project_name) {
        res.status(400).json({ message: 'Project name is required.' });
        return;
    }

    try {
        const result = await query(
            'INSERT INTO projects (project_name, location, client_name, start_date, end_date, budget, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [project_name, location, client_name, start_date, end_date, budget, status || 'Planning', created_by]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error while creating project.' });
    }
};

// Update an existing project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    const { project_name, location, client_name, start_date, end_date, budget, status } = req.body;

    if (!project_name) {
        res.status(400).json({ message: 'Project name is required.' });
        return;
    }

    try {
        const result = await query(
            'UPDATE projects SET project_name = $1, location = $2, client_name = $3, start_date = $4, end_date = $5, budget = $6, status = $7, updated_at = CURRENT_TIMESTAMP WHERE project_id = $8 RETURNING *',
            [project_name, location, client_name, start_date, end_date, budget, status, projectId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Project not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating project ${projectId}:`, error);
        res.status(500).json({ message: 'Internal server error while updating project.' });
    }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        const result = await query('DELETE FROM projects WHERE project_id = $1 RETURNING project_id', [projectId]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Project not found.' });
            return;
        }
        res.status(204).send(); // No content on successful deletion
    } catch (error) {
        console.error(`Error deleting project ${projectId}:`, error);
        // Handle potential foreign key constraints if needed
        res.status(500).json({ message: 'Internal server error while deleting project.' });
    }
};

