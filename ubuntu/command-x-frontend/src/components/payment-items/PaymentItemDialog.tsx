import React from "react";
import { PaymentItemData } from "@/types/paymentItem";
import PaymentItemForm from "./PaymentItemForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentItem,
  updatePaymentItem,
} from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";

interface PaymentItemDialogProps {
  projectId: string | number; // Support both UUID strings and legacy numbers
  paymentItem?: PaymentItemData;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentItemDialog: React.FC<PaymentItemDialogProps> = ({
  projectId,
  paymentItem,
  isOpen,
  onClose,
}) => {
  console.log("PaymentItemDialog rendered with:", {
    projectId,
    paymentItem,
    isOpen,
  });

  const queryClient = useQueryClient();
  const isEditing = !!paymentItem;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createPaymentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast({
        title: "Success",
        description: "Payment item created successfully",
      });
      onClose();
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: number;
      data: Partial<PaymentItemData>;
    }) => updatePaymentItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast({
        title: "Success",
        description: "Payment item updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: Partial<PaymentItemData>) => {
    console.log("PaymentItemDialog handleSubmit called with data:", data);

    if (isEditing && paymentItem) {
      console.log("Updating existing payment item:", paymentItem.item_id);
      updateMutation.mutate({ itemId: paymentItem.item_id, data });
    } else {
      console.log("Creating new payment item for project:", projectId);
      createMutation.mutate({
        ...data,
        project_id: projectId,
      } as PaymentItemData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Payment Item" : "Add Payment Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of the payment item"
              : "Fill in the details to create a new payment item"}
          </DialogDescription>
        </DialogHeader>
        <PaymentItemForm
          projectId={projectId}
          initialData={paymentItem}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentItemDialog;
