// Direct Report Generator Utility
export interface DirectReportData {
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

export interface DirectReportOptions {
  format?: 'pdf' | 'csv' | 'excel';
  includeDetails?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const generateDirectReport = (
  reportData: DirectReportData[],
  options: DirectReportOptions = {}
): string => {
  const { format = 'pdf', includeDetails = true } = options;
  
  // For now, return a mock URL
  // In a real implementation, this would generate an actual report
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating direct report:', {
    reportData: reportData.length,
    format,
    includeDetails,
    reportId
  });
  
  // Mock report URL - in real implementation this would be a blob URL or download link
  return `data:text/plain;charset=utf-8,Direct Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}
Data Items: ${reportData.length}
${includeDetails ? '\nDetailed report with full information' : '\nSummary report'}`;
};

export const generateDirectProjectReport = (
  projectData: any,
  options: DirectReportOptions = {}
): string => {
  const { format = 'pdf' } = options;
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating direct project report:', {
    projectData,
    format,
    reportId
  });
  
  return `data:text/plain;charset=utf-8,Direct Project Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}
Project: ${projectData?.name || 'Unknown'}`;
};

export const generateDirectFinancialReport = (
  financialData: any,
  options: DirectReportOptions = {}
): string => {
  const { format = 'pdf' } = options;
  const reportId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString().split('T')[0];
  
  console.log('Generating direct financial report:', {
    financialData,
    format,
    reportId
  });
  
  return `data:text/plain;charset=utf-8,Direct Financial Report Generated
Report ID: ${reportId}
Date: ${timestamp}
Format: ${format}`;
};

export const downloadDirectReport = (reportUrl: string, filename: string): void => {
  // Create a temporary link element and trigger download
  const link = document.createElement('a');
  link.href = reportUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  generateDirectReport,
  generateDirectProjectReport,
  generateDirectFinancialReport,
  downloadDirectReport,
};
