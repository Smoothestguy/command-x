// Report Generator Utility
export interface WorkOrderData {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdAt: string;
  dueDate: string;
  estimatedCost: number;
  actualCost?: number;
  projectId: number;
  projectName?: string;
}

export interface ReportOptions {
  format?: 'pdf' | 'csv' | 'excel';
  includeDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const generateWorkOrderReport = (
  workOrders: WorkOrderData[],
  options: ReportOptions = {}
): string => {
  const { format = 'pdf', includeDetails = true } = options;
  
  // For now, return a mock URL
  // In a real implementation, this would generate an actual report
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating work order report:', {
    workOrders: workOrders.length,
    format,
    includeDetails,
    reportId
  });
  
  // Mock report URL - in real implementation this would be a blob URL or download link
  return `data:text/plain;charset=utf-8,Work Order Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}
Work Orders: ${workOrders.length}
${includeDetails ? '\nDetailed report with full work order information' : '\nSummary report'}`;
};

export const generateProjectReport = (
  projectData: any,
  options: ReportOptions = {}
): string => {
  const { format = 'pdf' } = options;
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating project report:', {
    projectData,
    format,
    reportId
  });
  
  return `data:text/plain;charset=utf-8,Project Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}
Project: ${projectData?.name || 'Unknown'}`;
};

export const generateFinancialReport = (
  financialData: any,
  options: ReportOptions = {}
): string => {
  const { format = 'pdf' } = options;
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating financial report:', {
    financialData,
    format,
    reportId
  });
  
  return `data:text/plain;charset=utf-8,Financial Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}`;
};

export const downloadReport = (reportUrl: string, filename: string): void => {
  // Create a temporary link element and trigger download
  const link = document.createElement('a');
  link.href = reportUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  generateWorkOrderReport,
  generateProjectReport,
  generateFinancialReport,
  downloadReport,
};
