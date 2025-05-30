import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import { PaymentItemData } from "@/types/paymentItem";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InlineEditPaymentItemProps {
  projectId: number;
  paymentItem: PaymentItemData;
  onCancel: () => void;
}

const InlineEditPaymentItem: React.FC<InlineEditPaymentItemProps> = ({
  projectId,
  paymentItem,
  onCancel,
}) => {
  const [description, setDescription] = useState(paymentItem.description);
  const [unitOfMeasure, setUnitOfMeasure] = useState(paymentItem.unit_of_measure);
  const [unitPrice, setUnitPrice] = useState<number>(paymentItem.unit_price);
  const [quantity, setQuantity] = useState<number>(paymentItem.original_quantity);
  
  const queryClient = useQueryClient();

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
      console.log("Payment item updated successfully");
      
      // Force a refetch of the payment items
      queryClient.invalidateQueries({ queryKey: ["paymentItems"] });
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      
      toast({
        title: "Success",
        description: "Payment item updated successfully",
      });
      onCancel(); // Close the inline editor
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", {
      description,
      unitOfMeasure,
      unitPrice,
      quantity,
    });
    
    // Create update data object
    const updateData: Partial<PaymentItemData> = {
      description,
      unit_of_measure: unitOfMeasure,
      unit_price: unitPrice,
      original_quantity: quantity,
      // Calculate total price
      total_price: unitPrice * quantity,
    };
    
    console.log("Updating payment item:", paymentItem.item_id, updateData);
    updateMutation.mutate({ 
      itemId: paymentItem.item_id, 
      data: updateData 
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Payment Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit of Measure</label>
              <Input
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                placeholder="e.g., sq ft, linear ft, each"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Price</label>
              <Input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <Input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium">Total: ${(unitPrice * quantity).toFixed(2)}</p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InlineEditPaymentItem;
