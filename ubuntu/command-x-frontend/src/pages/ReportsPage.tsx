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
import { toast } from "sonner";
import { Save, Download } from "lucide-react";

const ReportsPage: React.FC = () => {
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

  return (
    <div className="p-4 md:p-8">
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
            SAVE CHANGES NOW
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Overall project status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Total Projects:</span>
                <span className="font-medium">3</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Completed Projects:</span>
                <span className="font-medium">0</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>In Progress:</span>
                <span className="font-medium">3</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Total Budget:</span>
                <span className="font-medium">$1,100,000.00</span>
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
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Total Budget:</span>
                <span className="font-medium">$1,100,000.00</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Estimated Costs:</span>
                <span className="font-medium">$175,000.00</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Actual Costs:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Remaining Budget:</span>
                <span className="font-medium">$925,000.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Order Status</CardTitle>
            <CardDescription>Work order completion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Total Work Orders:</span>
                <span className="font-medium">3</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Pending:</span>
                <span className="font-medium">3</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>In Progress:</span>
                <span className="font-medium">0</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Completed:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Issues</CardTitle>
            <CardDescription>Quality control metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Total Issues:</span>
                <span className="font-medium">2</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Open Issues:</span>
                <span className="font-medium">2</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>High Severity:</span>
                <span className="font-medium text-red-500">2</span>
              </div>
              <div
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-md transition-colors"
                onClick={simulateChanges}
              >
                <span>Resolved Issues:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button
                variant="destructive"
                className="w-full"
                onClick={simulateChanges}
              >
                View Critical Issues
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

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

export default ReportsPage;
