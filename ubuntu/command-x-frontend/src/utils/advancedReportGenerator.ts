/**
 * Advanced Report Generator Utility
 *
 * This utility provides functions to generate comprehensive financial reports
 * for the Command-X application.
 */

import { WorkOrderData } from "@/components/accounting/WorkOrderStatusTable";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

/**
 * Generate a comprehensive financial report for work orders
 * @param workOrders - Array of work order data
 * @param title - Report title
 * @param subtitle - Report subtitle
 * @returns A data URL for the generated report
 */
export const generateComprehensiveReport = (
  workOrders: WorkOrderData[],
  title: string = "Comprehensive Financial Report",
  subtitle: string = "Command X Construction"
): string => {
  // Calculate totals and metrics for the report
  const totalSWO = workOrders.reduce((sum, item) => sum + item.swoTotal, 0);
  const totalRetainage = workOrders.reduce(
    (sum, item) => sum + item.retainageAmount,
    0
  );
  const totalWOAmount = workOrders.reduce(
    (sum, item) => sum + item.woAmount,
    0
  );
  const totalDue = workOrders.reduce((sum, item) => sum + item.woDueAmount, 0);
  const totalSubMaterial = workOrders.reduce(
    (sum, item) => sum + item.subMaterialAmount,
    0
  );
  const totalUnbillable = workOrders.reduce(
    (sum, item) => sum + item.unbillableAmount,
    0
  );

  // Calculate completion metrics
  const completedWorkOrders = workOrders.filter(
    (wo) => wo.percentCompleted === 100 || wo.percentComplete === 100
  ).length;
  const inProgressWorkOrders = workOrders.filter(
    (wo) =>
      (wo.percentCompleted > 0 && wo.percentCompleted < 100) ||
      (wo.percentComplete > 0 && wo.percentComplete < 100)
  ).length;
  const notStartedWorkOrders = workOrders.filter(
    (wo) =>
      (wo.percentCompleted === 0 || wo.percentComplete === 0) &&
      !(wo.percentCompleted === 100 || wo.percentComplete === 100) &&
      !(
        (wo.percentCompleted > 0 && wo.percentCompleted < 100) ||
        (wo.percentComplete > 0 && wo.percentComplete < 100)
      )
  ).length;

  // Prepare chart data
  const statusChartData: ChartData = {
    labels: ["Completed", "In Progress", "Not Started"],
    datasets: [
      {
        label: "Work Order Status",
        data: [completedWorkOrders, inProgressWorkOrders, notStartedWorkOrders],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const financialBreakdownData: ChartData = {
    labels: [
      "Work Order Amount",
      "Subcontractor Material",
      "Retainage",
      "Unbillable",
    ],
    datasets: [
      {
        label: "Financial Breakdown",
        data: [
          totalWOAmount,
          totalSubMaterial,
          totalRetainage,
          totalUnbillable,
        ],
        backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"],
      },
    ],
  };

  // Format date for the report
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f9fafb;
        }
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #1a56db;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 15px;
        }
        .date {
          font-size: 14px;
          color: #6b7280;
        }
        h1, h2, h3 {
          color: #1e40af;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
        }
        h2 {
          font-size: 20px;
          margin: 30px 0 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        h3 {
          font-size: 18px;
          margin: 25px 0 10px;
        }
        .summary-section {
          background-color: #f0f9ff;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        .summary-card {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .summary-card h3 {
          margin-top: 0;
          font-size: 16px;
          color: #6b7280;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
        }
        .chart-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 30px;
          margin: 30px 0;
        }
        .chart-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px 15px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-weight: 500;
          font-size: 12px;
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
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #1e40af;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        @media print {
          body {
            background-color: white;
          }
          .report-container {
            box-shadow: none;
            padding: 0;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">Print Report</button>

      <div class="report-container">
        <div class="header">
          <div class="logo">${subtitle}</div>
          <div class="subtitle">${title}</div>
          <div class="date">Generated on: ${reportDate}</div>
        </div>

        <h1>Executive Summary</h1>
        <div class="summary-section">
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total SWO Amount</h3>
              <div class="summary-value">$${totalSWO.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div>
            </div>
            <div class="summary-card">
              <h3>Total Work Order Amount</h3>
              <div class="summary-value">$${totalWOAmount.toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</div>
            </div>
            <div class="summary-card">
              <h3>Total Retainage</h3>
              <div class="summary-value">$${totalRetainage.toLocaleString(
                "en-US",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</div>
            </div>
            <div class="summary-card">
              <h3>Total Amount Due</h3>
              <div class="summary-value">$${totalDue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</div>
            </div>
          </div>
        </div>

        <h2>Financial Analysis</h2>
        <p>This section provides a detailed analysis of the financial status of all work orders.</p>

        <div class="chart-container">
          <div class="chart-card">
            <h3>Work Order Status Distribution</h3>
            <canvas id="statusChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Financial Breakdown</h3>
            <canvas id="financialChart"></canvas>
          </div>
        </div>

        <h2>Work Order Details</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>SWO Total</th>
              <th>W.O. Amount</th>
              <th>Sub Material</th>
              <th>Retainage</th>
              <th>Due Date</th>
              <th>Completion</th>
              <th>Crew</th>
            </tr>
          </thead>
          <tbody>
            ${workOrders
              .map((wo) => {
                let badgeClass = "badge-red";
                const percentValue =
                  wo.percentCompleted !== undefined
                    ? wo.percentCompleted
                    : wo.percentComplete;
                if (percentValue === 100) {
                  badgeClass = "badge-green";
                } else if (percentValue > 50) {
                  badgeClass = "badge-yellow";
                }

                return `
                <tr>
                  <td>${wo.id}</td>
                  <td>$${wo.swoTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td>$${wo.woAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td>$${wo.subMaterialAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td>$${wo.retainageAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td>${wo.dueDate}</td>
                  <td><span class="badge ${badgeClass}">${percentValue}%</span></td>
                  <td>${wo.crewName || "Not Assigned"}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by Command X Construction Management System.</p>
          <p>© ${new Date().getFullYear()} Command X Construction. All rights reserved.</p>
        </div>
      </div>

      <script>
        // Initialize charts
        document.addEventListener('DOMContentLoaded', function() {
          // Status Chart
          const statusCtx = document.getElementById('statusChart').getContext('2d');
          new Chart(statusCtx, {
            type: 'pie',
            data: ${JSON.stringify(statusChartData)},
            options: {
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              }
            }
          });

          // Financial Breakdown Chart
          const financialCtx = document.getElementById('financialChart').getContext('2d');
          new Chart(financialCtx, {
            type: 'bar',
            data: ${JSON.stringify(financialBreakdownData)},
            options: {
              responsive: true,
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          });
        });
      </script>
    </body>
    </html>
  `;

  // Convert HTML to a data URL
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
    htmlContent
  )}`;

  return dataUrl;
};
