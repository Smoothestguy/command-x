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
import PaymentItemForm from "@/components/payment-items/PaymentItemForm";
import { PaymentItemData } from "@/types/paymentItem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { toast } from "sonner";

const TestAddCustomItem: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Test project ID
  const projectId = "85b7f467-a860-4962-b645-51ea950b526f";

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createPaymentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast.success("Payment item created successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(
        `Failed to create payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });

  // Handle form submission
  const handleSubmit = (data: Partial<PaymentItemData>) => {
    console.log("TestAddCustomItem handleSubmit called with data:", data);
    createMutation.mutate({
      ...data,
      project_id: projectId,
    } as PaymentItemData);
  };

  const handleOpenDialog = () => {
    console.log("Opening Add Custom Item dialog");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("Closing Add Custom Item dialog");
    setIsDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Test Add Custom Item
          </h1>
          <p className="text-muted-foreground">
            Test the "Add Custom Item" functionality in isolation
          </p>
        </div>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Custom Item
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p><strong>Project ID:</strong> {projectId}</p>
        <p><strong>Dialog Open:</strong> {isDialogOpen ? "Yes" : "No"}</p>
        <p><strong>Mutation Status:</strong> {createMutation.status}</p>
        {createMutation.error && (
          <p className="text-red-600">
            <strong>Error:</strong> {createMutation.error.message}
          </p>
        )}
      </div>

      {/* Add Payment Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Payment Item</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new payment item
            </DialogDescription>
          </DialogHeader>
          <PaymentItemForm
            projectId={projectId}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestAddCustomItem;
