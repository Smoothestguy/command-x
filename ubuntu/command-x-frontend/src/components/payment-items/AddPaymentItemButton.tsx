import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PaymentItemData } from "@/types/paymentItem";
import PaymentItemForm from "./PaymentItemForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddPaymentItemButtonProps {
  projectId: number;
}

const AddPaymentItemButton: React.FC<AddPaymentItemButtonProps> = ({
  projectId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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

  const handleOpenDialog = () => {
    console.log("Opening dialog");
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={handleOpenDialog} type="button">
        <Plus className="h-4 w-4 mr-2" /> Add Payment Item
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
    </>
  );
};

export default AddPaymentItemButton;
