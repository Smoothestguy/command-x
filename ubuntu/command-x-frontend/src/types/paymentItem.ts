// Payment Item Types

export interface PaymentItemData {
  item_id: number;
  uuid_item_id?: string; // Store the actual UUID from database
  project_id: string | number; // Support both UUID strings and legacy numbers
  product_id?: string;
  product_name?: string;
  work_order_id?: number;
  location_id?: number;
  location_name?: string;
  line_number?: string | number;
  description: string;
  item_code?: string;
  quantity?: number;
  unit_of_measure: string;
  unit_price: number;
  original_quantity: number;
  actual_quantity?: number;
  total_price: number;
  actual_total_price?: number;
  status: "pending" | "approved" | "rejected" | "completed" | "in_progress";
  qc_approval_status: "pending" | "approved" | "rejected";
  supervisor_approval_status: "pending" | "approved" | "rejected";
  accountant_approval_status: "pending" | "approved" | "rejected";
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  documents?: DocumentLinkData[];
  approval_workflow?: ApprovalWorkflowData;
  category?: string;
  specifications?: string;
  vendor_id?: number;
  vendor_name?: string;
  purchase_order_id?: number;
  purchase_order_number?: string;
  balance?: number;
  received_quantity?: number;
  [key: string]: any;
}

export interface LocationData {
  location_id: number;
  project_id: string | number;
  parent_location_id?: number;
  location_name?: string;
  name: string;
  description?: string;
  location_type?: string;
  item_count?: number;
  created_at?: string;
  updated_at?: string;
  children?: LocationData[];
  payment_items?: PaymentItemData[];
  [key: string]: any;
}

export interface DocumentLinkData {
  document_id: number;
  item_id: number;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: number;
}

export interface ApprovalWorkflowData {
  workflow_id: number;
  item_id: number;
  current_step: number;
  total_steps: number;
  current_approver_id?: number;
  current_approver_name?: string;
  next_approver_id?: number;
  next_approver_name?: string;
  approval_history: {
    step: number;
    approver_id: number;
    approver_name: string;
    status: "approved" | "rejected" | "pending";
    timestamp: string;
    comments?: string;
  }[];
}

// Mock data for testing
export const mockLocations: LocationData[] = [
  {
    location_id: 1,
    project_id: 1,
    name: "First Floor",
    description: "First floor of the building",
    location_type: "floor",
    item_count: 3,
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-15T10:30:00Z",
  },
  {
    location_id: 2,
    project_id: 1,
    name: "Second Floor",
    description: "Second floor of the building",
    location_type: "floor",
    item_count: 2,
    created_at: "2025-01-15T10:35:00Z",
    updated_at: "2025-01-15T10:35:00Z",
  },
  {
    location_id: 3,
    project_id: 1,
    parent_location_id: 1,
    name: "Kitchen",
    description: "Kitchen area on the first floor",
    location_type: "room",
    item_count: 2,
    created_at: "2025-01-15T10:40:00Z",
    updated_at: "2025-01-15T10:40:00Z",
  },
  {
    location_id: 4,
    project_id: 1,
    parent_location_id: 1,
    name: "Living Room",
    description: "Living room area on the first floor",
    location_type: "room",
    item_count: 1,
    created_at: "2025-01-15T10:45:00Z",
    updated_at: "2025-01-15T10:45:00Z",
  },
  {
    location_id: 5,
    project_id: 1,
    parent_location_id: 2,
    name: "Master Bedroom",
    description: "Master bedroom on the second floor",
    location_type: "room",
    item_count: 1,
    created_at: "2025-01-15T10:50:00Z",
    updated_at: "2025-01-15T10:50:00Z",
  },
  {
    location_id: 6,
    project_id: 1,
    parent_location_id: 2,
    name: "Bathroom",
    description: "Bathroom on the second floor",
    location_type: "room",
    item_count: 1,
    created_at: "2025-01-15T10:55:00Z",
    updated_at: "2025-01-15T10:55:00Z",
  },
  // Add locations for the test project
  {
    location_id: 7,
    project_id: "6d85162b-93c3-4f3e-ad29-cbc43a270eb8", // Test Project for Payment Items
    name: "Test Location 1",
    description: "First test location",
    location_type: "room",
    item_count: 1,
    created_at: "2025-01-01T08:00:00Z",
    updated_at: "2025-01-01T08:00:00Z",
  },
  {
    location_id: 8,
    project_id: "6d85162b-93c3-4f3e-ad29-cbc43a270eb8", // Test Project for Payment Items
    name: "Test Location 2",
    description: "Second test location",
    location_type: "room",
    item_count: 1,
    created_at: "2025-01-01T08:05:00Z",
    updated_at: "2025-01-01T08:05:00Z",
  },
];

export const mockPaymentItems: PaymentItemData[] = [
  {
    item_id: 1,
    project_id: 1,
    work_order_id: 1,
    location_id: 3,
    product_id: "prod-4",
    product_name: "Appliance Package",
    description: "Kitchen Cabinets Installation",
    item_code: "KC-001",
    unit_of_measure: "linear ft",
    unit_price: 250,
    original_quantity: 20,
    actual_quantity: 22,
    total_price: 5000,
    actual_total_price: 5500,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    notes: "Additional 2 linear feet added due to design change",
    created_at: "2025-02-15T09:30:00Z",
    updated_at: "2025-02-28T14:45:00Z",
    category: "GENERAL",
    specifications: "Premium grade cabinets with soft-close hinges",
    vendor_id: 1,
    vendor_name: "Cabinet Specialists Inc.",
    purchase_order_id: 2001,
    purchase_order_number: "PO-2001",
    balance: 0,
    received_quantity: 22,
  },
  {
    item_id: 2,
    project_id: 1,
    work_order_id: 1,
    location_id: 3,
    product_id: "prod-2",
    product_name: "Framing Lumber",
    description: "Countertop Installation",
    item_code: "CT-001",
    unit_of_measure: "sq ft",
    unit_price: 75,
    original_quantity: 30,
    actual_quantity: 30,
    total_price: 2250,
    actual_total_price: 2250,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    created_at: "2025-02-15T09:35:00Z",
    updated_at: "2025-02-28T14:50:00Z",
    category: "GENERAL",
    specifications: "Granite countertops with undermount sink",
    vendor_id: 1,
    vendor_name: "Cabinet Specialists Inc.",
    purchase_order_id: 2002,
    purchase_order_number: "PO-2002",
    balance: 0,
    received_quantity: 30,
  },
  {
    item_id: 3,
    project_id: 1,
    work_order_id: 2,
    location_id: 4,
    product_id: "prod-3",
    product_name: "Project Management Hours",
    description: "Hardwood Flooring",
    item_code: "HF-001",
    unit_of_measure: "sq ft",
    unit_price: 12,
    original_quantity: 300,
    actual_quantity: 300,
    total_price: 3600,
    actual_total_price: 3600,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    created_at: "2025-03-01T10:00:00Z",
    updated_at: "2025-03-20T15:30:00Z",
    category: "GENERAL",
    specifications: "Engineered hardwood, 3/4 inch thickness",
    vendor_id: 2,
    vendor_name: "Flooring Experts LLC",
    purchase_order_id: 2003,
    purchase_order_number: "PO-2003",
    balance: 0,
    received_quantity: 300,
  },
  {
    item_id: 4,
    project_id: 1,
    work_order_id: 2,
    location_id: 5,
    description: "Carpet Installation",
    item_code: "CI-001",
    unit_of_measure: "sq ft",
    unit_price: 8,
    original_quantity: 200,
    actual_quantity: 210,
    total_price: 1600,
    actual_total_price: 1680,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    notes: "Additional area covered due to closet inclusion",
    created_at: "2025-03-01T10:15:00Z",
    updated_at: "2025-03-20T15:45:00Z",
    category: "GENERAL",
    specifications: "Stain-resistant carpet, medium pile",
    vendor_id: 2,
    vendor_name: "Flooring Experts LLC",
    purchase_order_id: 2004,
    purchase_order_number: "PO-2004",
    balance: 0,
    received_quantity: 210,
  },
  {
    item_id: 5,
    project_id: 1,
    work_order_id: 2,
    location_id: 6,
    description: "Tile Installation",
    item_code: "TI-001",
    unit_of_measure: "sq ft",
    unit_price: 18,
    original_quantity: 100,
    actual_quantity: 95,
    total_price: 1800,
    actual_total_price: 1710,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    notes: "Reduced area due to shower size adjustment",
    created_at: "2025-03-01T10:30:00Z",
    updated_at: "2025-03-20T16:00:00Z",
    category: "GENERAL",
    specifications: "Ceramic tile, 12x12 inch, slip-resistant",
    vendor_id: 3,
    vendor_name: "Tile & Stone Supply Co.",
    purchase_order_id: 2005,
    purchase_order_number: "PO-2005",
    balance: 0,
    received_quantity: 95,
  },
  {
    item_id: 6,
    project_id: 1,
    work_order_id: 3,
    location_id: 3,
    description: "Plumbing Fixtures",
    item_code: "PF-001",
    unit_of_measure: "each",
    unit_price: 350,
    original_quantity: 5,
    actual_quantity: 5,
    total_price: 1750,
    actual_total_price: 1750,
    status: "pending",
    qc_approval_status: "pending",
    supervisor_approval_status: "pending",
    accountant_approval_status: "pending",
    notes: "High-end fixtures for kitchen",
    created_at: "2025-03-15T09:00:00Z",
    updated_at: "2025-03-15T09:00:00Z",
    category: "PLUMBING",
    specifications: "Brushed nickel finish, water-saving design",
    vendor_id: 4,
    vendor_name: "Premium Plumbing Supply",
    purchase_order_id: 2006,
    purchase_order_number: "PO-2006",
    balance: 1750,
    received_quantity: 0,
  },
  // Add payment items for UUID projects
  {
    item_id: 7,
    project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96", // Smith Residence Renovation
    work_order_id: 1,
    location_id: 1,
    description: "Bathroom Tile Installation",
    item_code: "BT-001",
    unit_of_measure: "sq ft",
    unit_price: 15,
    original_quantity: 120,
    actual_quantity: 120,
    total_price: 1800,
    actual_total_price: 1800,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    notes: "Premium ceramic tiles installed",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-20T16:30:00Z",
    category: "GENERAL",
    specifications: "12x12 ceramic tiles with waterproof grout",
    vendor_id: 1,
    vendor_name: "Tile Masters Inc.",
    purchase_order_id: 2007,
    purchase_order_number: "PO-2007",
    balance: 0,
    received_quantity: 120,
  },
  {
    item_id: 8,
    project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96", // Smith Residence Renovation
    work_order_id: 2,
    location_id: 2,
    description: "Kitchen Countertops",
    item_code: "KC-002",
    unit_of_measure: "linear ft",
    unit_price: 85,
    original_quantity: 25,
    actual_quantity: 25,
    total_price: 2125,
    actual_total_price: 2125,
    status: "in_progress",
    qc_approval_status: "pending",
    supervisor_approval_status: "approved",
    accountant_approval_status: "pending",
    notes: "Granite countertops with undermount sink cutout",
    created_at: "2025-01-20T09:00:00Z",
    updated_at: "2025-01-25T14:00:00Z",
    category: "GENERAL",
    specifications: "Black granite with polished finish",
    vendor_id: 2,
    vendor_name: "Stone Works LLC",
    purchase_order_id: 2008,
    purchase_order_number: "PO-2008",
    balance: 2125,
    received_quantity: 0,
  },
  {
    item_id: 9,
    project_id: "880e8400-e29b-41d4-a716-446655440001", // Downtown Office Building
    work_order_id: 1,
    location_id: 1,
    description: "Office Carpet Installation",
    item_code: "OC-001",
    unit_of_measure: "sq ft",
    unit_price: 8,
    original_quantity: 500,
    actual_quantity: 500,
    total_price: 4000,
    actual_total_price: 4000,
    status: "completed",
    qc_approval_status: "approved",
    supervisor_approval_status: "approved",
    accountant_approval_status: "approved",
    notes: "Commercial grade carpet with padding",
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-10T17:00:00Z",
    category: "GENERAL",
    specifications: "Low-pile commercial carpet, stain resistant",
    vendor_id: 3,
    vendor_name: "Commercial Flooring Co.",
    purchase_order_id: 2009,
    purchase_order_number: "PO-2009",
    balance: 0,
    received_quantity: 500,
  },
  {
    item_id: 10,
    project_id: "880e8400-e29b-41d4-a716-446655440002", // City Park Pavilion
    work_order_id: 1,
    location_id: 1,
    description: "Outdoor Lighting Fixtures",
    item_code: "OL-001",
    unit_of_measure: "each",
    unit_price: 125,
    original_quantity: 12,
    actual_quantity: 12,
    total_price: 1500,
    actual_total_price: 1500,
    status: "pending",
    qc_approval_status: "pending",
    supervisor_approval_status: "pending",
    accountant_approval_status: "pending",
    notes: "Weather-resistant LED fixtures",
    created_at: "2025-02-15T11:00:00Z",
    updated_at: "2025-02-15T11:00:00Z",
    category: "ELECTRICAL",
    specifications: "IP65 rated LED fixtures with motion sensors",
    vendor_id: 4,
    vendor_name: "Outdoor Lighting Solutions",
    purchase_order_id: 2010,
    purchase_order_number: "PO-2010",
    balance: 1500,
    received_quantity: 0,
  },
  // Add payment items for the test project
  {
    item_id: 11,
    project_id: "6d85162b-93c3-4f3e-ad29-cbc43a270eb8", // Test Project for Payment Items
    work_order_id: 1,
    location_id: 7,
    description: "Test Payment Item 1",
    item_code: "TEST-001",
    unit_of_measure: "each",
    unit_price: 100,
    original_quantity: 5,
    actual_quantity: 5,
    total_price: 500,
    actual_total_price: 500,
    status: "pending",
    qc_approval_status: "pending",
    supervisor_approval_status: "pending",
    accountant_approval_status: "pending",
    notes: "Test payment item for debugging",
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T10:00:00Z",
    category: "GENERAL",
    specifications: "Test specifications",
    vendor_id: 1,
    vendor_name: "Test Vendor",
    purchase_order_id: 2011,
    purchase_order_number: "PO-2011",
    balance: 500,
    received_quantity: 0,
  },
  {
    item_id: 12,
    project_id: "6d85162b-93c3-4f3e-ad29-cbc43a270eb8", // Test Project for Payment Items
    work_order_id: 2,
    location_id: 8,
    description: "Test Payment Item 2",
    item_code: "TEST-002",
    unit_of_measure: "sq ft",
    unit_price: 25,
    original_quantity: 20,
    actual_quantity: 20,
    total_price: 500,
    actual_total_price: 500,
    status: "in_progress",
    qc_approval_status: "approved",
    supervisor_approval_status: "pending",
    accountant_approval_status: "pending",
    notes: "Another test payment item",
    created_at: "2025-01-02T10:00:00Z",
    updated_at: "2025-01-02T10:00:00Z",
    category: "ELECTRICAL",
    specifications: "Test electrical specifications",
    vendor_id: 2,
    vendor_name: "Test Electrical Co.",
    purchase_order_id: 2012,
    purchase_order_number: "PO-2012",
    balance: 500,
    received_quantity: 0,
  },
];
