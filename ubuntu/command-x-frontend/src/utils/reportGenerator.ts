/**
 * Report Generator Utility
 * 
 * This utility provides functions to generate various types of reports
 * for the Command-X application.
 */

import { WorkOrderData } from "@/components/accounting/WorkOrderStatusTable";

/**
 * Generate a PDF report for work orders
 * @param workOrders - Array of work order data
 * @param title - Report title
 * @param subtitle - Report subtitle
 * @returns A data URL for the generated PDF
 */
export const generateWorkOrderReport = (
  workOrders: WorkOrderData[],
  title: string = "Work Order Status Report",
  subtitle: string = "Command X Construction"
): string => {
  // In a real implementation, this would use a PDF generation library
  // like jsPDF or pdfmake to create a proper PDF document
  
  // For now, we'll create a simple HTML structure that will be displayed
  // when the report is "generated"
  
  // Calculate totals for the report
  const totalSWO = workOrders.reduce((sum, item) => sum + item.swoTotal, 0);
  const totalRetainage = workOrders.reduce((sum, item) => sum + item.retainageAmount, 0);
  const totalWOAmount = workOrders.reduce((sum, item) => sum + item.woAmount, 0);
  const totalDue = workOrders.reduce((sum, item) => sum + item.woDueAmount, 0);
  
  // Format date for the report
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          color: #1a56db;
          margin-bottom: 5px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 20px;
        }
        .date {
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .summary {
          margin-top: 30px;
          border-top: 2px solid #ddd;
          padding-top: 20px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .summary-label {
          font-weight: bold;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
        }
        .badge-red {
          background-color: #ef4444;
        }
        .badge-yellow {
          background-color: #f59e0b;
        }
        .badge-green {
          background-color: #10b981;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">${subtitle}</div>
        <div class="date">Generated on: ${reportDate}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>SWO Total</th>
            <th>W.O. Amount</th>
            <th>Retainage</th>
            <th>Due Date</th>
            <th>% Complete</th>
            <th>Crew</th>
          </tr>
        </thead>
        <tbody>
          ${workOrders.map(wo => {
            let badgeClass = 'badge-red';
            if (wo.percentComplete === 100) {
              badgeClass = 'badge-green';
            } else if (wo.percentComplete > 50) {
              badgeClass = 'badge-yellow';
            }
            
            return `
              <tr>
                <td>${wo.id}</td>
                <td>$${wo.swoTotal.toFixed(2)}</td>
                <td>$${wo.woAmount.toFixed(2)}</td>
                <td>$${wo.retainageAmount.toFixed(2)}</td>
                <td>${wo.dueDate}</td>
                <td><span class="badge ${badgeClass}">${wo.percentComplete}%</span></td>
                <td>${wo.crewName || 'Not Assigned'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">
          <span class="summary-label">Total Work Orders:</span>
          <span>${workOrders.length}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total SWO Amount:</span>
          <span>$${totalSWO.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total W.O. Amount:</span>
          <span>$${totalWOAmount.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Retainage:</span>
          <span>$${totalRetainage.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Amount Due:</span>
          <span>$${totalDue.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>This report was generated by Command X Construction Management System.</p>
        <p>© ${new Date().getFullYear()} Command X Construction. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  
  // Convert HTML to a data URL
  // In a real implementation, this would be converted to a PDF
  // For now, we'll use a data URL with the HTML content
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  
  return dataUrl;
};

/**
 * Generate a financial report
 * @param data - Financial data for the report
 * @param title - Report title
 * @returns A data URL for the generated PDF
 */
export const generateFinancialReport = (
  data: any,
  title: string = "Financial Report"
): string => {
  // This would be implemented similarly to the work order report
  // For now, we'll return a simple HTML report
  
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          color: #1a56db;
          margin-bottom: 5px;
        }
        .date {
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="date">Generated on: ${reportDate}</div>
      </div>
      
      <h2>Financial Report Content</h2>
      <p>This is a placeholder for the financial report content.</p>
      <p>In a real implementation, this would contain detailed financial information.</p>
    </body>
    </html>
  `;
  
  return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
};
