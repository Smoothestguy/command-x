import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getOverallProgressReport,
  getProjectFinancialSummary,
  getProjects,
  ProjectData,
} from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// Placeholder for more complex report data structure
interface OverallProgressData {
  totalProjects: number;
  completedProjects: number;
  totalBudget: number;
  // Add more fields as needed
}

interface ProjectFinancialData {
  projectId: number;
  projectName: string;
  budget: number;
  estimatedCost: number;
  actualCost: number;
  amountBilled: number;
  amountPaid: number;
  // Add more fields
}

const Reports: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(undefined);
  const [hasChanges, setHasChanges] = useState(false);

  // Function to handle saving changes
  const handleSave = () => {
    // Simulate saving data
    toast.success("Report settings saved successfully!");
    setHasChanges(false);
  };

  // Function to handle exporting report
  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  // Simulate changes when interacting with the report
  const simulateChanges = () => {
    setHasChanges(true);
  };

  // Fetch overall progress report
  const {
    data: overallProgress,
    isLoading: isLoadingOverall,
    error: errorOverall,
  } = useQuery<OverallProgressData, Error>({
    queryKey: ["overallProgressReport"],
    queryFn: getOverallProgressReport,
  });

  // Fetch projects for the dropdown
  const { data: projects } = useQuery<ProjectData[], Error>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Fetch financial summary for the selected project
  const {
    data: projectFinancials,
    isLoading: isLoadingFinancials,
    error: errorFinancials,
  } = useQuery<ProjectFinancialData, Error>({
    queryKey: ["projectFinancialSummary", selectedProjectId],
    queryFn: () => getProjectFinancialSummary(Number(selectedProjectId)),
    enabled: !!selectedProjectId, // Only run query if a project is selected
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>

        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={!hasChanges}
            className={!hasChanges ? "opacity-50" : ""}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overall Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress Summary</CardTitle>
          <CardDescription>
            High-level metrics across all projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingOverall && <p>Loading overall summary...</p>}
          {errorOverall && (
            <p className="text-red-500">
              Error loading summary: {errorOverall.message}
            </p>
          )}
          {overallProgress && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={simulateChanges}
              >
                <CardHeader className="pb-2">
                  <CardDescription>Total Projects</CardDescription>
                  <CardTitle className="text-4xl">
                    {overallProgress.totalProjects}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={simulateChanges}
              >
                <CardHeader className="pb-2">
                  <CardDescription>Completed Projects</CardDescription>
                  <CardTitle className="text-4xl">
                    {overallProgress.completedProjects}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={simulateChanges}
              >
                <CardHeader className="pb-2">
                  <CardDescription>Total Budget</CardDescription>
                  <CardTitle className="text-4xl">
                    ${overallProgress.totalBudget.toLocaleString()}
                  </CardTitle>
                </CardHeader>
              </Card>
              {/* Add more summary cards here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Financial Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Project Financial Summary</CardTitle>
          <CardDescription>
            Select a project to view its financial details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedProjectId}
            onValueChange={(value) => {
              setSelectedProjectId(value);
              simulateChanges();
            }}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select a project</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.project_id} value={p.project_id!.toString()}>
                  {p.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isLoadingFinancials && selectedProjectId && (
            <p>Loading financial summary...</p>
          )}
          {errorFinancials && selectedProjectId && (
            <p className="text-red-500">
              Error loading financials: {errorFinancials.message}
            </p>
          )}
          {projectFinancials && selectedProjectId && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Budget</TableCell>
                  <TableCell className="text-right">
                    ${projectFinancials.budget?.toLocaleString() || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Estimated Cost (Work Orders)</TableCell>
                  <TableCell className="text-right">
                    $
                    {projectFinancials.estimatedCost?.toLocaleString() || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Actual Cost (Work Orders)</TableCell>
                  <TableCell className="text-right">
                    ${projectFinancials.actualCost?.toLocaleString() || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Amount Billed</TableCell>
                  <TableCell className="text-right">
                    ${projectFinancials.amountBilled?.toLocaleString() || "N/A"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell className="text-right">
                    ${projectFinancials.amountPaid?.toLocaleString() || "N/A"}
                  </TableCell>
                </TableRow>
                {/* Add more financial rows */}
              </TableBody>
            </Table>
          )}
          {!selectedProjectId && (
            <p className="text-muted-foreground">
              Please select a project to view its financial summary.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add more report sections as needed (e.g., Resource Allocation, Schedule Variance) */}

      {/* Unsaved changes indicator */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-md shadow-md">
          You have unsaved changes. Click the Save Changes button to save your
          work.
        </div>
      )}
    </div>
  );
};

export default Reports;
