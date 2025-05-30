import { Request, Response } from "express";
import { query } from "../db";

// Get all work orders (potentially filtered by project)
export const getAllWorkOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { projectId } = req.query; // Optional filter by project_id
  try {
    let queryString = "SELECT * FROM work_orders";
    const queryParams = [];
    if (projectId) {
      queryString += " WHERE project_id = $1";
      queryParams.push(projectId);
    }
    queryString += " ORDER BY created_at DESC";

    const result = await query(queryString, queryParams);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching work orders." });
  }
};

// Get a single work order by ID
export const getWorkOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { workOrderId } = req.params;
  try {
    const result = await query(
      "SELECT * FROM work_orders WHERE work_order_id = $1",
      [workOrderId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }
    // Optionally fetch line items as well
    const lineItemsResult = await query(
      "SELECT * FROM line_items WHERE work_order_id = $1 ORDER BY line_item_id",
      [workOrderId]
    );
    const workOrder = result.rows[0];
    workOrder.line_items = lineItemsResult.rows;

    res.status(200).json(workOrder);
  } catch (error) {
    console.error(`Error fetching work order ${workOrderId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while fetching work order." });
  }
};

// Create a new work order
export const createWorkOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    project_id,
    assigned_subcontractor_id,
    description,
    status,
    scheduled_date,
    estimated_cost,
    retainage_percentage,
  } = req.body;
  // TODO: Get created_by from authenticated user context
  const created_by = 1; // Placeholder user ID

  if (!project_id || !description) {
    res
      .status(400)
      .json({ message: "Project ID and description are required." });
    return;
  }

  try {
    const result = await query(
      "INSERT INTO work_orders (project_id, assigned_subcontractor_id, description, status, scheduled_date, estimated_cost, retainage_percentage, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        project_id,
        assigned_subcontractor_id,
        description,
        status || "Pending",
        scheduled_date,
        estimated_cost,
        retainage_percentage || 0,
        created_by,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating work order:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating work order." });
  }
};

// Update an existing work order
export const updateWorkOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { workOrderId } = req.params;
  const {
    assigned_subcontractor_id,
    description,
    status,
    scheduled_date,
    completion_date,
    estimated_cost,
    actual_cost,
    retainage_percentage,
    amount_billed,
    amount_paid,
  } = req.body;

  // Add more validation as needed
  if (!description) {
    res.status(400).json({ message: "Description is required." });
    return;
  }

  try {
    const result = await query(
      "UPDATE work_orders SET assigned_subcontractor_id = $1, description = $2, status = $3, scheduled_date = $4, completion_date = $5, estimated_cost = $6, actual_cost = $7, retainage_percentage = $8, amount_billed = $9, amount_paid = $10, updated_at = CURRENT_TIMESTAMP WHERE work_order_id = $11 RETURNING *",
      [
        assigned_subcontractor_id,
        description,
        status,
        scheduled_date,
        completion_date,
        estimated_cost,
        actual_cost,
        retainage_percentage,
        amount_billed,
        amount_paid,
        workOrderId,
      ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating work order ${workOrderId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while updating work order." });
  }
};

// Delete a work order
export const deleteWorkOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { workOrderId } = req.params;
  try {
    // Consider implications: deleting a work order might require deleting related line items, inspections etc., or setting them to a specific status.
    // For simplicity, we just delete the work order here. Use ON DELETE CASCADE in schema carefully.
    const result = await query(
      "DELETE FROM work_orders WHERE work_order_id = $1 RETURNING work_order_id",
      [workOrderId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Work order not found." });
      return;
    }
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error(`Error deleting work order ${workOrderId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting work order." });
  }
};

// --- Line Item Controllers --- (Can be in a separate controller file)

export const addLineItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { workOrderId } = req.params;
  const { description, quantity, unit_cost, status } = req.body;

  if (!description) {
    res.status(400).json({ message: "Line item description is required." });
    return;
  }

  try {
    const result = await query(
      "INSERT INTO line_items (work_order_id, description, quantity, unit_cost, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [workOrderId, description, quantity, unit_cost, status || "Not Started"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(
      `Error adding line item to work order ${workOrderId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error while adding line item." });
  }
};

export const updateLineItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { lineItemId } = req.params;
  const { description, quantity, unit_cost, status } = req.body;

  if (!description) {
    res.status(400).json({ message: "Line item description is required." });
    return;
  }

  try {
    const result = await query(
      "UPDATE line_items SET description = $1, quantity = $2, unit_cost = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE line_item_id = $5 RETURNING *",
      [description, quantity, unit_cost, status, lineItemId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Line item not found." });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating line item ${lineItemId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while updating line item." });
  }
};

export const deleteLineItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { lineItemId } = req.params;
  try {
    const result = await query(
      "DELETE FROM line_items WHERE line_item_id = $1 RETURNING line_item_id",
      [lineItemId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "Line item not found." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting line item ${lineItemId}:`, error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting line item." });
  }
};

// Enhanced Work Order Creation with Multi-Contractor Support, Payment Items and Line Items
export const createEnhancedWorkOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    project_id,
    assigned_subcontractor_id, // Legacy single contractor (optional)
    contractor_assignments = [], // New multi-contractor assignments
    description,
    status,
    scheduled_date,
    retainage_percentage,
    selectedPaymentItems,
    newLineItems,
  } = req.body;

  // TODO: Get created_by from authenticated user context
  const created_by = 1; // Placeholder user ID

  if (!project_id || !description) {
    res
      .status(400)
      .json({ message: "Project ID and description are required." });
    return;
  }

  if (!selectedPaymentItems?.length && !newLineItems?.length) {
    res.status(400).json({
      message: "At least one payment item or new line item is required.",
    });
    return;
  }

  // Validate contractor assignments if provided
  if (contractor_assignments.length > 0) {
    const totalPercentage = contractor_assignments.reduce(
      (sum: number, assignment: any) =>
        sum + (assignment.allocation_percentage || 0),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      res.status(400).json({
        message: "Contractor allocation percentages must total 100%",
      });
      return;
    }

    // Validate that all contractor assignments have required fields
    for (const assignment of contractor_assignments) {
      if (
        !assignment.subcontractor_id ||
        assignment.allocation_percentage <= 0
      ) {
        res.status(400).json({
          message:
            "Each contractor assignment must have a valid subcontractor ID and allocation percentage",
        });
        return;
      }
    }
  }

  try {
    // Start transaction
    await query("BEGIN");

    // Create the work order
    const workOrderResult = await query(
      `
            INSERT INTO work_orders (
                project_id, assigned_subcontractor_id, description, status,
                scheduled_date, retainage_percentage, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `,
      [
        project_id,
        assigned_subcontractor_id,
        description,
        status || "Pending",
        scheduled_date,
        retainage_percentage || 0,
        created_by,
      ]
    );

    const workOrder = workOrderResult.rows[0];
    const workOrderId = workOrder.work_order_id;

    // Create contractor assignments if provided
    if (contractor_assignments.length > 0) {
      for (const assignment of contractor_assignments) {
        await query(
          `
                    INSERT INTO work_order_contractors (
                        work_order_id, subcontractor_id, allocation_percentage,
                        allocation_amount, role_description
                    ) VALUES ($1, $2, $3, $4, $5)
                `,
          [
            workOrderId,
            assignment.subcontractor_id,
            assignment.allocation_percentage,
            assignment.allocation_amount || 0,
            assignment.role_description || null,
          ]
        );
      }
    }

    let totalEstimatedCost = 0;

    // Assign selected payment items to the work order
    if (selectedPaymentItems?.length > 0) {
      for (const itemId of selectedPaymentItems) {
        // Update payment item to assign it to this work order
        const updateResult = await query(
          `
                    UPDATE payment_items
                    SET work_order_id = $1, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
                    WHERE item_id = $2 AND work_order_id IS NULL
                    RETURNING total_price
                `,
          [workOrderId, itemId]
        );

        if (updateResult.rows.length > 0) {
          totalEstimatedCost += parseFloat(
            updateResult.rows[0].total_price || 0
          );
        }
      }
    }

    // Create new line items
    if (newLineItems?.length > 0) {
      for (const lineItem of newLineItems) {
        const lineItemResult = await query(
          `
                    INSERT INTO line_items (
                        work_order_id, description, quantity, unit_cost, status
                    ) VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `,
          [
            workOrderId,
            lineItem.description,
            lineItem.quantity,
            lineItem.unit_cost,
            "Not Started",
          ]
        );

        if (lineItemResult.rows.length > 0) {
          // Calculate total cost manually since it's a generated column
          const itemTotal =
            parseFloat(lineItem.quantity) * parseFloat(lineItem.unit_cost);
          totalEstimatedCost += itemTotal;
        }
      }
    }

    // Update work order with calculated estimated cost
    await query(
      `
            UPDATE work_orders
            SET estimated_cost = $1, updated_at = CURRENT_TIMESTAMP
            WHERE work_order_id = $2
        `,
      [totalEstimatedCost, workOrderId]
    );

    // Commit transaction
    await query("COMMIT");

    // Fetch the complete work order with line items and contractor assignments
    const completeWorkOrderResult = await query(
      `
            SELECT * FROM work_orders WHERE work_order_id = $1
        `,
      [workOrderId]
    );

    const lineItemsResult = await query(
      `
            SELECT * FROM line_items WHERE work_order_id = $1 ORDER BY line_item_id
        `,
      [workOrderId]
    );

    const contractorAssignmentsResult = await query(
      `
            SELECT woc.*, s.company_name, s.primary_contact_name as contact_name
            FROM work_order_contractors woc
            LEFT JOIN subcontractors s ON woc.subcontractor_id = s.subcontractor_id
            WHERE woc.work_order_id = $1
            ORDER BY woc.allocation_percentage DESC
        `,
      [workOrderId]
    );

    const completeWorkOrder = completeWorkOrderResult.rows[0];
    completeWorkOrder.line_items = lineItemsResult.rows;
    completeWorkOrder.contractor_assignments = contractorAssignmentsResult.rows;
    completeWorkOrder.selectedPaymentItems = selectedPaymentItems || [];
    completeWorkOrder.newLineItems = newLineItems || [];

    res.status(201).json(completeWorkOrder);
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK");
    console.error("Error creating enhanced work order:", error);
    res.status(500).json({
      message: "Internal server error while creating enhanced work order.",
    });
  }
};

// Get contractor assignments for a work order
export const getWorkOrderContractors = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { workOrderId } = req.params;

  try {
    const result = await query(
      `
            SELECT woc.*, s.company_name, s.primary_contact_name as contact_name, s.email, s.phone_number
            FROM work_order_contractors woc
            LEFT JOIN subcontractors s ON woc.subcontractor_id = s.subcontractor_id
            WHERE woc.work_order_id = $1
            ORDER BY woc.allocation_percentage DESC
        `,
      [workOrderId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(
      `Error fetching contractors for work order ${workOrderId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error while fetching contractors." });
  }
};

// Update contractor assignment
export const updateWorkOrderContractor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { assignmentId } = req.params;
  const { allocation_percentage, allocation_amount, role_description } =
    req.body;

  try {
    const result = await query(
      `
            UPDATE work_order_contractors
            SET allocation_percentage = $1, allocation_amount = $2,
                role_description = $3, updated_at = CURRENT_TIMESTAMP
            WHERE assignment_id = $4
            RETURNING *
        `,
      [allocation_percentage, allocation_amount, role_description, assignmentId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Contractor assignment not found." });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(
      `Error updating contractor assignment ${assignmentId}:`,
      error
    );
    res.status(500).json({
      message: "Internal server error while updating contractor assignment.",
    });
  }
};

// Get all subcontractors
export const getAllSubcontractors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await query(
      "SELECT * FROM subcontractors ORDER BY company_name ASC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching subcontractors:", error);
    res.status(500).json({
      message: "Internal server error while fetching subcontractors.",
    });
  }
};
