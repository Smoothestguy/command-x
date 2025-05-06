import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectData, WorkOrderData } from "@/services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface FinancialOverviewProps {
  projects: ProjectData[];
  workOrders: WorkOrderData[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const FinancialOverview: React.FC<FinancialOverviewProps> = ({
  projects,
  workOrders,
  // dateRange is currently unused
}) => {
  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalBudget = projects.reduce(
      (sum, project) => sum + (project.budget || 0),
      0
    );
    const totalActualCost = projects.reduce(
      (sum, project) => sum + (project.actual_cost || 0),
      0
    );
    const budgetUtilization =
      totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0;

    const totalInvoiced = workOrders.reduce(
      (sum, wo) => sum + (wo.amount_billed || 0),
      0
    );
    const totalPaid = workOrders.reduce(
      (sum, wo) => sum + (wo.amount_paid || 0),
      0
    );
    const outstandingPayments = totalInvoiced - totalPaid;

    const totalRetainage = workOrders.reduce((sum, wo) => {
      const retainageAmount =
        ((wo.amount_billed || 0) * (wo.retainage_percentage || 0)) / 100;
      return sum + retainageAmount;
    }, 0);

    return {
      totalBudget,
      totalActualCost,
      budgetUtilization,
      totalInvoiced,
      totalPaid,
      outstandingPayments,
      totalRetainage,
    };
  }, [projects, workOrders]);

  // Payment status data for pie chart
  const paymentStatusData = useMemo(() => {
    const paid = financialMetrics.totalPaid;
    const outstanding = financialMetrics.outstandingPayments;
    const retainage = financialMetrics.totalRetainage;

    return [
      { name: "Paid", value: paid },
      { name: "Outstanding", value: outstanding },
      { name: "Retainage Held", value: retainage },
    ];
  }, [financialMetrics]);

  // Budget by project data for bar chart
  const budgetByProjectData = useMemo(() => {
    return projects.slice(0, 5).map((project) => ({
      name: project.project_name,
      budget: project.budget || 0,
      actual: project.actual_cost || 0,
    }));
  }, [projects]);

  // Colors for charts
  const COLORS = [
    "#4CAF50",
    "#FFC107",
    "#F44336",
    "#2196F3",
    "#9C27B0",
    "#3F51B5",
  ];

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialMetrics.totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {projects.length} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Utilization
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialMetrics.budgetUtilization.toFixed(1)}%
            </div>
            <Progress
              value={financialMetrics.budgetUtilization}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              ${financialMetrics.totalActualCost.toLocaleString()} of $
              {financialMetrics.totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Outstanding Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialMetrics.outstandingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                workOrders.filter(
                  (wo) => (wo.amount_billed || 0) > (wo.amount_paid || 0)
                ).length
              }{" "}
              invoices pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Retainage Held
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialMetrics.totalRetainage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across{" "}
              {
                workOrders.filter((wo) => (wo.retainage_percentage || 0) > 0)
                  .length
              }{" "}
              work orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs. Actual by Project</CardTitle>
            <CardDescription>Top 5 projects by budget</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetByProjectData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual Cost" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Distribution of payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {paymentStatusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
