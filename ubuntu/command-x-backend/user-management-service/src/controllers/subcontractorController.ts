import { Request, Response } from "express";
import { query } from "../db";

// Test endpoint to check if the controller is working
export const testSubcontractorEndpoint = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json({ message: "Subcontractor controller is working!" });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    res
      .status(500)
      .json({ message: "Internal server error in test endpoint." });
  }
};

// Get all subcontractors
export const getAllSubcontractors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await query(
      "SELECT subcontractor_id, company_name, primary_contact_name as contact_name, email, phone_number as phone, address as trade, performance_rating, created_at, updated_at FROM subcontractors ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching subcontractors:", error);
    res.status(500).json({
      message: "Internal server error while fetching subcontractors.",
    });
  }
};

// Get a specific subcontractor by ID
export const getSubcontractorById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subcontractorId } = req.params;
  try {
    const result = await query(
      "SELECT subcontractor_id, company_name, primary_contact_name as contact_name, email, phone_number as phone, address as trade, performance_rating, created_at, updated_at FROM subcontractors WHERE subcontractor_id = $1",
      [subcontractorId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Subcontractor not found." });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(
      `Error fetching subcontractor with ID ${subcontractorId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error while fetching subcontractor." });
  }
};

// Create a new subcontractor
export const createSubcontractor = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Creating subcontractor with data:", req.body);

  const {
    company_name,
    contact_name,
    email,
    phone,
    trade,
    insurance_expiry,
    license_number,
    status,
  } = req.body;

  if (!company_name) {
    res.status(400).json({ message: "Company name is required." });
    return;
  }

  try {
    const result = await query(
      "INSERT INTO subcontractors (company_name, primary_contact_name, email, phone_number, address) VALUES ($1, $2, $3, $4, $5) RETURNING subcontractor_id, company_name, primary_contact_name as contact_name, email, phone_number as phone, address as trade, created_at, updated_at",
      [company_name, contact_name, email, phone, trade]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating subcontractor:", error);
    res
      .status(500)
      .json({ message: "Internal server error while creating subcontractor." });
  }
};

// Update an existing subcontractor
export const updateSubcontractor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subcontractorId } = req.params;
  const {
    company_name,
    contact_name,
    email,
    phone,
    trade,
    insurance_expiry,
    license_number,
    status,
  } = req.body;

  if (!company_name) {
    res.status(400).json({ message: "Company name is required." });
    return;
  }

  try {
    const result = await query(
      "UPDATE subcontractors SET company_name = $1, primary_contact_name = $2, email = $3, phone_number = $4, address = $5, updated_at = CURRENT_TIMESTAMP WHERE subcontractor_id = $6 RETURNING subcontractor_id, company_name, primary_contact_name as contact_name, email, phone_number as phone, address as trade, created_at, updated_at",
      [company_name, contact_name, email, phone, trade, subcontractorId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Subcontractor not found." });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(
      `Error updating subcontractor with ID ${subcontractorId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error while updating subcontractor." });
  }
};

// Delete a subcontractor
export const deleteSubcontractor = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { subcontractorId } = req.params;
  try {
    const result = await query(
      "DELETE FROM subcontractors WHERE subcontractor_id = $1 RETURNING subcontractor_id",
      [subcontractorId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Subcontractor not found." });
      return;
    }

    res.status(200).json({ message: "Subcontractor deleted successfully." });
  } catch (error) {
    console.error(
      `Error deleting subcontractor with ID ${subcontractorId}:`,
      error
    );
    res
      .status(500)
      .json({ message: "Internal server error while deleting subcontractor." });
  }
};
