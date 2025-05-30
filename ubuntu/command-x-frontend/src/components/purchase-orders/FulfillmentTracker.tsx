import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseOrderData, PurchaseOrderItemData, FulfillmentData, FulfillmentItemData } from '../../types/purchaseOrder';
import { createFulfillment } from '../../services/purchaseOrderApi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Progress } from "../../components/ui/progress";
import { toast } from 'sonner';

interface FulfillmentTrackerProps {
  purchaseOrder: PurchaseOrderData;
  onSuccess: () => void;
  onCancel: () => void;
}

const FulfillmentTracker: React.FC<FulfillmentTrackerProps> = ({
  purchaseOrder,
  onSuccess,
  onCancel
}) => {
  const queryClient = useQueryClient();
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [fulfillmentItems, setFulfillmentItems] = useState<FulfillmentItemData[]>(
    purchaseOrder.items.map(item => ({
      purchase_order_item_id: item.item_id!,
      quantity_received: 0,
      notes: ''
    }))
  );
  
  // Create fulfillment mutation
  const createFulfillmentMutation = useMutation({
    mutationFn: createFulfillment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', purchaseOrder.purchase_order_id] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      toast.success('Fulfillment recorded successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to record fulfillment');
      console.error('Error recording fulfillment:', error);
    }
  });
  
  // Handle quantity change
  const handleQuantityChange = (index: number, value: number) => {
    const newFulfillmentItems = [...fulfillmentItems];
    newFulfillmentItems[index] = { ...newFulfillmentItems[index], quantity_received: value };
    setFulfillmentItems(newFulfillmentItems);
  };
  
  // Handle notes change
  const handleNotesChange = (index: number, value: string) => {
    const newFulfillmentItems = [...fulfillmentItems];
    newFulfillmentItems[index] = { ...newFulfillmentItems[index], notes: value };
    setFulfillmentItems(newFulfillmentItems);
  };
  
  // Calculate remaining quantity
  const getRemainingQuantity = (item: PurchaseOrderItemData) => {
    return item.quantity - (item.received_quantity || 0);
  };
  
  // Calculate fulfillment percentage
  const getFulfillmentPercentage = (item: PurchaseOrderItemData) => {
    if (item.quantity === 0) return 0;
    return Math.round(((item.received_quantity || 0) / item.quantity) * 100);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one item has a quantity
    if (fulfillmentItems.every(item => item.quantity_received === 0)) {
      toast.error('Please enter at least one received quantity');
      return;
    }
    
    // Validate that quantities don't exceed remaining quantities
    for (let i = 0; i < fulfillmentItems.length; i++) {
      const fulfillmentItem = fulfillmentItems[i];
      const purchaseOrderItem = purchaseOrder.items.find(item => item.item_id === fulfillmentItem.purchase_order_item_id);
      
      if (purchaseOrderItem) {
        const remaining = getRemainingQuantity(purchaseOrderItem);
        if (fulfillmentItem.quantity_received > remaining) {
          toast.error(`Received quantity for ${purchaseOrderItem.description} exceeds remaining quantity`);
          return;
        }
      }
    }
    
    // Create fulfillment data
    const fulfillmentData: FulfillmentData = {
      purchase_order_id: purchaseOrder.purchase_order_id!,
      delivery_date: deliveryDate,
      received_by: receivedBy || undefined,
      notes: notes || undefined,
      items: fulfillmentItems.filter(item => item.quantity_received > 0)
    };
    
    createFulfillmentMutation.mutate(fulfillmentData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="received_by">Received By</Label>
          <Input
            id="received_by"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            placeholder="Name of receiver"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="General notes about this delivery"
          rows={2}
        />
      </div>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Items Received</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Ordered</TableHead>
              <TableHead>Previously Received</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Receiving Now</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrder.items.map((item, index) => {
              const remaining = getRemainingQuantity(item);
              const fulfillmentPercentage = getFulfillmentPercentage(item);
              const newFulfillmentPercentage = Math.round(
                ((item.received_quantity || 0) + fulfillmentItems[index].quantity_received) / item.quantity * 100
              );
              
              return (
                <TableRow key={item.item_id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.received_quantity || 0}</TableCell>
                  <TableCell>{remaining}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={remaining}
                      value={fulfillmentItems[index].quantity_received}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    />
                    {fulfillmentItems[index].quantity_received > 0 && (
                      <Input
                        className="mt-2"
                        placeholder="Item notes"
                        value={fulfillmentItems[index].notes || ''}
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={fulfillmentPercentage} className="h-2" />
                      <span className="text-xs">{fulfillmentPercentage}%</span>
                    </div>
                    {fulfillmentItems[index].quantity_received > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={newFulfillmentPercentage} className="h-2 bg-blue-100" />
                        <span className="text-xs text-blue-600">{newFulfillmentPercentage}%</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createFulfillmentMutation.isPending}>
          {createFulfillmentMutation.isPending ? 'Recording...' : 'Record Fulfillment'}
        </Button>
      </div>
    </form>
  );
};

export default FulfillmentTracker;
