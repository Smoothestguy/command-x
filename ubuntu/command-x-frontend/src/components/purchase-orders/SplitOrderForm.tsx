import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { PurchaseOrderData, SplitOrderData } from '../../types/purchaseOrder';
import { getVendors, splitPurchaseOrder } from '../../services/purchaseOrderApi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from 'sonner';

interface SplitOrderFormProps {
  purchaseOrder: PurchaseOrderData;
  onSuccess: () => void;
  onCancel: () => void;
}

const SplitOrderForm: React.FC<SplitOrderFormProps> = ({
  purchaseOrder,
  onSuccess,
  onCancel
}) => {
  const queryClient = useQueryClient();
  const [newVendorId, setNewVendorId] = useState<number | ''>('');
  const [splitItems, setSplitItems] = useState<{
    purchase_order_item_id: number;
    quantity: number;
    maxQuantity: number;
    description: string;
  }[]>(
    purchaseOrder.items.map(item => ({
      purchase_order_item_id: item.item_id!,
      quantity: 0,
      maxQuantity: item.quantity - (item.received_quantity || 0),
      description: item.description
    }))
  );
  
  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: getVendors
  });
  
  // Split purchase order mutation
  const splitOrderMutation = useMutation({
    mutationFn: splitPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', purchaseOrder.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Purchase order split successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to split purchase order');
      console.error('Error splitting purchase order:', error);
    }
  });
  
  // Handle quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const newSplitItems = [...splitItems];
    newSplitItems[index] = { ...newSplitItems[index], quantity: value };
    setSplitItems(newSplitItems);
  };
  
  // Calculate total items to be split
  const calculateTotalSplitItems = () => {
    return splitItems.reduce((count, item) => count + (item.quantity > 0 ? 1 : 0), 0);
  };
  
  // Calculate total quantity to be split
  const calculateTotalSplitQuantity = () => {
    return splitItems.reduce((sum, item) => sum + item.quantity, 0);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVendorId) {
      toast.error('Please select a vendor');
      return;
    }
    
    // Validate that at least one item has a quantity
    if (splitItems.every(item => item.quantity === 0)) {
      toast.error('Please enter at least one quantity to split');
      return;
    }
    
    // Validate that quantities don't exceed maximum quantities
    for (const item of splitItems) {
      if (item.quantity > item.maxQuantity) {
        toast.error(`Quantity for ${item.description} exceeds available quantity`);
        return;
      }
    }
    
    // Create split order data
    const splitOrderData: SplitOrderData = {
      original_purchase_order_id: purchaseOrder.purchase_order_id!,
      new_vendor_id: Number(newVendorId),
      items: splitItems
        .filter(item => item.quantity > 0)
        .map(item => ({
          purchase_order_item_id: item.purchase_order_item_id,
          quantity: item.quantity
        }))
    };
    
    splitOrderMutation.mutate(splitOrderData);
  };
  
  // Filter out vendors that are the same as the current purchase order
  const filteredVendors = vendors?.filter(vendor => 
    vendor.vendor_id !== purchaseOrder.vendor_id
  );
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="new_vendor" className="text-right">
          New Vendor
        </Label>
        <Select
          value={newVendorId.toString()}
          onValueChange={(value) => setNewVendorId(Number(value))}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent>
            {filteredVendors?.map((vendor) => (
              <SelectItem key={vendor.vendor_id} value={vendor.vendor_id!.toString()}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Items to Split</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the quantities you want to move to the new vendor. The original purchase order will be updated with the remaining quantities.
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Original Quantity</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Quantity to Split</TableHead>
              <TableHead>Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {splitItems.map((item, index) => {
              const originalItem = purchaseOrder.items.find(i => i.item_id === item.purchase_order_item_id);
              const originalQuantity = originalItem?.quantity || 0;
              const remaining = item.maxQuantity - item.quantity;
              
              return (
                <TableRow key={item.purchase_order_item_id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{originalQuantity}</TableCell>
                  <TableCell>{item.maxQuantity}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>{remaining}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <div className="flex justify-end mt-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Items to Split</div>
            <div className="text-xl font-bold">{calculateTotalSplitItems()} items ({calculateTotalSplitQuantity()} units)</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={splitOrderMutation.isPending}>
          {splitOrderMutation.isPending ? 'Splitting...' : 'Split Order'}
        </Button>
      </div>
    </form>
  );
};

export default SplitOrderForm;
