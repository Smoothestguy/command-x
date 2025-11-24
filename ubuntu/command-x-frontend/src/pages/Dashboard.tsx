import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProjects,
  getWorkOrders,
  getPaymentItems,
  getSubcontractors,
  getDashboardSummary,
  ProjectData,
  WorkOrderData,
} from "../services/api";
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
  // Optional fields used by mock data for richer dashboards
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalWorkOrders?: number;
  pendingWorkOrders?: number;
  inProgressWorkOrders?: number;
  completedWorkOrders?: number;
  pendingPayments?: number;
  activeSubcontractors?: number;
  totalRevenue?: number;
  totalExpenses?: number;
  netProfit?: number;
  workOrderStatusData?: Array<{ name: string; value: number }>;
  monthlyRevenueData?: Array<{ month: string; revenue: number; expenses: number }>;
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
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase not configured, using mock data");
        // Use mock data instead
        const mockSummary: DashboardSummary = {
          projectCount: 5,
          activeWorkOrders: 8,
          totalSubcontractors: 8,
          totalBudget: 750000,
          budgetData: [
            { name: "Smith Residence", budget: 250000, spent: 120000 },
            { name: "Downtown Office", budget: 350000, spent: 150000 },
            { name: "City Park", budget: 150000, spent: 40000 },
          ],
          workOrderData: [
            { name: "Pending", count: 4 },
            { name: "In Progress", count: 6 },
            { name: "Completed", count: 2 },
          ],
          recentActivities: [
            {
              id: "1",
              type: "project",
              action: "created",
              item: "Smith Residence Renovation",
              user: "Sarah Johnson",
              time: "2025-02-15",
            },
            {
              id: "2",
              type: "workorder",
              action: "updated",
              item: "Foundation inspection",
              user: "Mike Wilson",
              time: "2025-02-16",
            },
          ],
          totalProjects: 5,
          activeProjects: 3,
          completedProjects: 2,
          totalWorkOrders: 12,
          pendingWorkOrders: 4,
          inProgressWorkOrders: 6,
          completedWorkOrders: 2,
          totalPaymentItems: 25,
          pendingPayments: 8,
          activeSubcontractors: 6,
          totalRevenue: 125000,
          totalExpenses: 85000,
          netProfit: 40000,
          projectStatusData: [
            { name: "Active", value: 3 },
            { name: "Completed", value: 2 },
          ],
          workOrderStatusData: [
            { name: "Pending", value: 4 },
            { name: "In Progress", value: 6 },
            { name: "Completed", value: 2 },
          ],
          monthlyRevenueData: [
            { month: "Jan", revenue: 20000, expenses: 15000 },
            { month: "Feb", revenue: 25000, expenses: 18000 },
            { month: "Mar", revenue: 30000, expenses: 22000 },
            { month: "Apr", revenue: 28000, expenses: 20000 },
            { month: "May", revenue: 22000, expenses: 10000 },
          ],
        };
        setSummary(mockSummary);
        setIsLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [projects, workOrders, paymentItems, subcontractors] =
        (await Promise.all([
          getProjects(),
          getWorkOrders(),
          getPaymentItems(),
          getSubcontractors(),
        ])) as [ProjectData[], WorkOrderData[], any[], any[]];

      // Calculate project status data
      const statusCounts = projects.reduce<Record<string, number>>(
        (acc, project: ProjectData) => {
          const statusKey = project.status || "Unknown";
          acc[statusKey] = (acc[statusKey] || 0) + 1;
        return acc;
        },
        {}
      );

      const projectStatusData = Object.entries(statusCounts).map(
        ([name, value]) => ({
          name,
          value: Number(value || 0),
        })
      );

      // Calculate work order status data
      const workOrderStatusCounts = workOrders.reduce<Record<string, number>>(
        (acc, wo: WorkOrderData) => {
          const statusKey = wo.status || "Unknown";
          acc[statusKey] = (acc[statusKey] || 0) + 1;
          return acc;
        },
        {}
      );

      const workOrderData = Object.entries(workOrderStatusCounts).map(
        ([name, count]) => ({
          name,
          count: Number(count || 0),
        })
      );

      // Calculate budget data
      const budgetData = projects.map((project: ProjectData) => ({
        name:
          project.project_name.length > 15
            ? project.project_name.substring(0, 15) + "..."
            : project.project_name,
        budget: project.budget || 0,
        spent: 0, // TODO: Calculate actual spent amount from financial transactions
      }));

      // Calculate total budget
      const totalBudget = projects.reduce(
        (sum: number, project: ProjectData) => sum + (project.budget || 0),
        0
      );

      // Generate recent activities from work orders and projects
      const recentActivities = [
        ...projects.slice(0, 2).map((project: ProjectData) => ({
          id: String(project.project_id ?? ""),
          type: "project",
          action: "created",
          item: project.project_name,
          user: "Project Manager",
          time: new Date(
            project.created_at || new Date().toISOString()
          ).toLocaleDateString(),
        })),
        ...workOrders.slice(0, 3).map((wo: WorkOrderData) => ({
          id: String(wo.work_order_id ?? ""),
          type: "workorder",
          action: wo.status === "Completed" ? "completed" : "updated",
          item: wo.description,
          user: "Field Worker",
          time: new Date(
            wo.updated_at || new Date().toISOString()
          ).toLocaleDateString(),
        })),
      ].slice(0, 5);

      const summary: DashboardSummary = {
        projectCount: projects.length,
        activeWorkOrders: workOrders.filter((wo) =>
          ["Pending", "Assigned", "Started", "In Progress"].includes(
            String(wo.status || "")
          )
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
              onClick={() => {
                // Navigate to projects page where users can select a project to view payment items
                handleCardClick("/projects");
              }}
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
                  Click to select a project and view payment items
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
