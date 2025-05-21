import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";
import { PaymentItemData } from "@/types/paymentItem";

interface SimpleAddPaymentItemDialogProps {
  projectId: number;
}

const SimpleAddPaymentItemDialog: React.FC<SimpleAddPaymentItemDialogProps> = ({
  projectId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  
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
      // Reset form
      setDescription("");
      setUnitOfMeasure("");
      setUnitPrice(0);
      setQuantity(0);
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", {
      description,
      unitOfMeasure,
      unitPrice,
      quantity,
    });
    
    createMutation.mutate({
      project_id: projectId,
      description,
      unit_of_measure: unitOfMeasure,
      unit_price: unitPrice,
      original_quantity: quantity,
      status: "pending",
    } as PaymentItemData);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Add Payment Item
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Item</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new payment item
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
              <Input
                id="unitOfMeasure"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                placeholder="e.g., sq ft, linear ft, each"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Payment Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleAddPaymentItemDialog;
