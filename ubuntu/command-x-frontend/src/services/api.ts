import axios, { AxiosRequestConfig } from "axios";

// Define base URLs for your microservices
// These might come from environment variables in a real setup
const USER_SERVICE_URL = "http://localhost:3001/api"; // User service runs on 3001
const PROJECT_SERVICE_URL = "http://localhost:3002/api"; // Project service runs on 3002
const WORK_ORDER_SERVICE_URL = "http://localhost:3003/api"; // Work order service runs on 3003
const FINANCIAL_SERVICE_URL = "http://localhost:3004/api"; // Financial service runs on 3004
const DOCUMENT_SERVICE_URL = "http://localhost:3005/api"; // Document service runs on 3005
const QUALITY_SERVICE_URL = "http://localhost:3006/api"; // Quality service runs on 3006

// Create base Axios instance
const apiClient = axios.create({
  // You might set a common base URL if using an API Gateway
  baseURL: "http://localhost:3000/api", // Updated to use the work-order-service endpoint
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a mock adapter to simulate API responses
const USE_MOCK_DATA = true; // Set to true to use mock data for work orders and other services

// Mock database for storing data when using mock mode
const mockDB = {
  projects: [
    {
      project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96",
      project_name: "Smith Residence Renovation",
      location: "123 Main St, Anytown, USA",
      client_name: "John Smith",
      start_date: "2025-01-15",
      end_date: "2025-06-30",
      budget: 350000,
      status: "In Progress",
      description:
        "Complete renovation of a 3,500 sq ft residential property including kitchen, bathrooms, and exterior work.",
      progress_percentage: 45,
      priority: "Medium",
      category: "Residential",
      manager_id: 1,
      manager_name: "Sarah Johnson",
      team_members: [
        { id: 2, name: "Mike Wilson", role: "Site Supervisor" },
        { id: 3, name: "Lisa Chen", role: "Interior Designer" },
      ],
      actual_cost: 158000,
      estimated_hours: 1200,
      actual_hours: 540,
      created_at: "2024-12-20T08:30:00Z",
      updated_at: "2025-02-15T14:45:00Z",
      tags: ["renovation", "residential", "high-end"],
      risk_level: "Low",
      // Accounting-related fields
      budget_utilization: 45.1,
      total_invoiced: 175000,
      total_paid: 158000,
      outstanding_balance: 17000,
      retainage_held: 8750,
      payment_terms: "Net 30",
      contract_number: "CONT-2025-001",
      contract_type: "Fixed Price",
      change_orders_count: 2,
      change_orders_value: 15000,
    },
    {
      project_id: "880e8400-e29b-41d4-a716-446655440001",
      project_name: "Downtown Office Building",
      location: "456 Commerce Ave, Anytown, USA",
      client_name: "ABC Corporation",
      start_date: "2025-02-01",
      end_date: "2026-03-15",
      budget: 1500000,
      status: "In Progress",
      description:
        "Construction of a new 5-story office building with underground parking and LEED certification requirements.",
      progress_percentage: 25,
      priority: "High",
      category: "Commercial",
      manager_id: 4,
      manager_name: "Robert Taylor",
      team_members: [
        { id: 5, name: "James Rodriguez", role: "Project Engineer" },
        { id: 6, name: "Emily Parker", role: "Sustainability Consultant" },
        { id: 7, name: "David Kim", role: "Structural Engineer" },
      ],
      actual_cost: 375000,
      estimated_hours: 8500,
      actual_hours: 2125,
      created_at: "2025-01-10T10:15:00Z",
      updated_at: "2025-02-20T16:30:00Z",
      tags: ["commercial", "new-construction", "LEED"],
      risk_level: "Medium",
      // Accounting-related fields
      budget_utilization: 25.0,
      total_invoiced: 400000,
      total_paid: 375000,
      outstanding_balance: 25000,
      retainage_held: 20000,
      payment_terms: "Net 45",
      contract_number: "CONT-2025-002",
      contract_type: "Cost Plus",
      change_orders_count: 1,
      change_orders_value: 75000,
    },
    {
      project_id: "880e8400-e29b-41d4-a716-446655440002",
      project_name: "City Park Pavilion",
      location: "789 Park Rd, Anytown, USA",
      client_name: "Anytown Municipality",
      start_date: "2025-03-10",
      end_date: "2025-08-30",
      budget: 250000,
      status: "In Progress",
      description:
        "Construction of an outdoor pavilion with restrooms, picnic areas, and landscaping for the city's central park.",
      progress_percentage: 15,
      priority: "Medium",
      category: "Municipal",
      manager_id: 8,
      manager_name: "Jessica Adams",
      team_members: [
        { id: 9, name: "Thomas Wright", role: "Landscape Architect" },
        { id: 10, name: "Sophia Martinez", role: "Civil Engineer" },
      ],
      actual_cost: 37500,
      estimated_hours: 950,
      actual_hours: 142,
      created_at: "2025-02-15T09:00:00Z",
      updated_at: "2025-03-12T11:20:00Z",
      tags: ["municipal", "outdoor", "public-space"],
      risk_level: "Low",
      // Accounting-related fields
      budget_utilization: 15.0,
      total_invoiced: 40000,
      total_paid: 37500,
      outstanding_balance: 2500,
      retainage_held: 2000,
      payment_terms: "Net 30",
      contract_number: "CONT-2025-003",
      contract_type: "Fixed Price",
      change_orders_count: 0,
      change_orders_value: 0,
    },
    {
      project_id: "880e8400-e29b-41d4-a716-446655440003",
      project_name: "Riverside Apartments",
      location: "321 River View Dr, Anytown, USA",
      client_name: "Riverfront Development LLC",
      start_date: "2025-01-05",
      end_date: "2026-05-20",
      budget: 4200000,
      status: "Planning",
      description:
        "Development of a 48-unit luxury apartment complex with riverside views, including amenities and parking structure.",
      progress_percentage: 5,
      priority: "High",
      category: "Residential",
      manager_id: 11,
      manager_name: "Daniel Brown",
      team_members: [
        { id: 12, name: "Olivia Wilson", role: "Architect" },
        { id: 13, name: "Nathan Lee", role: "MEP Engineer" },
      ],
      actual_cost: 210000,
      estimated_hours: 15000,
      actual_hours: 750,
      created_at: "2024-11-30T14:00:00Z",
      updated_at: "2025-01-10T09:45:00Z",
      tags: ["residential", "multi-family", "luxury"],
      risk_level: "Medium",
      // Accounting-related fields
      budget_utilization: 5.0,
      total_invoiced: 210000,
      total_paid: 210000,
      outstanding_balance: 0,
      retainage_held: 0,
      payment_terms: "Net 30",
      contract_number: "CONT-2025-004",
      contract_type: "Cost Plus",
      change_orders_count: 0,
      change_orders_value: 0,
    },
    {
      project_id: "880e8400-e29b-41d4-a716-446655440004",
      project_name: "Highway 7 Bridge Repair",
      location: "Highway 7, Anytown County",
      client_name: "State Transportation Department",
      start_date: "2025-04-15",
      end_date: "2025-07-30",
      budget: 850000,
      status: "Pending",
      description:
        "Structural repairs and resurfacing of the Highway 7 bridge spanning the Anytown River.",
      progress_percentage: 0,
      priority: "Critical",
      category: "Infrastructure",
      manager_id: 14,
      manager_name: "Christopher Johnson",
      team_members: [],
      actual_cost: 0,
      estimated_hours: 2800,
      actual_hours: 0,
      created_at: "2025-02-28T11:30:00Z",
      updated_at: "2025-02-28T11:30:00Z",
      tags: ["infrastructure", "bridge", "public", "repair"],
      risk_level: "High",
      // Accounting-related fields
      budget_utilization: 0.0,
      total_invoiced: 0,
      total_paid: 0,
      outstanding_balance: 0,
      retainage_held: 0,
      payment_terms: "Net 60",
      contract_number: "CONT-2025-005",
      contract_type: "Unit Price",
      change_orders_count: 0,
      change_orders_value: 0,
    },
    {
      project_id: "6d85162b-93c3-4f3e-ad29-cbc43a270eb8",
      project_name: "Test Project for Payment Items",
      location: "123 Test St, Test City, USA",
      client_name: "Test Client",
      start_date: "2025-01-01",
      end_date: "2025-12-31",
      budget: 500000,
      status: "In Progress",
      description: "Test project for payment items functionality",
      progress_percentage: 30,
      priority: "Medium",
      category: "Residential",
      manager_id: 1,
      manager_name: "John Smith",
      team_members: [],
      actual_cost: 150000,
      estimated_hours: 2000,
      actual_hours: 600,
      created_at: "2025-01-01T08:00:00Z",
      updated_at: "2025-01-15T12:00:00Z",
      tags: ["test", "residential"],
      risk_level: "Low",
      // Accounting-related fields
      budget_utilization: 30.0,
      total_invoiced: 150000,
      total_paid: 135000,
      outstanding_balance: 15000,
      retainage_held: 7500,
      payment_terms: "Net 30",
      contract_number: "CONT-2025-006",
      contract_type: "Fixed Price",
      change_orders_count: 0,
      change_orders_value: 0,
    },
  ],
  workOrders: [
    {
      work_order_id: 1,
      project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96", // Smith Residence Renovation
      description: "Foundation Work",
      status: "In Progress",
      scheduled_date: "2025-02-15",
      completion_date: "2025-02-28",
      estimated_cost: 45000,
      actual_cost: 47500,
      assigned_subcontractor_id: 1,
      amount_billed: 47500,
      amount_paid: 42750,
      retainage_percentage: 10,
      payment_status: "Partially Paid",
      invoice_number: "INV-2025-001",
      invoice_date: "2025-03-01",
      payment_date: "2025-03-15",
      payment_method: "Wire Transfer",
      payment_reference: "WT-12345",
      created_at: "2025-02-10T08:30:00Z",
      updated_at: "2025-03-01T14:45:00Z",
    },
    {
      work_order_id: 2,
      project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96", // Smith Residence Renovation
      description: "Framing",
      status: "Completed",
      scheduled_date: "2025-03-01",
      completion_date: "2025-03-20",
      estimated_cost: 35000,
      actual_cost: 34200,
      assigned_subcontractor_id: 2,
      amount_billed: 34200,
      amount_paid: 34200,
      retainage_percentage: 5,
      payment_status: "Paid",
      invoice_number: "INV-2025-002",
      invoice_date: "2025-03-25",
      payment_date: "2025-04-10",
      payment_method: "Check",
      payment_reference: "CHK-6789",
      created_at: "2025-02-25T10:15:00Z",
      updated_at: "2025-04-10T16:30:00Z",
    },
    {
      work_order_id: 3,
      project_id: "880e8400-e29b-41d4-a716-446655440001", // Downtown Office Building
      description: "Electrical Installation",
      status: "In Progress",
      scheduled_date: "2025-04-10",
      completion_date: null,
      estimated_cost: 28000,
      actual_cost: 15000,
      assigned_subcontractor_id: 3,
      amount_billed: 15000,
      amount_paid: 0,
      retainage_percentage: 10,
      payment_status: "Unpaid",
      invoice_number: "INV-2025-003",
      invoice_date: "2025-04-15",
      payment_date: null,
      payment_method: null,
      payment_reference: null,
      created_at: "2025-04-05T09:00:00Z",
      updated_at: "2025-04-15T11:20:00Z",
    },
    {
      work_order_id: 4,
      project_id: "880e8400-e29b-41d4-a716-446655440001", // Downtown Office Building
      description: "HVAC Installation",
      status: "Completed",
      scheduled_date: "2025-03-15",
      completion_date: "2025-04-05",
      estimated_cost: 42000,
      actual_cost: 43500,
      assigned_subcontractor_id: 4,
      amount_billed: 43500,
      amount_paid: 39150,
      retainage_percentage: 10,
      payment_status: "Partially Paid",
      invoice_number: "INV-2025-004",
      invoice_date: "2025-04-10",
      payment_date: "2025-04-25",
      payment_method: "ACH",
      payment_reference: "ACH-5432",
      created_at: "2025-03-10T14:00:00Z",
      updated_at: "2025-04-25T09:45:00Z",
    },
    {
      work_order_id: 5,
      project_id: "880e8400-e29b-41d4-a716-446655440002", // City Park Pavilion
      description: "Site Preparation",
      status: "Completed",
      scheduled_date: "2025-03-10",
      completion_date: "2025-03-25",
      estimated_cost: 18000,
      actual_cost: 17500,
      assigned_subcontractor_id: 5,
      amount_billed: 17500,
      amount_paid: 17500,
      retainage_percentage: 0,
      payment_status: "Paid",
      invoice_number: "INV-2025-005",
      invoice_date: "2025-03-30",
      payment_date: "2025-04-15",
      payment_method: "Wire Transfer",
      payment_reference: "WT-7890",
      created_at: "2025-03-05T11:30:00Z",
      updated_at: "2025-04-15T15:20:00Z",
    },
    {
      work_order_id: 6,
      project_id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96", // Smith Residence Renovation
      description: "Multi-Contractor Kitchen Renovation",
      status: "In Progress",
      scheduled_date: "2025-05-01",
      completion_date: null,
      estimated_cost: 75000,
      actual_cost: null,
      assigned_subcontractor_id: null,
      amount_billed: 0,
      amount_paid: 0,
      retainage_percentage: 10,
      payment_status: "Pending",
      invoice_number: null,
      invoice_date: null,
      payment_date: null,
      payment_method: null,
      payment_reference: null,
      created_at: "2025-04-20T10:00:00Z",
      updated_at: "2025-04-20T10:00:00Z",
      contractor_assignments: [
        {
          assignment_id: 1,
          work_order_id: 6,
          subcontractor_id: 1,
          allocation_percentage: 60,
          allocation_amount: 45000,
          role_description: "Electrical work and lighting installation",
          company_name: "Elite Electrical Services",
          contact_name: "John Doe",
        },
        {
          assignment_id: 2,
          work_order_id: 6,
          subcontractor_id: 2,
          allocation_percentage: 40,
          allocation_amount: 30000,
          role_description: "Plumbing and fixture installation",
          company_name: "Premier Plumbing Co.",
          contact_name: "Jane Smith",
        },
      ],
    },
    // Work orders for test project
    {
      work_order_id: 7,
      project_id: "85b7f467-a860-4962-b645-51ea950b526f", // Test project
      description: "Electrical Installation",
      status: "Pending",
      scheduled_date: "2025-03-01",
      completion_date: null,
      estimated_cost: 25000,
      actual_cost: 0,
      assigned_subcontractor_id: 1,
      amount_billed: 0,
      amount_paid: 0,
      retainage_percentage: 10,
      payment_status: "Not Billed",
      created_at: "2025-02-20T10:00:00Z",
      updated_at: "2025-02-20T10:00:00Z",
    },
    {
      work_order_id: 8,
      project_id: "85b7f467-a860-4962-b645-51ea950b526f", // Test project
      description: "Plumbing Rough-in",
      status: "In Progress",
      scheduled_date: "2025-03-05",
      completion_date: null,
      estimated_cost: 18000,
      actual_cost: 5000,
      assigned_subcontractor_id: 2,
      amount_billed: 0,
      amount_paid: 0,
      retainage_percentage: 10,
      payment_status: "Not Billed",
      created_at: "2025-02-22T09:30:00Z",
      updated_at: "2025-02-25T14:15:00Z",
    },
    {
      work_order_id: 9,
      project_id: "85b7f467-a860-4962-b645-51ea950b526f", // Test project
      description: "HVAC Installation",
      status: "Completed",
      scheduled_date: "2025-02-15",
      completion_date: "2025-02-28",
      estimated_cost: 32000,
      actual_cost: 31500,
      assigned_subcontractor_id: 3,
      amount_billed: 31500,
      amount_paid: 28350,
      retainage_percentage: 10,
      payment_status: "Partially Paid",
      created_at: "2025-02-10T11:00:00Z",
      updated_at: "2025-03-01T16:45:00Z",
    },
  ],
  subcontractors: [
    {
      subcontractor_id: 1,
      company_name: "Elite Electrical Services",
      contact_name: "John Doe",
      email: "john@eliteelectrical.com",
      phone: "555-123-4567",
      trade: "Electrical",
      insurance_expiry: "2025-12-31",
      license_number: "EL-12345",
      status: "Active",
      address: "456 Circuit Ave, Anytown, USA",
      rating: 4.8,
      notes: "Preferred electrical contractor for all projects",
      created_at: "2024-12-15T10:30:00Z",
      updated_at: "2025-01-10T14:45:00Z",
      active_work_orders: 2,
      completed_work_orders: 5,
      total_paid: 87500,
    },
    {
      subcontractor_id: 2,
      company_name: "Premier Plumbing Co.",
      contact_name: "Jane Smith",
      email: "jane@premierplumbing.com",
      phone: "555-987-6543",
      trade: "Plumbing",
      insurance_expiry: "2025-10-15",
      license_number: "PL-54321",
      status: "Active",
      address: "789 Water Way, Anytown, USA",
      rating: 4.5,
      notes: "Specializes in high-end residential plumbing",
      created_at: "2024-12-20T09:15:00Z",
      updated_at: "2025-01-15T11:30:00Z",
      active_work_orders: 1,
      completed_work_orders: 3,
      total_paid: 62000,
    },
    {
      subcontractor_id: 3,
      company_name: "Concrete Masters",
      contact_name: "Mike Johnson",
      email: "mike@concretemaster.com",
      phone: "555-456-7890",
      trade: "Concrete",
      insurance_expiry: "2025-08-22",
      license_number: "CM-98765",
      status: "Active",
      address: "123 Foundation Blvd, Anytown, USA",
      rating: 4.7,
      notes: "Excellent for large commercial foundations",
      created_at: "2025-01-05T08:45:00Z",
      updated_at: "2025-01-25T16:20:00Z",
      active_work_orders: 1,
      completed_work_orders: 2,
      total_paid: 45000,
    },
    {
      subcontractor_id: 4,
      company_name: "Skyline HVAC Solutions",
      contact_name: "Robert Chen",
      email: "robert@skylinehvac.com",
      phone: "555-789-1234",
      trade: "HVAC",
      insurance_expiry: "2025-11-30",
      license_number: "HVAC-7890",
      status: "Active",
      address: "567 Climate Control Dr, Anytown, USA",
      rating: 4.6,
      notes: "Specializes in energy-efficient systems",
      created_at: "2025-01-10T13:20:00Z",
      updated_at: "2025-02-05T10:15:00Z",
      active_work_orders: 1,
      completed_work_orders: 1,
      total_paid: 39150,
    },
    {
      subcontractor_id: 5,
      company_name: "Green Landscape Design",
      contact_name: "Sarah Williams",
      email: "sarah@greenlandscape.com",
      phone: "555-234-5678",
      trade: "Landscaping",
      insurance_expiry: "2025-09-15",
      license_number: "LS-4567",
      status: "Active",
      address: "890 Garden Path, Anytown, USA",
      rating: 4.9,
      notes: "Sustainable landscaping practices",
      created_at: "2025-01-15T11:45:00Z",
      updated_at: "2025-02-10T09:30:00Z",
      active_work_orders: 0,
      completed_work_orders: 1,
      total_paid: 17500,
    },
    {
      subcontractor_id: 6,
      company_name: "Precision Drywall Inc.",
      contact_name: "David Martinez",
      email: "david@precisiondrywall.com",
      phone: "555-345-6789",
      trade: "Drywall",
      insurance_expiry: "2025-07-10",
      license_number: "DW-2345",
      status: "Inactive",
      address: "432 Wall Street, Anytown, USA",
      rating: 3.8,
      notes: "Currently inactive due to quality concerns",
      created_at: "2025-01-20T14:30:00Z",
      updated_at: "2025-02-15T15:45:00Z",
      active_work_orders: 0,
      completed_work_orders: 1,
      total_paid: 12500,
    },
    {
      subcontractor_id: 7,
      company_name: "Sunrise Painting",
      contact_name: "Lisa Thompson",
      email: "lisa@sunrisepainting.com",
      phone: "555-456-7890",
      trade: "Painting",
      insurance_expiry: "2025-06-30",
      license_number: "PT-3456",
      status: "Active",
      address: "765 Color Ave, Anytown, USA",
      rating: 4.4,
      notes: "Excellent for interior finishes",
      created_at: "2025-01-25T10:15:00Z",
      updated_at: "2025-02-20T13:20:00Z",
      active_work_orders: 0,
      completed_work_orders: 0,
      total_paid: 0,
    },
  ],
};

// Add a request interceptor to include the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage or state management
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling common errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      console.error("Unauthorized access - redirecting to login");
      localStorage.removeItem("authToken");
      // Potentially dispatch a logout action if using Redux
      // window.location.href = '/login'; // Or use react-router history
    }
    return Promise.reject(error);
  }
);

// --- Authentication API Calls ---

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    user_id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    first_name?: string;
    last_name?: string;
  };
}

// Mock user database for authentication when using mock data
const mockUsers = [
  {
    user_id: 1,
    username: "admin",
    password: "admin123", // In a real app, passwords would be hashed
    email: "admin@commandx.com",
    role: "Admin",
    status: "Active",
    created_at: "2025-01-01T00:00:00Z",
    first_name: "Admin",
    last_name: "User",
  },
  {
    user_id: 2,
    username: "project_manager",
    password: "manager123",
    email: "pm@commandx.com",
    role: "ProjectManager",
    status: "Active",
    created_at: "2025-01-02T00:00:00Z",
    first_name: "Project",
    last_name: "Manager",
  },
  {
    user_id: 3,
    username: "field_staff",
    password: "field123",
    email: "field@commandx.com",
    role: "FieldStaff",
    status: "Active",
    created_at: "2025-01-03T00:00:00Z",
    first_name: "Field",
    last_name: "Staff",
  },
  {
    user_id: 4,
    username: "finance_user",
    password: "finance123",
    email: "finance@commandx.com",
    role: "Finance",
    status: "Active",
    created_at: "2025-01-04T00:00:00Z",
    first_name: "Finance",
    last_name: "User",
  },
  {
    user_id: 5,
    username: "inactive_user",
    password: "inactive123",
    email: "inactive@commandx.com",
    role: "FieldStaff",
    status: "Inactive",
    created_at: "2025-01-05T00:00:00Z",
    first_name: "Inactive",
    last_name: "User",
  },
];

export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const { username, password } = credentials;

  console.log("Login attempt with:", { username, password: "***" });

  // Special case for admin@example.com - works regardless of USE_MOCK_DATA setting
  if (
    (username === "admin@example.com" || username === "admin") &&
    password === "admin123"
  ) {
    console.log("Admin login successful");

    // Create admin user
    const adminUser = {
      user_id: 1,
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
      role: "admin",
      status: "Active",
      created_at: "2025-01-01T00:00:00Z",
      first_name: "Admin",
      last_name: "User",
    };

    // Create a mock token
    const token = `mock-jwt-token-admin-${Date.now()}`;

    // Store token in localStorage
    localStorage.setItem("authToken", token);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = adminUser;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  if (USE_MOCK_DATA) {
    // Simulate login with mock data for other users

    console.log(
      "Available mock users:",
      mockUsers.map((u) => ({
        username: u.username,
        password: u.password,
        role: u.role,
      }))
    );

    // Find user in mock database
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      console.error("Login failed: Invalid credentials");
      // Simulate authentication failure
      return Promise.reject({
        response: {
          status: 401,
          data: { message: "Invalid credentials" },
        },
      });
    }

    console.log("Login successful for user:", user.username);

    // Create a mock token (in a real app this would be a JWT)
    const token = `mock-jwt-token-${user.username}-${Date.now()}`;

    // Store token in localStorage
    localStorage.setItem("authToken", token);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  try {
    // Real API call
    const response = await apiClient.post("/api/auth/login", credentials);

    // Store token in localStorage
    const { token } = response.data;
    localStorage.setItem("authToken", token);

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = (): void => {
  // Remove token from localStorage
  localStorage.removeItem("authToken");
};

export const getUserRole = async (): Promise<string> => {
  if (USE_MOCK_DATA) {
    // For mock data, return a default role
    // In a real app, this would decode the JWT token or make an API call
    return "admin"; // Default to admin for testing
  }

  try {
    // In a real app, this would make an API call to get the user's role
    const response = await apiClient.get("/api/auth/me");
    return response.data.role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user"; // Default role if there's an error
  }
};

// Export instances for each service (or use the base apiClient and specify full path)
// export const userServiceApi = axios.create({ baseURL: USER_SERVICE_URL });
// export const projectServiceApi = axios.create({ baseURL: PROJECT_SERVICE_URL });
// export const workOrderServiceApi = axios.create({ baseURL: WORK_ORDER_SERVICE_URL });
// export const financialServiceApi = axios.create({ baseURL: FINANCIAL_SERVICE_URL });
// export const documentServiceApi = axios.create({ baseURL: DOCUMENT_SERVICE_URL });
// export const qualityServiceApi = axios.create({ baseURL: QUALITY_SERVICE_URL });

// Apply interceptors to the base apiClient instance
// [userServiceApi, projectServiceApi, workOrderServiceApi, financialServiceApi, documentServiceApi, qualityServiceApi].forEach(instance => {
//     instance.interceptors.request.use(
//         (config) => {
//             const token = localStorage.getItem("authToken");
//             if (token) {
//                 config.headers.Authorization = `Bearer ${token}`;
//             }
//             return config;
//         },
//         (error) => Promise.reject(error)
//     );
//     instance.interceptors.response.use(
//         (response) => response,
//         (error) => {
//              if (error.response && error.response.status === 401) {
//                 console.error("Unauthorized access - redirecting to login");
//                 localStorage.removeItem("authToken");
//                 // Potentially dispatch logout action
//                 // Consider redirecting using router history
//             }
//             return Promise.reject(error);
//         }
//     );
// });

// --- Dashboard Specific API Calls ---

export const getDashboardSummary = async () => {
  try {
    if (USE_MOCK_DATA) {
      // Return mock dashboard data
      return {
        projectCount: 3,
        activeWorkOrders: 3,
        openIssuesCount: 2,
      };
    }

    // Fetch data concurrently using apiClient with relative paths
    const [projectsRes, workOrdersRes, issuesRes] = await Promise.all([
      apiClient.get("/api/projects"), // Assuming this returns all projects
      apiClient.get("/api/workorders"), // Assuming this returns all work orders
      apiClient.get("/api/quality/issues?status=Open"), // Corrected path for issues
    ]);

    // Process data (example counts)
    const projectCount = projectsRes.data?.length || 0;
    const activeWorkOrders =
      workOrdersRes.data?.filter(
        (wo: any) => wo.status !== "Completed" && wo.status !== "Cancelled"
      ).length || 0;
    const openIssuesCount = issuesRes.data?.length || 0;

    // You might fetch more detailed data like recent activity, financial summaries etc.

    return {
      projectCount,
      activeWorkOrders,
      openIssuesCount,
      // Add more summary data here
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    // Return mock data as fallback instead of throwing
    return {
      projectCount: 3,
      activeWorkOrders: 3,
      openIssuesCount: 2,
    };
  }
};

// --- Project API Calls ---

export interface ProjectData {
  project_id?: number;
  project_name: string;
  location?: string;
  client_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
  status?: string;
  description?: string;
  progress_percentage?: number;
  priority?: "Low" | "Medium" | "High" | "Critical";
  category?: string;
  manager_id?: number;
  manager_name?: string;
  team_members?: { id: number; name: string; role: string }[];
  actual_cost?: number;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
  risk_level?: "Low" | "Medium" | "High";
  notes?: string;
  // Accounting-related fields
  budget_utilization?: number;
  total_invoiced?: number;
  total_paid?: number;
  outstanding_balance?: number;
  retainage_held?: number;
  payment_terms?: string;
  contract_number?: string;
  contract_type?: string;
  change_orders_count?: number;
  change_orders_value?: number;
}

export const getProjects = async () => {
  if (USE_MOCK_DATA) {
    // Return projects from our mock database
    console.log("Fetching projects from mock DB:", mockDB.projects.length);
    return [...mockDB.projects]; // Return a copy to prevent direct modification
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.get("/api/projects");
  return response.data;
};

export const getProjectById = async (projectId: string | number) => {
  console.log(
    `🔍 getProjectById called with ID: ${projectId}, type: ${typeof projectId}`
  );
  console.log(`🔍 USE_MOCK_DATA: ${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    console.log(`🔍 Using mock data, searching for project ID ${projectId}`);
    console.log(
      `🔍 Available projects:`,
      mockDB.projects.map((p) => ({ id: p.project_id, name: p.project_name }))
    );

    // Find the project in our mock database - handle both string and number IDs
    const project = mockDB.projects.find(
      (p) => p.project_id === String(projectId)
    );

    console.log(
      `🔍 Found project:`,
      project
        ? { id: project.project_id, name: project.project_name }
        : "NOT FOUND"
    );

    if (!project) {
      console.error(`🔍 Project with ID ${projectId} not found`);
      const error = new Error(`Project with ID ${projectId} not found`);
      console.log(`🔍 Throwing error:`, error);
      throw error;
    }

    // Simulate a delay for the API call
    console.log(`🔍 Simulating API delay...`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log(`🔍 Returning project:`, {
      id: project.project_id,
      name: project.project_name,
    });
    return { ...project }; // Return a copy to prevent direct modification
  }

  // If not using mock data, make the actual API call
  console.log(
    `🔍 Making real API call to: ${PROJECT_SERVICE_URL}/projects/${projectId}`
  );
  try {
    const response = await axios.get(
      `${PROJECT_SERVICE_URL}/projects/${projectId}`
    );
    console.log(`🔍 API response:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`🔍 API call failed:`, error);
    throw error;
  }
};

export const createProject = async (projectData: ProjectData) => {
  if (USE_MOCK_DATA) {
    // Simulate API call with mock data
    console.log("Creating project with mock data:", projectData);

    // Validate required fields
    if (!projectData.project_name) {
      console.error("Missing required field: project_name");
      return Promise.reject({
        response: {
          status: 400,
          data: { message: "Project name is required" },
        },
      });
    }

    // Find the highest project_id to ensure uniqueness
    const maxId = mockDB.projects.reduce(
      (max, project) => Math.max(max, project.project_id || 0),
      0
    );

    // Create a new project with mock data
    const newProject = {
      ...projectData,
      project_id: maxId + 1, // Ensure unique ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Set default values for any missing fields
      status: projectData.status || "Planning",
      progress_percentage: 0,
      actual_cost: 0,
      budget_utilization: 0,
      total_invoiced: 0,
      total_paid: 0,
      outstanding_balance: 0,
      retainage_held: 0,
    };

    // Add the new project to our mock database
    mockDB.projects.push(newProject);

    console.log("Project created successfully:", newProject);
    console.log("Updated mock DB projects count:", mockDB.projects.length);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return newProject;
  }

  // If not using mock data, make the actual API call
  const response = await axios.post(
    `${PROJECT_SERVICE_URL}/projects`,
    projectData
  );
  return response.data;
};

export const updateProject = async (
  projectId: number,
  projectData: ProjectData
) => {
  if (USE_MOCK_DATA) {
    console.log(`Updating project ${projectId} with data:`, projectData);

    // Find the project in our mock database
    const projectIndex = mockDB.projects.findIndex(
      (p) => p.project_id === projectId
    );

    if (projectIndex === -1) {
      console.error(`Project with ID ${projectId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Project not found" },
        },
      });
    }

    // Update the project
    const updatedProject = {
      ...mockDB.projects[projectIndex],
      ...projectData,
      updated_at: new Date().toISOString(),
    };

    // Replace the old project with the updated one
    mockDB.projects[projectIndex] = updatedProject;

    console.log("Project updated successfully:", updatedProject);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return updatedProject;
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.put(
    `/api/projects/${projectId}`,
    projectData
  );
  return response.data;
};

export const deleteProject = async (projectId: number) => {
  if (USE_MOCK_DATA) {
    console.log(`Deleting project ${projectId}`);

    // Find the project in our mock database
    const projectIndex = mockDB.projects.findIndex(
      (p) => p.project_id === projectId
    );

    if (projectIndex === -1) {
      console.error(`Project with ID ${projectId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Project not found" },
        },
      });
    }

    // Remove the project from our mock database
    const deletedProject = mockDB.projects.splice(projectIndex, 1)[0];

    console.log("Project deleted successfully:", deletedProject);
    console.log("Updated mock DB projects count:", mockDB.projects.length);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, message: "Project deleted successfully" };
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.delete(`/api/projects/${projectId}`);
  return response.data; // Or just status
};

// --- Accounting API Calls ---

export interface FinancialSummaryData {
  total_budget: number;
  total_actual_cost: number;
  budget_utilization: number;
  total_invoiced: number;
  total_paid: number;
  outstanding_payments: number;
  total_retainage: number;
}

export const getFinancialSummary = async () => {
  if (USE_MOCK_DATA) {
    // Calculate financial summary from mock projects and work orders
    const projects = await getProjects();
    const workOrders = await getWorkOrders();

    const totalBudget = projects.reduce(
      (sum: number, project: any) => sum + (project.budget || 0),
      0
    );
    const totalActualCost = projects.reduce(
      (sum: number, project: any) => sum + (project.actual_cost || 0),
      0
    );
    const budgetUtilization =
      totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0;

    const totalInvoiced = workOrders.reduce(
      (sum: number, wo: any) => sum + (wo.amount_billed || 0),
      0
    );
    const totalPaid = workOrders.reduce(
      (sum: number, wo: any) => sum + (wo.amount_paid || 0),
      0
    );
    const outstandingPayments = totalInvoiced - totalPaid;

    const totalRetainage = workOrders.reduce((sum: number, wo: any) => {
      const retainageAmount =
        ((wo.amount_billed || 0) * (wo.retainage_percentage || 0)) / 100;
      return sum + retainageAmount;
    }, 0);

    return {
      total_budget: totalBudget,
      total_actual_cost: totalActualCost,
      budget_utilization: budgetUtilization,
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      outstanding_payments: outstandingPayments,
      total_retainage: totalRetainage,
    };
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.get("/api/accounting/summary");
  return response.data;
};

export const getPaymentsByProject = async (projectId: number) => {
  if (USE_MOCK_DATA) {
    // Return mock payment data for the specified project
    const workOrders = await getWorkOrders();
    const projectWorkOrders = workOrders.filter(
      (wo: any) => wo.project_id === projectId
    );

    return projectWorkOrders.map((wo: any) => ({
      payment_id: wo.work_order_id * 10 + 1,
      work_order_id: wo.work_order_id,
      amount: wo.amount_paid || 0,
      payment_date: wo.completion_date || new Date().toISOString(),
      payment_method: ["Check", "Wire Transfer", "ACH", "Credit Card"][
        Math.floor(Math.random() * 4)
      ],
      reference_number: `REF-${Math.floor(Math.random() * 10000)}`,
      notes: `Payment for work order #${wo.work_order_id}`,
    }));
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.get(
    `/api/accounting/projects/${projectId}/payments`
  );
  return response.data;
};

export const getSubcontractorPayments = async (subcontractorId?: number) => {
  if (USE_MOCK_DATA) {
    // Return mock subcontractor payment data
    const workOrders = await getWorkOrders();
    const filteredWorkOrders = subcontractorId
      ? workOrders.filter(
          (wo: any) => wo.assigned_subcontractor_id === subcontractorId
        )
      : workOrders;

    return filteredWorkOrders.map((wo: any) => ({
      payment_id: wo.work_order_id * 10 + 2,
      work_order_id: wo.work_order_id,
      subcontractor_id: wo.assigned_subcontractor_id,
      amount: wo.amount_paid || 0,
      payment_date: wo.completion_date || new Date().toISOString(),
      payment_method: ["Check", "Wire Transfer", "ACH"][
        Math.floor(Math.random() * 3)
      ],
      reference_number: `SUB-${Math.floor(Math.random() * 10000)}`,
      status: ["Pending", "Processed", "Completed"][
        Math.floor(Math.random() * 3)
      ],
      notes: `Payment to subcontractor for work order #${wo.work_order_id}`,
    }));
  }

  // If not using mock data, make the actual API call
  const url = subcontractorId
    ? `/api/accounting/subcontractors/${subcontractorId}/payments`
    : "/api/accounting/subcontractors/payments";
  const response = await apiClient.get(url);
  return response.data;
};

export const getRetainageData = async (projectId?: number) => {
  if (USE_MOCK_DATA) {
    // Return mock retainage data
    const workOrders = await getWorkOrders();
    const filteredWorkOrders = projectId
      ? workOrders.filter((wo: any) => wo.project_id === projectId)
      : workOrders;

    return filteredWorkOrders.map((wo: any) => {
      const retainagePercentage = wo.retainage_percentage || 0;
      const amountBilled = wo.amount_billed || 0;
      const retainageAmount = (amountBilled * retainagePercentage) / 100;

      // Simulate release date (3 months after completion)
      let releaseDate = null;
      if (wo.completion_date) {
        const completionDate = new Date(wo.completion_date);
        releaseDate = new Date(completionDate);
        releaseDate.setMonth(releaseDate.getMonth() + 3);
      }

      return {
        retainage_id: wo.work_order_id * 10 + 3,
        work_order_id: wo.work_order_id,
        project_id: wo.project_id,
        retainage_percentage: retainagePercentage,
        retainage_amount: retainageAmount,
        release_date: releaseDate ? releaseDate.toISOString() : null,
        status:
          releaseDate && new Date() > releaseDate
            ? "Ready for Release"
            : "Holding",
        notes: `Retainage for work order #${wo.work_order_id}`,
      };
    });
  }

  // If not using mock data, make the actual API call
  const url = projectId
    ? `/api/accounting/projects/${projectId}/retainage`
    : "/api/accounting/retainage";
  const response = await apiClient.get(url);
  return response.data;
};

// --- Work Order API Calls ---

export interface LineItemData {
  line_item_id?: number;
  work_order_id?: number;
  description: string;
  quantity?: number | null;
  unit_cost?: number | null;
  status?: string;
}

export interface ContractorAssignment {
  assignment_id?: number;
  work_order_id?: number;
  subcontractor_id: number;
  allocation_percentage: number;
  allocation_amount?: number;
  role_description?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrderData {
  work_order_id?: string;
  project_id: string;
  assigned_subcontractor_id?: string | null;
  description: string;
  status?: string;
  scheduled_date?: string | null;
  completion_date?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  retainage_percentage?: number | null;
  amount_billed?: number | null;
  amount_paid?: number | null;
  payment_status?: string;
  invoice_number?: string;
  invoice_date?: string | null;
  payment_date?: string | null;
  payment_method?: string;
  payment_reference?: string;
  line_items?: LineItemData[]; // Optional, might be fetched separately
  contractor_assignments?: ContractorAssignment[]; // New multi-contractor support
}

export const getWorkOrders = async (projectId?: string | number) => {
  if (USE_MOCK_DATA) {
    console.log("Fetching work orders from mock DB:", mockDB.workOrders.length);

    // Return a copy of the work orders from our mock database
    const workOrders = [...mockDB.workOrders];

    // Filter by project ID if provided
    if (projectId) {
      return workOrders.filter(
        (wo) => String(wo.project_id) === String(projectId)
      );
    }

    return workOrders;
  }

  try {
    const params = projectId ? { projectId } : {};
    const response = await axios.get(`${WORK_ORDER_SERVICE_URL}/workorders`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching work orders:", error);
    // Return empty array as fallback
    return [];
  }
};

export const getWorkOrderById = async (workOrderId: number) => {
  if (USE_MOCK_DATA) {
    console.log(`Fetching work order with ID ${workOrderId}`);

    // Find the work order in our mock database
    const workOrder = mockDB.workOrders.find(
      (wo) => wo.work_order_id === workOrderId
    );

    if (!workOrder) {
      console.error(`Work order with ID ${workOrderId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Work order not found" },
        },
      });
    }

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    return { ...workOrder }; // Return a copy to prevent direct modification
  }

  // If not using mock data, make the actual API call
  const response = await axios.get(
    `${WORK_ORDER_SERVICE_URL}/workorders/${workOrderId}`
  );
  return response.data; // Includes line items based on backend controller
};

export const createWorkOrder = async (workOrderData: WorkOrderData) => {
  if (USE_MOCK_DATA) {
    console.log("Creating work order with mock data:", workOrderData);

    try {
      // Validate required fields
      if (!workOrderData.project_id || !workOrderData.description) {
        console.error(
          "Missing required fields: project_id and description are required"
        );
        return Promise.reject({
          response: {
            status: 400,
            data: { message: "Project ID and description are required" },
          },
        });
      }

      // Validate that the project exists
      const projectExists = mockDB.projects.some(
        (p) => String(p.project_id) === String(workOrderData.project_id)
      );
      if (!projectExists) {
        console.error(`Project with ID ${workOrderData.project_id} not found`);
        return Promise.reject({
          response: {
            status: 404,
            data: { message: "Project not found" },
          },
        });
      }

      // Find the highest work_order_id to ensure uniqueness
      const maxId = mockDB.workOrders.reduce(
        (max, wo) => Math.max(max, wo.work_order_id || 0),
        0
      );

      // Create a new work order with mock data
      const newWorkOrder = {
        ...workOrderData,
        work_order_id: maxId + 1, // Ensure unique ID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Set default values for any missing fields
        status: workOrderData.status || "Pending",
        actual_cost: 0,
        amount_billed: 0,
        amount_paid: 0,
        payment_status: "Not Billed",
        retainage_percentage: workOrderData.retainage_percentage || 0,
      };

      // Add the new work order to our mock database
      mockDB.workOrders.push(newWorkOrder);

      console.log("Work order created successfully:", newWorkOrder);
      console.log(
        "Updated mock DB work orders count:",
        mockDB.workOrders.length
      );

      // Simulate a delay for the API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      return newWorkOrder;
    } catch (error) {
      console.error("Error in createWorkOrder:", error);
      // Make sure we return a rejected promise with a proper error structure
      return Promise.reject({
        response: {
          status: 500,
          data: { message: "Internal error creating work order" },
        },
      });
    }
  }

  // If not using mock data, make the actual API call
  try {
    console.log("Making API call to create work order:", workOrderData);
    const response = await apiClient.post("/api/workorders", workOrderData);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in API call to create work order:", error);
    // Make sure we return a rejected promise with a proper error structure
    return Promise.reject(error);
  }
};

export const updateWorkOrder = async (
  workOrderId: number,
  workOrderData: Partial<WorkOrderData>
) => {
  if (USE_MOCK_DATA) {
    console.log(`Updating work order ${workOrderId} with data:`, workOrderData);

    // Find the work order in our mock database
    const workOrderIndex = mockDB.workOrders.findIndex(
      (wo) => wo.work_order_id === workOrderId
    );

    if (workOrderIndex === -1) {
      console.error(`Work order with ID ${workOrderId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Work order not found" },
        },
      });
    }

    // Update the work order
    const updatedWorkOrder = {
      ...mockDB.workOrders[workOrderIndex],
      ...workOrderData,
      updated_at: new Date().toISOString(),
    };

    // Replace the old work order with the updated one
    mockDB.workOrders[workOrderIndex] = updatedWorkOrder;

    console.log("Work order updated successfully:", updatedWorkOrder);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return updatedWorkOrder;
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.put(
    `/api/workorders/${workOrderId}`,
    workOrderData
  );
  return response.data;
};

export const deleteWorkOrder = async (workOrderId: number) => {
  if (USE_MOCK_DATA) {
    console.log(`Deleting work order ${workOrderId}`);

    // Find the work order in our mock database
    const workOrderIndex = mockDB.workOrders.findIndex(
      (wo) => wo.work_order_id === workOrderId
    );

    if (workOrderIndex === -1) {
      console.error(`Work order with ID ${workOrderId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Work order not found" },
        },
      });
    }

    // Remove the work order from our mock database
    const deletedWorkOrder = mockDB.workOrders.splice(workOrderIndex, 1)[0];

    console.log("Work order deleted successfully:", deletedWorkOrder);
    console.log("Updated mock DB work orders count:", mockDB.workOrders.length);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, message: "Work order deleted successfully" };
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.delete(`/api/workorders/${workOrderId}`);
  return response.data; // Or just status
};

// Line Item API Calls
export const addLineItem = async (
  workOrderId: number,
  lineItemData: LineItemData
) => {
  const response = await apiClient.post(
    `/api/workorders/${workOrderId}/lineitems`,
    lineItemData
  );
  return response.data;
};

export const updateLineItem = async (
  lineItemId: number,
  lineItemData: Partial<LineItemData>
) => {
  const response = await apiClient.put(
    `/api/workorders/lineitems/${lineItemId}`,
    lineItemData
  );
  return response.data;
};

export const deleteLineItem = async (lineItemId: number) => {
  const response = await apiClient.delete(
    `/api/workorders/lineitems/${lineItemId}`
  );
  return response.data; // Or just status
};

// Enhanced Work Order Creation with Multi-Contractor Support and Line Items
export interface EnhancedWorkOrderData {
  project_id: string;
  description: string;
  assigned_subcontractor_id?: string; // Legacy single contractor (optional)
  contractor_assignments?: ContractorAssignment[]; // New multi-contractor assignments
  status?: string;
  scheduled_date?: string;
  retainage_percentage?: number;
  selectedPaymentItems: string[]; // Payment item IDs to assign
  newLineItems: {
    description: string;
    quantity: number;
    unit_cost: number;
    unit_of_measure: string;
    location_id?: string;
    category?: string;
  }[];
}

export const createEnhancedWorkOrder = async (
  workOrderData: EnhancedWorkOrderData
) => {
  if (USE_MOCK_DATA) {
    console.log("Creating enhanced work order with mock data:", workOrderData);

    // Validate contractor assignments if provided
    if (
      workOrderData.contractor_assignments &&
      workOrderData.contractor_assignments.length > 0
    ) {
      const totalPercentage = workOrderData.contractor_assignments.reduce(
        (sum, assignment) => sum + (assignment.allocation_percentage || 0),
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        return Promise.reject({
          response: {
            status: 400,
            data: {
              message: "Contractor allocation percentages must total 100%",
            },
          },
        });
      }
    }

    // Calculate estimated cost from new line items
    const estimatedCost = workOrderData.newLineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );

    // Find the highest work_order_id to ensure uniqueness
    const maxId = mockDB.workOrders.reduce(
      (max, wo) => Math.max(max, wo.work_order_id || 0),
      0
    );

    // Create new work order
    const newWorkOrder = {
      work_order_id: maxId + 1,
      project_id: workOrderData.project_id,
      assigned_subcontractor_id:
        workOrderData.assigned_subcontractor_id || null,
      description: workOrderData.description,
      status: workOrderData.status || "Pending",
      scheduled_date: workOrderData.scheduled_date || null,
      completion_date: null,
      estimated_cost: estimatedCost,
      actual_cost: null,
      retainage_percentage: workOrderData.retainage_percentage || 0,
      amount_billed: 0,
      amount_paid: 0,
      payment_status: "Pending",
      invoice_number: null,
      invoice_date: null,
      payment_date: null,
      payment_method: null,
      payment_reference: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      contractor_assignments:
        workOrderData.contractor_assignments?.map((assignment, index) => ({
          assignment_id: (maxId + 1) * 100 + index + 1, // Generate unique assignment ID
          work_order_id: maxId + 1,
          subcontractor_id: assignment.subcontractor_id,
          allocation_percentage: assignment.allocation_percentage,
          allocation_amount: assignment.allocation_amount || 0,
          role_description: assignment.role_description || "",
          company_name:
            mockDB.subcontractors.find(
              (s) => s.subcontractor_id === assignment.subcontractor_id
            )?.company_name || "",
          contact_name:
            mockDB.subcontractors.find(
              (s) => s.subcontractor_id === assignment.subcontractor_id
            )?.contact_name || "",
        })) || [],
      line_items: workOrderData.newLineItems.map((item, index) => ({
        line_item_id: (maxId + 1) * 1000 + index + 1, // Generate unique line item ID
        work_order_id: maxId + 1,
        description: item.description,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
        unit_of_measure: item.unit_of_measure,
        location_id: item.location_id || null,
        category: item.category || null,
        status: "Not Started",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };

    // Add to mock database
    mockDB.workOrders.push(newWorkOrder);

    console.log("Enhanced work order created successfully:", newWorkOrder);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return newWorkOrder;
  }

  const response = await axios.post(
    `${WORK_ORDER_SERVICE_URL}/workorders/enhanced`,
    workOrderData
  );
  return response.data;
};

// Update payment item work order assignment
export const assignPaymentItemToWorkOrder = async (
  itemId: number,
  workOrderId: number
) => {
  const response = await axios.patch(
    `${PROJECT_SERVICE_URL}/payment-items/${itemId}/assign`,
    {
      work_order_id: workOrderId,
    }
  );
  return response.data;
};

// Unassign payment item from work order
export const unassignPaymentItemFromWorkOrder = async (itemId: number) => {
  const response = await axios.patch(
    `${PROJECT_SERVICE_URL}/payment-items/${itemId}/unassign`
  );
  return response.data;
};

// Get project budget summary
export interface ProjectBudgetSummary {
  project_id: number;
  total_budget: number;
  assigned_amount: number;
  unassigned_amount: number;
  assigned_percentage: number;
  work_orders_count: number;
  payment_items_count: number;
  unassigned_items_count: number;
}

export const getProjectBudgetSummary = async (
  projectId: number
): Promise<ProjectBudgetSummary> => {
  const response = await axios.get(
    `${PROJECT_SERVICE_URL}/projects/${projectId}/budget-summary`
  );
  return response.data;
};

// --- Subcontractor API Calls ---
// Assuming a dedicated service or endpoints within another service (e.g., User Service?)
// For now, let"s assume endpoints exist on the User Service

export interface SubcontractorData {
  subcontractor_id?: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  trade?: string; // e.g., Plumbing, Electrical
  insurance_expiry?: string | null;
  license_number?: string;
  status?: string; // e.g., Active, Inactive, Pending Approval
  address?: string;
  rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  active_work_orders?: number;
  completed_work_orders?: number;
  total_paid?: number;
}

// Using apiClient as a placeholder - adjust if a different service handles subcontractors
export const getSubcontractors = async () => {
  if (USE_MOCK_DATA) {
    console.log(
      "Fetching subcontractors from mock DB:",
      mockDB.subcontractors.length
    );

    // Return a copy of the subcontractors from our mock database
    return [...mockDB.subcontractors];
  }

  try {
    const response = await axios.get(
      `${WORK_ORDER_SERVICE_URL}/workorders/subcontractors`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subcontractors:", error);
    // Return empty array as fallback
    return [];
  }
};

export const getSubcontractorById = async (subcontractorId: number) => {
  if (USE_MOCK_DATA) {
    console.log(`Fetching subcontractor with ID ${subcontractorId}`);

    // Find the subcontractor in our mock database
    const subcontractor = mockDB.subcontractors.find(
      (sub) => sub.subcontractor_id === subcontractorId
    );

    if (!subcontractor) {
      console.error(`Subcontractor with ID ${subcontractorId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Subcontractor not found" },
        },
      });
    }

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    return { ...subcontractor }; // Return a copy to prevent direct modification
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.get(
    `/api/subcontractors/${subcontractorId}`
  );
  return response.data;
};

export const createSubcontractor = async (
  subcontractorData: SubcontractorData
) => {
  if (USE_MOCK_DATA) {
    console.log("Creating subcontractor with mock data:", subcontractorData);

    // Validate required fields
    if (!subcontractorData.company_name) {
      console.error("Missing required field: company_name");
      return Promise.reject({
        response: {
          status: 400,
          data: { message: "Company name is required" },
        },
      });
    }

    // Find the highest subcontractor_id to ensure uniqueness
    const maxId = mockDB.subcontractors.reduce(
      (max, sub) => Math.max(max, sub.subcontractor_id || 0),
      0
    );

    // Create a new subcontractor with mock data
    const newSubcontractor = {
      ...subcontractorData,
      subcontractor_id: maxId + 1, // Ensure unique ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Set default values for any missing fields
      status: subcontractorData.status || "Active",
    };

    // Add the new subcontractor to our mock database
    mockDB.subcontractors.push(newSubcontractor);

    console.log("Subcontractor created successfully:", newSubcontractor);
    console.log(
      "Updated mock DB subcontractors count:",
      mockDB.subcontractors.length
    );

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return newSubcontractor;
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.post(
    "/api/subcontractors",
    subcontractorData
  );
  return response.data;
};

export const updateSubcontractor = async (
  subcontractorId: number,
  subcontractorData: Partial<SubcontractorData>
) => {
  if (USE_MOCK_DATA) {
    console.log(
      `Updating subcontractor ${subcontractorId} with data:`,
      subcontractorData
    );

    // Find the subcontractor in our mock database
    const subcontractorIndex = mockDB.subcontractors.findIndex(
      (sub) => sub.subcontractor_id === subcontractorId
    );

    if (subcontractorIndex === -1) {
      console.error(`Subcontractor with ID ${subcontractorId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Subcontractor not found" },
        },
      });
    }

    // Update the subcontractor
    const updatedSubcontractor = {
      ...mockDB.subcontractors[subcontractorIndex],
      ...subcontractorData,
      updated_at: new Date().toISOString(),
    };

    // Replace the old subcontractor with the updated one
    mockDB.subcontractors[subcontractorIndex] = updatedSubcontractor;

    console.log("Subcontractor updated successfully:", updatedSubcontractor);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return updatedSubcontractor;
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.put(
    `/api/subcontractors/${subcontractorId}`,
    subcontractorData
  );
  return response.data;
};

export const deleteSubcontractor = async (subcontractorId: number) => {
  if (USE_MOCK_DATA) {
    console.log(`Deleting subcontractor ${subcontractorId}`);

    // Find the subcontractor in our mock database
    const subcontractorIndex = mockDB.subcontractors.findIndex(
      (sub) => sub.subcontractor_id === subcontractorId
    );

    if (subcontractorIndex === -1) {
      console.error(`Subcontractor with ID ${subcontractorId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "Subcontractor not found" },
        },
      });
    }

    // Check if the subcontractor is used in any work orders
    const isUsed = mockDB.workOrders.some(
      (wo) => wo.assigned_subcontractor_id === subcontractorId
    );

    if (isUsed) {
      console.error(
        `Subcontractor with ID ${subcontractorId} is used in work orders and cannot be deleted`
      );
      return Promise.reject({
        response: {
          status: 400,
          data: {
            message:
              "Cannot delete subcontractor that is assigned to work orders",
          },
        },
      });
    }

    // Remove the subcontractor from our mock database
    const deletedSubcontractor = mockDB.subcontractors.splice(
      subcontractorIndex,
      1
    )[0];

    console.log("Subcontractor deleted successfully:", deletedSubcontractor);
    console.log(
      "Updated mock DB subcontractors count:",
      mockDB.subcontractors.length
    );

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, message: "Subcontractor deleted successfully" };
  }

  // If not using mock data, make the actual API call
  const response = await apiClient.delete(
    `/api/subcontractors/${subcontractorId}`
  );
  return response.data; // Or just status
};

// --- Document API Calls ---

export interface DocumentData {
  document_id: number;
  project_id?: number | null;
  work_order_id?: number | null;
  file_name: string;
  file_path: string; // URL or path depending on storage
  file_type: string;
  file_size: number;
  description?: string;
  uploaded_by: number; // User ID
  uploaded_at: string; // Timestamp
}

export const getDocuments = async (
  projectId?: number,
  workOrderId?: number
) => {
  try {
    // Try to get from the API first
    const params: { projectId?: number; workOrderId?: number } = {};
    if (projectId) params.projectId = projectId;
    if (workOrderId) params.workOrderId = workOrderId;

    const response = await apiClient.get("/api/documents", { params });

    // If we get an empty array, add some mock data for demonstration
    if (Array.isArray(response.data) && response.data.length === 0) {
      // Create mock documents
      const mockDocuments: DocumentData[] = [
        {
          document_id: 1,
          project_id: 1,
          work_order_id: 1,
          file_name: "Project_Plan.pdf",
          file_path: "/documents/project_plan.pdf",
          file_type: "application/pdf",
          file_size: 1024 * 1024 * 2.5, // 2.5 MB
          description: "Project planning document",
          uploaded_by: 1,
          uploaded_at: new Date().toISOString(),
        },
        {
          document_id: 2,
          project_id: 1,
          work_order_id: null,
          file_name: "Budget_Estimate.xlsx",
          file_path: "/documents/budget_estimate.xlsx",
          file_type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          file_size: 1024 * 512, // 512 KB
          description: "Budget estimation spreadsheet",
          uploaded_by: 1,
          uploaded_at: new Date().toISOString(),
        },
        {
          document_id: 3,
          project_id: 2,
          work_order_id: 2,
          file_name: "Site_Photos.zip",
          file_path: "/documents/site_photos.zip",
          file_type: "application/zip",
          file_size: 1024 * 1024 * 15, // 15 MB
          description: "Collection of site photos",
          uploaded_by: 1,
          uploaded_at: new Date().toISOString(),
        },
      ];

      // Filter mock data based on params
      let filteredDocs = [...mockDocuments];
      if (projectId) {
        filteredDocs = filteredDocs.filter(
          (doc) => doc.project_id === projectId
        );
      }
      if (workOrderId) {
        filteredDocs = filteredDocs.filter(
          (doc) => doc.work_order_id === workOrderId
        );
      }

      return filteredDocs;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    // Return mock data as fallback
    return [];
  }
};

export const uploadDocument = async (formData: FormData) => {
  // Use FormData for file uploads
  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  const response = await apiClient.post(
    "/api/documents/upload",
    formData,
    config
  );
  return response.data;
};

export const downloadDocument = async (documentId: number) => {
  try {
    const response = await apiClient.get(
      `/api/documents/${documentId}/download`,
      {
        responseType: "blob", // Important for handling file downloads
      }
    );
    return response; // Return the full response to handle blob and headers
  } catch (error) {
    console.error("Error downloading document, creating mock response:", error);

    // Create a mock response for demonstration purposes
    const mockText =
      "This is a mock document content for demonstration purposes.";
    const blob = new Blob([mockText], { type: "text/plain" });

    return {
      data: blob,
      headers: {
        "content-type": "text/plain",
        "content-disposition": "attachment; filename=mock-document.txt",
      },
    };
  }
};

export const deleteDocument = async (documentId: number) => {
  const response = await apiClient.delete(`/api/documents/${documentId}`);
  return response.data; // Or status
};

export const getDocumentMetadata = async (documentId: number) => {
  const response = await apiClient.get(`/api/documents/${documentId}/metadata`);
  return response.data;
};

// --- User Management API Calls ---

export interface UserData {
  user_id: number;
  username: string;
  email: string;
  role: string; // e.g., "Admin", "ProjectManager", "FieldStaff"
  status: string; // e.g., "Active", "Inactive"
  created_at: string;
  // Add other relevant fields, but avoid password hashes
}

export const getUsers = async () => {
  if (USE_MOCK_DATA) {
    // Return users from the mockUsers array (without passwords)
    return mockUsers.map((user) => {
      // Create a copy of the user without the password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  try {
    const response = await apiClient.get("/api/users"); // Assuming /users endpoint exists
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    // Return empty array as fallback
    return [];
  }
};

// Function to get a user's password - FOR ADMIN USE ONLY
// In a real application, this would not exist as passwords should be hashed and not retrievable
export const getUserPassword = async (
  userId: number
): Promise<string | null> => {
  if (USE_MOCK_DATA) {
    // Find the user in the mock database
    const user = mockUsers.find((u) => u.user_id === userId);
    if (user && user.password) {
      return user.password;
    }
    return null;
  }

  // In a real application, this would return an error as passwords should be hashed
  console.warn(
    "Attempted to retrieve a password in non-mock mode. This operation is not supported in production."
  );
  return null;
};

export const createUser = async (
  userData: Omit<UserData, "user_id" | "created_at"> & { password?: string }
) => {
  if (USE_MOCK_DATA) {
    console.log("Creating user with mock data:", userData);

    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      console.error("Missing required fields:", {
        username: userData.username,
        email: userData.email,
        password: userData.password ? "provided" : "missing",
      });

      return Promise.reject({
        response: {
          status: 400,
          data: { message: "Username, email, and password are required" },
        },
      });
    }

    // Check if username or email already exists
    const userExists = mockUsers.some(
      (u) => u.username === userData.username || u.email === userData.email
    );

    if (userExists) {
      console.error("User already exists:", userData.username);
      return Promise.reject({
        response: {
          status: 409,
          data: { message: "Username or email already exists" },
        },
      });
    }

    // Create new user with ID
    const newUser = {
      user_id: Math.floor(Math.random() * 1000) + 10, // Random ID that won't conflict with existing mock users
      ...userData,
      created_at: new Date().toISOString(),
      status: userData.status || "Active",
    };

    // Add to mock database so the user can log in
    mockUsers.push(newUser as any); // Type assertion needed because of password field

    console.log("User created successfully:", newUser);
    console.log("Current mock users:", mockUsers);

    // Return user data without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  try {
    // Password should be handled securely by the backend
    const response = await apiClient.post("/api/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Re-throw as this is a user-initiated action that should show errors
  }
};

export const updateUser = async (
  userId: number,
  userData: Partial<Omit<UserData, "user_id" | "created_at">>
) => {
  if (USE_MOCK_DATA) {
    console.log(`Updating user ${userId} with data:`, userData);

    // Find the user in our mock database
    const userIndex = mockUsers.findIndex((u) => u.user_id === userId);

    if (userIndex === -1) {
      console.error(`User with ID ${userId} not found`);
      return Promise.reject({
        response: {
          status: 404,
          data: { message: "User not found" },
        },
      });
    }

    // Update the user
    const updatedUser = {
      ...mockUsers[userIndex],
      ...userData,
    };

    // Replace the old user with the updated one
    mockUsers[userIndex] = updatedUser;

    console.log("User updated successfully:", updatedUser);

    // Simulate a delay for the API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return user data without password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  try {
    const response = await apiClient.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; // Re-throw as this is a user-initiated action that should show errors
  }
};

export const deleteUser = async (userId: number) => {
  if (USE_MOCK_DATA) {
    // Simulate successful deletion
    return { success: true, message: "User deleted successfully" };
  }

  try {
    const response = await apiClient.delete(`/api/users/${userId}`);
    return response.data; // Or status
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error; // Re-throw as this is a user-initiated action that should show errors
  }
};

// --- Reporting API Calls (Placeholder) ---
// These would likely involve more complex queries or dedicated endpoints

export const getProjectFinancialSummary = async (projectId: number) => {
  if (USE_MOCK_DATA) {
    // Return mock financial data based on project ID
    const mockData = {
      1: {
        projectId: 1,
        projectName: "Smith Residence Renovation",
        budget: 350000,
        estimatedCost: 175000,
        actualCost: 0,
        amountBilled: 0,
        amountPaid: 0,
      },
      2: {
        projectId: 2,
        projectName: "Downtown Office Building",
        budget: 1500000,
        estimatedCost: 450000,
        actualCost: 0,
        amountBilled: 0,
        amountPaid: 0,
      },
      3: {
        projectId: 3,
        projectName: "City Park Pavilion",
        budget: 250000,
        estimatedCost: 75000,
        actualCost: 0,
        amountBilled: 0,
        amountPaid: 0,
      },
    };

    return (
      mockData[projectId as keyof typeof mockData] || {
        projectId,
        projectName: "Unknown Project",
        budget: 0,
        estimatedCost: 0,
        actualCost: 0,
        amountBilled: 0,
        amountPaid: 0,
      }
    );
  }

  // Since the actual endpoint doesn't exist yet, we'll create mock data based on existing data
  try {
    // Get the project details
    const project = await getProjectById(projectId);

    // Get work orders for this project
    const workOrders = await getWorkOrders(projectId);

    // Calculate financial metrics
    const estimatedCost = workOrders.reduce(
      (sum: number, wo: WorkOrderData) => sum + (wo.estimated_cost || 0),
      0
    );
    const actualCost = workOrders.reduce(
      (sum: number, wo: WorkOrderData) => sum + (wo.actual_cost || 0),
      0
    );
    const amountBilled = workOrders.reduce(
      (sum: number, wo: WorkOrderData) => sum + (wo.amount_billed || 0),
      0
    );
    const amountPaid = workOrders.reduce(
      (sum: number, wo: WorkOrderData) => sum + (wo.amount_paid || 0),
      0
    );

    return {
      projectId,
      projectName: project.project_name,
      budget: project.budget || 0,
      estimatedCost,
      actualCost,
      amountBilled,
      amountPaid,
    };
  } catch (error) {
    console.error("Error generating project financial summary:", error);
    throw error;
  }
};

export const getOverallProgressReport = async () => {
  if (USE_MOCK_DATA) {
    // Return mock overall progress data directly
    return {
      totalProjects: 3,
      completedProjects: 0,
      totalBudget: 2100000,
      // Add more metrics
    };
  }

  // Example: Fetch overall system progress metrics
  // Might aggregate data from multiple services
  // const response = await reportingServiceApi.get("/reports/overall-progress"); // Placeholder
  // Simulate data for now
  return Promise.resolve({
    totalProjects: (await getProjects()).length,
    completedProjects: (await getProjects()).filter(
      (p: ProjectData) => p.status === "Completed"
    ).length,
    totalBudget: (await getProjects()).reduce(
      (sum: number, p: ProjectData) => sum + (p.budget || 0),
      0
    ),
    // Add more metrics
  });
};

// Export payment items API functions
export * from "./paymentItemsApi";

export default apiClient; // Export the base client if needed
