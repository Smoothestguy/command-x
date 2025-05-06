import { Request, Response } from "express";
import { query } from "../db";

// --- Inspections ---

export const createInspection = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    project_id,
    work_order_id,
    inspection_type,
    scheduled_date,
    status,
    description,
  } = req.body;
  // TODO: Get conducted_by from authenticated user context
  const conducted_by = 1; // Placeholder user ID

  if (!project_id || !inspection_type) {
    res
      .status(400)
      .json({ message: "Project ID and inspection type are required." });
    return;
  }

  try {
    const result = await query(
      "INSERT INTO inspections (project_id, work_order_id, inspection_type, scheduled_date, status, description, conducted_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        project_id,
        work_order_id || null,
        inspection_type,
        scheduled_date,
        status || "Scheduled",
        description,
        conducted_by,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating inspection:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating inspection." });
  }
};

export const getInspections = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId, workOrderId } = req.query;
  let queryString = "SELECT * FROM inspections WHERE 1=1";
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

  queryString += " ORDER BY scheduled_date DESC";

  try {
    const result = await query(queryString, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching inspections:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching inspections." });
  }
};

export const updateInspection = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { inspectionId } = req.params;
  const {
    inspection_type,
    scheduled_date,
    completion_date,
    status,
    description,
    results,
  } = req.body;

  try {
    const result = await query(
      "UPDATE inspections SET inspection_type = $1, scheduled_date = $2, completion_date = $3, status = $4, description = $5, results = $6, updated_at = CURRENT_TIMESTAMP WHERE inspection_id = $7 RETURNING *",
      [
        inspection_type,
        scheduled_date,
        completion_date,
        status,
        description,
        results,
        inspectionId,
      ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Inspection not found." });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating inspection ${inspectionId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while updating inspection." });
  }
};

// --- Issues ---

export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    project_id,
    work_order_id,
    inspection_id,
    description,
    severity,
    status,
    assigned_to,
  } = req.body;
  // TODO: Get reported_by from authenticated user context
  const reported_by = 1; // Placeholder user ID

  if (!project_id || !description) {
    res
      .status(400)
      .json({ message: "Project ID and description are required." });
    return;
  }

  try {
    const result = await query(
      "INSERT INTO issues (project_id, work_order_id, inspection_id, description, severity, status, assigned_to, reported_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        project_id,
        work_order_id || null,
        inspection_id || null,
        description,
        severity || "Medium",
        status || "Open",
        assigned_to || null,
        reported_by,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating issue:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating issue." });
  }
};

export const getIssues = async (req: Request, res: Response): Promise<void> => {
  const { projectId, workOrderId, inspectionId, status } = req.query;
  let queryString = "SELECT * FROM issues WHERE 1=1";
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
  if (inspectionId) {
    queryString += ` AND inspection_id = $${paramIndex++}`;
    queryParams.push(inspectionId);
  }
  if (status) {
    queryString += ` AND status = $${paramIndex++}`;
    queryParams.push(status);
  }

  queryString += " ORDER BY created_at DESC";

  try {
    const result = await query(queryString, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching issues:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching issues." });
  }
};

export const updateIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { issueId } = req.params;
  const { description, severity, status, assigned_to, resolution_details } =
    req.body;

  try {
    const result = await query(
      "UPDATE issues SET description = $1, severity = $2, status = $3, assigned_to = $4, resolution_details = $5, updated_at = CURRENT_TIMESTAMP WHERE issue_id = $6 RETURNING *",
      [description, severity, status, assigned_to, resolution_details, issueId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Issue not found." });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating issue ${issueId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while updating issue." });
  }
};
