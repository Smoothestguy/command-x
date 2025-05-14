import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<string>("last30days");

  const handleExport = () => {
    toast.success("Reports exported successfully!");
  };

  const viewDocuments = () => {
    navigate("/documents");
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
    toast.info(`Date range updated to: ${value}`);
  };
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-muted-foreground">
            View your project metrics and reports
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
              <SelectItem value="allTime">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="default" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Projects:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Completed Projects:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress:</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Budget and cost overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Budget:</span>
                <span className="font-medium">$1,100,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Costs:</span>
                <span className="font-medium">$175,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Actual Costs:</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>Status of all work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Work Orders:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Assurance</CardTitle>
            <CardDescription>Quality issues and inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Inspections:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>Open Issues:</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span>Resolved Issues:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Equipment and labor usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Equipment Utilization:</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex justify-between">
                <span>Labor Hours:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency Rate:</span>
                <span className="font-medium">N/A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
            <CardDescription>Project documentation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Documents:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Approval:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>Recently Updated:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={viewDocuments}
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
