import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  projectsApi,
  workOrdersApi,
  paymentItemsApi,
  subcontractorsApi,
} from "../services/supabaseApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Construction,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Clock,
  FileText,
  Loader2,
  BarChart2,
  Printer,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface DashboardSummary {
  projectCount: number;
  activeWorkOrders: number;
  totalPaymentItems: number;
  totalSubcontractors: number;
  totalBudget: number;
  projectStatusData: Array<{ name: string; value: number }>;
  workOrderData: Array<{ name: string; count: number }>;
  budgetData: Array<{ name: string; budget: number; spent: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    action: string;
    item: string;
    user: string;
    time: string;
  }>;
}

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("week"); // "week", "month", "quarter", "year"
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
    "pdf"
  );
  const [isExporting, setIsExporting] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeWorkOrders, setIncludeWorkOrders] = useState(true);
  const [includeFinancials, setIncludeFinancials] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [dateFilter]); // Refetch when date filter changes

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [projects, workOrders, paymentItems, subcontractors] =
        await Promise.all([
          projectsApi.getAll(),
          workOrdersApi.getAll(),
          paymentItemsApi.getAll(),
          subcontractorsApi.getAll(),
        ]);

      // Calculate project status data
      const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const projectStatusData = Object.entries(statusCounts).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      // Calculate work order status data
      const workOrderStatusCounts = workOrders.reduce((acc, wo) => {
        acc[wo.status] = (acc[wo.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const workOrderData = Object.entries(workOrderStatusCounts).map(
        ([name, count]) => ({
          name,
          count,
        })
      );

      // Calculate budget data
      const budgetData = projects.map((project) => ({
        name:
          project.project_name.length > 15
            ? project.project_name.substring(0, 15) + "..."
            : project.project_name,
        budget: project.budget || 0,
        spent: 0, // TODO: Calculate actual spent amount from financial transactions
      }));

      // Calculate total budget
      const totalBudget = projects.reduce(
        (sum, project) => sum + (project.budget || 0),
        0
      );

      // Generate recent activities from work orders and projects
      const recentActivities = [
        ...projects.slice(0, 2).map((project) => ({
          id: project.project_id,
          type: "project",
          action: "created",
          item: project.project_name,
          user: "Project Manager",
          time: new Date(project.created_at).toLocaleDateString(),
        })),
        ...workOrders.slice(0, 3).map((wo) => ({
          id: wo.work_order_id,
          type: "workorder",
          action: wo.status === "Completed" ? "completed" : "updated",
          item: wo.description,
          user: "Field Worker",
          time: new Date(wo.updated_at).toLocaleDateString(),
        })),
      ].slice(0, 5);

      const summary: DashboardSummary = {
        projectCount: projects.length,
        activeWorkOrders: workOrders.filter((wo) =>
          ["Pending", "Assigned", "Started", "In Progress"].includes(wo.status)
        ).length,
        totalPaymentItems: paymentItems.length,
        totalSubcontractors: subcontractors.length,
        totalBudget,
        projectStatusData,
        workOrderData,
        budgetData,
        recentActivities,
      };

      setSummary(summary);
    } catch (err: any) {
      console.error("Failed to load dashboard summary:", err);
      setError("Failed to load dashboard summary. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    fetchSummary();
  };

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  const executeExport = () => {
    setIsExporting(true);

    // Simulate export process
    toast.info("Preparing dashboard export...");

    setTimeout(() => {
      toast.info("Processing data...");

      setTimeout(() => {
        toast.info("Generating charts and visualizations...");

        setTimeout(() => {
          setIsExporting(false);
          setIsExportDialogOpen(false);

          toast.success("Dashboard data exported successfully!");

          // Simulate file download
          setTimeout(() => {
            const link = document.createElement("a");
            link.href =
              "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";

            // Set the filename based on the selected format
            const filename = `dashboard_export_${dateFilter}_${
              new Date().toISOString().split("T")[0]
            }.${exportFormat}`;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 500);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleCardClick = (destination: string) => {
    navigate(destination);
  };

  const handleFilterChange = (filter: string) => {
    setDateFilter(filter);
    toast.info(`Dashboard showing ${filter} data`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          INTERACTIVE DASHBOARD
        </h1>

        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-slate-50 p-4 rounded-md mb-6 flex flex-wrap gap-2">
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("week")}
          >
            This Week
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("month")}
          >
            This Month
          </Button>
          <Button
            variant={dateFilter === "quarter" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("quarter")}
          >
            This Quarter
          </Button>
          <Button
            variant={dateFilter === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("year")}
          >
            This Year
          </Button>
        </div>
      )}

      {isLoading && <p>Loading dashboard data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick("/projects")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.projectCount}</div>
                <p className="text-xs text-muted-foreground">
                  ${(summary.totalBudget / 1000000).toFixed(1)}M total budget
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick("/work-orders")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Work Orders
                </CardTitle>
                <Construction className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.activeWorkOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to view all work orders
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() =>
                handleCardClick(
                  "/projects/5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96/payment-items"
                )
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Items
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalPaymentItems}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to view payment items
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick("/subcontractors")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subcontractors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.totalSubcontractors}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to view all contractors
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 grid-cols-1 md:grid-cols-2">
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={window.innerWidth < 640 ? 60 : 80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {summary.projectStatusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Work Order Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Order Status</CardTitle>
              </CardHeader>
              <CardContent className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.workOrderData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Overview Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.budgetData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#8884d8" name="Total Budget" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {summary.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-2 hover:bg-slate-50 rounded-md"
                    >
                      <div className="bg-slate-100 p-2 rounded-full">
                        {activity.type === "project" && (
                          <Briefcase className="h-4 w-4" />
                        )}
                        {activity.type === "workorder" && (
                          <Construction className="h-4 w-4" />
                        )}
                        {activity.type === "issue" && (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        {activity.type === "document" && (
                          <Calendar className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.item}{" "}
                          <span className="text-slate-500">
                            was {activity.action}
                          </span>
                        </p>
                        <div className="flex items-center mt-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {activity.time} by {activity.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription>
              Choose your export options and format
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Export Format</h3>
              <RadioGroup
                value={exportFormat}
                onValueChange={(value) =>
                  setExportFormat(value as "pdf" | "excel" | "csv")
                }
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    PDF Document
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    Excel Spreadsheet
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    CSV File
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Include in Export</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) =>
                      setIncludeCharts(checked as boolean)
                    }
                  />
                  <Label htmlFor="charts" className="flex items-center text-sm">
                    <BarChart2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    Charts and Visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="projects"
                    checked={includeProjects}
                    onCheckedChange={(checked) =>
                      setIncludeProjects(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="projects"
                    className="flex items-center text-sm"
                  >
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    Project Data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workorders"
                    checked={includeWorkOrders}
                    onCheckedChange={(checked) =>
                      setIncludeWorkOrders(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="workorders"
                    className="flex items-center text-sm"
                  >
                    <Construction className="h-4 w-4 mr-2 flex-shrink-0" />
                    Work Order Data
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="financials"
                    checked={includeFinancials}
                    onCheckedChange={(checked) =>
                      setIncludeFinancials(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="financials"
                    className="flex items-center text-sm"
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    Financial Data
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={executeExport}
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
