import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectData } from "@/services/api";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Calendar,
  BarChart2,
  FileSpreadsheet,
  File,
  Mail,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import { DateRange } from "react-day-picker";

interface FinancialReportGeneratorProps {
  projects: ProjectData[];
  dateRange: DateRange | undefined;
}

const FinancialReportGenerator: React.FC<FinancialReportGeneratorProps> = ({
  projects,
  dateRange,
}) => {
  const [reportType, setReportType] = useState("project_summary");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [reportDateRange, setReportDateRange] = useState(dateRange);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [scheduledReports] = useState([
    {
      id: 1,
      name: "Monthly Project Summary",
      type: "Project Summary",
      frequency: "Monthly",
      lastRun: "2023-04-01",
      nextRun: "2023-05-01",
    },
    {
      id: 2,
      name: "Weekly Payment Status",
      type: "Payment Status",
      frequency: "Weekly",
      lastRun: "2023-04-21",
      nextRun: "2023-04-28",
    },
  ]);

  const reportTypes = [
    { id: "project_summary", name: "Project Financial Summary" },
    { id: "payment_status", name: "Payment Status Report" },
    { id: "subcontractor_payments", name: "Subcontractor Payment Report" },
    { id: "retainage_summary", name: "Retainage Summary" },
    { id: "change_orders", name: "Change Order Report" },
    { id: "budget_variance", name: "Budget Variance Analysis" },
    { id: "cash_flow", name: "Cash Flow Projection" },
  ];

  const exportFormats = [
    { id: "pdf", name: "PDF", icon: <File className="h-4 w-4 mr-2" /> },
    {
      id: "excel",
      name: "Excel",
      icon: <FileSpreadsheet className="h-4 w-4 mr-2" />,
    },
    { id: "csv", name: "CSV", icon: <FileText className="h-4 w-4 mr-2" /> },
  ];

  const handleGenerateReport = () => {
    // Implementation for generating report
    alert(
      `Generating ${getReportTypeName(
        reportType
      )} in ${selectedFormat.toUpperCase()} format`
    );
  };

  const handleScheduleReport = () => {
    // Implementation for scheduling report
    alert("Report scheduled successfully!");
  };

  const handleEmailReport = () => {
    // Implementation for emailing report
    alert("Report will be emailed when generated");
  };

  const getReportTypeName = (typeId: string) => {
    const reportType = reportTypes.find((type) => type.id === typeId);
    return reportType ? reportType.name : "Unknown Report";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure your financial report parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-filter">Project Filter</Label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                  >
                    <SelectTrigger id="project-filter">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.project_id}
                          value={project.project_id?.toString() || ""}
                        >
                          {project.project_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <DatePickerWithRange
                    date={reportDateRange}
                    setDate={setReportDateRange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-format">Export Format</Label>
                  <div className="flex flex-wrap gap-3">
                    {exportFormats.map((format) => (
                      <Button
                        key={format.id}
                        type="button"
                        variant={
                          selectedFormat === format.id ? "default" : "outline"
                        }
                        className="flex items-center"
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        {format.icon}
                        {format.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Report Options</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-charts"
                        checked={includeCharts}
                        onCheckedChange={(checked) =>
                          setIncludeCharts(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="include-charts"
                        className="cursor-pointer"
                      >
                        Include charts and visualizations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-details"
                        checked={includeDetails}
                        onCheckedChange={(checked) =>
                          setIncludeDetails(checked as boolean)
                        }
                      />
                      <Label
                        htmlFor="include-details"
                        className="cursor-pointer"
                      >
                        Include detailed breakdown
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleScheduleReport}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEmailReport}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button onClick={handleGenerateReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Report Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Preview of your selected report
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-200 rounded-md">
                <BarChart2 className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">
                  {getReportTypeName(reportType)}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedProject === "all"
                    ? "All Projects"
                    : `Project: ${
                        projects.find(
                          (p) => p.project_id?.toString() === selectedProject
                        )?.project_name
                      }`}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Date Range:{" "}
                  {reportDateRange?.from
                    ? format(reportDateRange.from, "MMM d, yyyy")
                    : "Start"}{" "}
                  -{" "}
                  {reportDateRange?.to
                    ? format(reportDateRange.to, "MMM d, yyyy")
                    : "End"}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Click "Generate Report" to create your report
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage your scheduled financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.frequency}</TableCell>
                      <TableCell>
                        {format(new Date(report.lastRun), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.nextRun), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Create Scheduled Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import Table components for the scheduled reports tab
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default FinancialReportGenerator;
