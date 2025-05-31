import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";

interface DeletePaymentItemDialogProps {
  projectId: string | number; // Support both UUID strings and legacy numbers
  itemId: number;
  itemDescription: string;
  isOpen: boolean;
  onClose: () => void;
}

const DeletePaymentItemDialog: React.FC<DeletePaymentItemDialogProps> = ({
  projectId,
  itemId,
  itemDescription,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePaymentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast({
        title: "Success",
        description: "Payment item deleted successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(itemId);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the payment item:{" "}
            <span className="font-medium">{itemDescription}</span>. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePaymentItemDialog;
