import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { PaymentItemData } from "@/types/paymentItem";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updatePaymentItem, getLocations } from "@/services/paymentItemsApi";
import { getWorkOrders } from "@/services/api";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicEditPaymentItemButtonProps {
  projectId: number;
  paymentItem: PaymentItemData;
}

const BasicEditPaymentItemButton: React.FC<BasicEditPaymentItemButtonProps> = ({
  projectId,
  paymentItem,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(paymentItem.description);
  const [unitOfMeasure, setUnitOfMeasure] = useState(paymentItem.unit_of_measure);
  const [unitPrice, setUnitPrice] = useState<number>(paymentItem.unit_price);
  const [quantity, setQuantity] = useState<number>(paymentItem.original_quantity);
  const [actualQuantity, setActualQuantity] = useState<number | undefined>(paymentItem.actual_quantity);
  const [locationId, setLocationId] = useState<number | undefined>(paymentItem.location_id);
  const [workOrderId, setWorkOrderId] = useState<number | undefined>(paymentItem.work_order_id);
  const [status, setStatus] = useState(paymentItem.status);
  const [notes, setNotes] = useState(paymentItem.notes || "");
  
  const queryClient = useQueryClient();

  // Fetch locations for the project
  const { data: locations } = useQuery({
    queryKey: ["locations", projectId],
    queryFn: () => getLocations({ projectId }),
  });

  // Fetch work orders for the project
  const { data: workOrders } = useQuery({
    queryKey: ["workOrders", projectId],
    queryFn: () => getWorkOrders(projectId),
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
      console.log("Payment item updated successfully");
      
      // Force a refetch of the payment items
      queryClient.invalidateQueries({ queryKey: ["paymentItems"] });
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      
      toast({
        title: "Success",
        description: "Payment item updated successfully",
      });
      setIsOpen(false);
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
      actualQuantity,
      locationId,
      workOrderId,
      status,
      notes,
    });
    
    // Create update data object
    const updateData: Partial<PaymentItemData> = {
      description,
      unit_of_measure: unitOfMeasure,
      unit_price: unitPrice,
      original_quantity: quantity,
      status: status as PaymentItemData['status'],
      notes,
    };
    
    // Only add optional fields if they have values
    if (actualQuantity !== undefined) {
      updateData.actual_quantity = actualQuantity;
    }
    
    if (locationId !== undefined) {
      updateData.location_id = locationId;
    }
    
    if (workOrderId !== undefined) {
      updateData.work_order_id = workOrderId;
    }
    
    console.log("Updating payment item:", paymentItem.item_id, updateData);
    updateMutation.mutate({ 
      itemId: paymentItem.item_id, 
      data: updateData 
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Edit item"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Item</DialogTitle>
            <DialogDescription>
              Update the details of the payment item
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
                <Label htmlFor="quantity">Original Quantity</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="actualQuantity">Actual Quantity</Label>
              <Input
                id="actualQuantity"
                type="number"
                step="0.01"
                value={actualQuantity || ""}
                onChange={(e) => setActualQuantity(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Leave blank if same as original"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={locationId?.toString() || ""}
                  onValueChange={(value) => setLocationId(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {locations?.map((location) => (
                      <SelectItem
                        key={location.location_id}
                        value={location.location_id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workOrder">Work Order</Label>
                <Select
                  value={workOrderId?.toString() || ""}
                  onValueChange={(value) => setWorkOrderId(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger id="workOrder">
                    <SelectValue placeholder="Select work order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {workOrders?.map((workOrder) => (
                      <SelectItem
                        key={workOrder.work_order_id}
                        value={workOrder.work_order_id.toString()}
                      >
                        {workOrder.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as PaymentItemData['status'])}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any additional notes"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Payment Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BasicEditPaymentItemButton;
