import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEnhancedWorkOrder, EnhancedWorkOrderData } from "@/services/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EnhancedWorkOrderForm from "./EnhancedWorkOrderForm";

interface EnhancedWorkOrderDialogProps {
  projectId?: number;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedWorkOrderDialog: React.FC<EnhancedWorkOrderDialogProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Create enhanced work order mutation
  const createMutation = useMutation({
    mutationFn: createEnhancedWorkOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["paymentItems"] });
      queryClient.invalidateQueries({ queryKey: ["projectBudgetSummary"] });
      
      toast.success("Work Order created successfully!", {
        description: `Work order "${data.description}" has been created with ${
          data.selectedPaymentItems?.length || 0
        } assigned items and ${
          data.newLineItems?.length || 0
        } new line items.`,
      });
      
      onClose();
    },
    onError: (error) => {
      console.error("Error creating enhanced work order:", error);
      toast.error("Failed to create work order", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    },
  });

  const handleSubmit = (data: EnhancedWorkOrderData) => {
    console.log("Creating enhanced work order with data:", data);
    
    // Validate that we have either selected items or new items
    if (data.selectedPaymentItems.length === 0 && data.newLineItems.length === 0) {
      toast.error("Please select payment items or add new line items", {
        description: "A work order must have at least one line item.",
      });
      return;
    }

    createMutation.mutate(data);
  };

  const handleCancel = () => {
    if (createMutation.isPending) {
      toast.warning("Cannot cancel while creating work order");
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Enhanced Work Order</DialogTitle>
          <DialogDescription>
            Create a work order by assigning existing payment items and/or adding new line items.
            This will help track project budget allocation and work progress.
          </DialogDescription>
        </DialogHeader>
        
        <EnhancedWorkOrderForm
          projectId={projectId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedWorkOrderDialog;
