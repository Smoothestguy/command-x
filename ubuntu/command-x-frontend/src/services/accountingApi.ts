import { WorkOrderData } from "./api";

// Define the type for work order financial data
export interface WorkOrderFinancialData {
  id: string;
  completed: number;
  notStarted: number;
  swoTotal: number;
  subMaterialAmount: number;
  woAmount: number;
  unbillableAmount: number;
  unbillableHeld: number;
  retainageHeld: number;
  retainageAmount: number;
  woDueAmount: number;
  pendingCOs: number;
  changeOrderNotes: string;
  percentComplete: number;
  percentOfPass: number;
  percentAssigned: number;
  percentCompleted: number;
  percentPending: number;
  percentStarted: number;
  dueDate: string;
  crewName: string;
}

// Function to transform work order data into financial data
const transformWorkOrderToFinancialData = (workOrder: WorkOrderData): WorkOrderFinancialData => {
  // Calculate completion percentage
  const percentComplete = workOrder.status === "Completed" ? 100 : 
                         workOrder.status === "In Progress" ? 50 : 0;
  
  // Calculate retainage amount
  const retainagePercentage = workOrder.retainage_percentage || 0;
  const amountBilled = workOrder.amount_billed || 0;
  const retainageAmount = (amountBilled * retainagePercentage) / 100;
  
  // Calculate due amount (billed minus paid)
  const amountPaid = workOrder.amount_paid || 0;
  const woDueAmount = amountBilled - amountPaid;
  
  // Get crew name from assigned subcontractor (would need to be fetched in a real implementation)
  const crewName = workOrder.assigned_subcontractor_id 
    ? `Subcontractor ${workOrder.assigned_subcontractor_id}` 
    : "Unassigned";
  
  // Format due date
  const dueDate = workOrder.completion_date 
    ? new Date(workOrder.completion_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
    : "N/A";
  
  return {
    id: workOrder.work_order_id?.toString() || "0",
    completed: percentComplete,
    notStarted: percentComplete === 0 ? 100 : 0,
    swoTotal: workOrder.estimated_cost || 0,
    subMaterialAmount: (workOrder.estimated_cost || 0) * 0.6, // Assuming 60% of cost is materials
    woAmount: workOrder.actual_cost || workOrder.estimated_cost || 0,
    unbillableAmount: 0, // Would need real data
    unbillableHeld: 0, // Would need real data
    retainageHeld: 0, // Would need real data
    retainageAmount: retainageAmount,
    woDueAmount: woDueAmount,
    pendingCOs: 0, // Would need real data
    changeOrderNotes: "",
    percentComplete: percentComplete,
    percentOfPass: 100, // Default value
    percentAssigned: workOrder.assigned_subcontractor_id ? 100 : 0,
    percentCompleted: workOrder.status === "Completed" ? 100 : 0,
    percentPending: workOrder.status === "Pending" ? 100 : 0,
    percentStarted: workOrder.status === "In Progress" ? 100 : 0,
    dueDate: dueDate,
    crewName: crewName
  };
};

// Get work order financial data for accounting overview
export const getWorkOrderFinancialData = async (projectId?: number): Promise<WorkOrderFinancialData[]> => {
  try {
    // Import dynamically to avoid circular dependencies
    const { getWorkOrders } = await import("./api");
    
    // Fetch work orders
    const workOrders = await getWorkOrders(projectId);
    
    // Transform work orders to financial data
    const financialData = workOrders.map(transformWorkOrderToFinancialData);
    
    return financialData;
  } catch (error) {
    console.error("Error fetching work order financial data:", error);
    return [];
  }
};

// Get financial summary for all work orders
export const getWorkOrderFinancialSummary = async (projectId?: number) => {
  try {
    const financialData = await getWorkOrderFinancialData(projectId);
    
    // Calculate totals
    const totalSWO = financialData.reduce((sum, item) => sum + item.swoTotal, 0);
    const totalWOAmount = financialData.reduce((sum, item) => sum + item.woAmount, 0);
    const totalUnbillable = financialData.reduce((sum, item) => sum + item.unbillableAmount, 0);
    const totalRetainage = financialData.reduce((sum, item) => sum + item.retainageAmount, 0);
    const totalDue = financialData.reduce((sum, item) => sum + item.woDueAmount, 0);
    const totalPendingCOs = financialData.reduce((sum, item) => sum + item.pendingCOs, 0);
    
    // Calculate status counts
    const completed = financialData.filter(item => item.percentCompleted === 100).length;
    const inProgress = financialData.filter(item => item.percentStarted > 0 && item.percentCompleted < 100).length;
    const notStarted = financialData.filter(item => item.percentStarted === 0).length;
    
    return {
      totalSWO,
      totalWOAmount,
      totalUnbillable,
      totalRetainage,
      totalDue,
      totalPendingCOs,
      completed,
      inProgress,
      notStarted,
      totalCount: financialData.length
    };
  } catch (error) {
    console.error("Error calculating work order financial summary:", error);
    return {
      totalSWO: 0,
      totalWOAmount: 0,
      totalUnbillable: 0,
      totalRetainage: 0,
      totalDue: 0,
      totalPendingCOs: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      totalCount: 0
    };
  }
};
