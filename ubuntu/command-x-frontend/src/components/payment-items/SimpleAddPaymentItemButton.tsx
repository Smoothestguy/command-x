import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentItemData } from "@/types/paymentItem";
import PaymentItemForm from "./PaymentItemForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";

interface SimpleAddPaymentItemButtonProps {
  projectId: number;
}

const SimpleAddPaymentItemButton: React.FC<SimpleAddPaymentItemButtonProps> = ({ projectId }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createPaymentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast({
        title: "Success",
        description: "Payment item created successfully",
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: Partial<PaymentItemData>) => {
    createMutation.mutate({
      ...data,
      project_id: projectId,
    } as PaymentItemData);
  };

  const openDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Opening dialog");
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      <Button 
        onClick={openDialog}
        type="button"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Payment Item
      </Button>

      <dialog 
        ref={dialogRef} 
        className="p-0 rounded-lg shadow-lg backdrop:bg-black backdrop:bg-opacity-50"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Add Payment Item</h2>
            <p className="text-sm text-gray-500">Fill in the details to create a new payment item</p>
          </div>
          
          <PaymentItemForm
            projectId={projectId}
            onSubmit={handleSubmit}
            onCancel={closeDialog}
          />
        </div>
      </dialog>
    </>
  );
};

export default SimpleAddPaymentItemButton;
