import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import SimplePaymentItemForm from "@/components/payment-items/SimplePaymentItemForm";

const SimpleFormTest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Test project ID
  const projectId = "85b7f467-a860-4962-b645-51ea950b526f";

  // Handle form submission
  const handleSubmit = (data: any) => {
    console.log("SimpleFormTest handleSubmit called with data:", data);
    alert("Form submitted successfully! Check console for data.");
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    console.log("Opening Simple Form dialog");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing Simple Form dialog");
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Simple Form Test
          </h1>
          <p className="text-muted-foreground">
            Test the payment item form without API dependencies
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Open Simple Form
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p><strong>Project ID:</strong> {projectId}</p>
        <p><strong>Dialog Open:</strong> {isDialogOpen ? "Yes" : "No"}</p>
        <p><strong>Purpose:</strong> Test form without API calls to isolate the issue</p>
      </div>

      {/* Simple Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Payment Item (Simple)</DialogTitle>
            <DialogDescription>
              Simple form without API dependencies to test basic functionality
            </DialogDescription>
          </DialogHeader>
          <SimplePaymentItemForm
            projectId={projectId}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleFormTest;
