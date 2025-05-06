import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface DashboardSummary {
  projectCount: number;
  activeWorkOrders: number;
  openIssuesCount: number;
  // Add more fields as needed
}

// Sample data for charts
const projectStatusData = [
  { name: "Planning", value: 1 },
  { name: "In Progress", value: 2 },
  { name: "Completed", value: 0 },
];

const workOrderData = [
  { name: "Pending", count: 2 },
  { name: "In Progress", count: 1 },
  { name: "Completed", count: 0 },
];

const budgetData = [
  { name: "Project 1", budget: 350000, spent: 0 },
  { name: "Project 2", budget: 1500000, spent: 0 },
  { name: "Project 3", budget: 250000, spent: 0 },
];

const recentActivities = [
  {
    id: 1,
    type: "project",
    action: "created",
    item: "Downtown Office Building",
    user: "Admin",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "workorder",
    action: "updated",
    item: "Foundation Work",
    user: "Admin",
    time: "3 hours ago",
  },
  {
    id: 3,
    type: "issue",
    action: "reported",
    item: "Material Quality Issue",
    user: "Admin",
    time: "1 day ago",
  },
  {
    id: 4,
    type: "document",
    action: "uploaded",
    item: "Site Inspection Report",
    user: "Admin",
    time: "2 days ago",
  },
];

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("week"); // "week", "month", "quarter", "year"
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchSummary();
  }, [dateFilter]); // Refetch when date filter changes

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      // Catch specific error types if possible
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
    toast.success("Dashboard data exported successfully!");
    // In a real app, this would generate a CSV/PDF export
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  Click to view all projects
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
              onClick={() => handleCardClick("/quality-control")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Issues
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.openIssuesCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to view all issues
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            {/* Project Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {projectStatusData.map((_, index) => (
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
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workOrderData}
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
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetData}
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
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
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
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.item}{" "}
                          <span className="text-slate-500">
                            was {activity.action}
                          </span>
                        </p>
                        <div className="flex items-center mt-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.time} by {activity.user}
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
    </div>
  );
};

export default Dashboard;
