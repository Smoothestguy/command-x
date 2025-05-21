import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PurchaseOrderData, PurchaseOrderItemData } from '../../types/purchaseOrder';
import { getVendors, createPurchaseOrder } from '../../services/purchaseOrderApi';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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

interface PurchaseOrderFormProps {
  workOrderId: number;
  onSuccess: (purchaseOrder: PurchaseOrderData) => void;
  onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  workOrderId,
  onSuccess,
  onCancel
}) => {
  const queryClient = useQueryClient();
  
  // State for form fields
  const [vendorId, setVendorId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState<PurchaseOrderItemData[]>([
    { description: '', quantity: 1, unit_price: 0 }
  ]);
  
  // Fetch vendors
  const { data: vendors, isLoading: isLoadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: getVendors
  });
  
  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders', workOrderId] });
      toast.success('Purchase order created successfully');
      onSuccess(data);
    },
    onError: (error) => {
      toast.error('Failed to create purchase order');
      console.error('Error creating purchase order:', error);
    }
  });
  
  // Handle item changes
  const handleItemChange = (index: number, field: keyof PurchaseOrderItemData, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  
  // Add a new item
  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  };
  
  // Remove an item
  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };
  
  // Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId) {
      toast.error('Please select a vendor');
      return;
    }
    
    if (items.some(item => !item.description || item.quantity <= 0)) {
      toast.error('Please fill in all item details');
      return;
    }
    
    const purchaseOrderData: PurchaseOrderData = {
      work_order_id: workOrderId,
      vendor_id: Number(vendorId),
      status: 'Draft',
      expected_delivery_date: expectedDeliveryDate || undefined,
      notes: notes || undefined,
      items: items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price)
      }))
    };
    
    createMutation.mutate(purchaseOrderData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="vendor" className="text-right">
          Vendor
        </Label>
        <Select
          value={vendorId.toString()}
          onValueChange={(value) => setVendorId(Number(value))}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor) => (
              <SelectItem key={vendor.vendor_id} value={vendor.vendor_id!.toString()}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="expected_delivery_date" className="text-right">
          Expected Delivery
        </Label>
        <Input
          id="expected_delivery_date"
          type="date"
          value={expectedDeliveryDate}
          onChange={(e) => setExpectedDeliveryDate(e.target.value)}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="notes" className="text-right pt-2">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="col-span-3"
          rows={3}
        />
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            Add Item
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </TableCell>
                <TableCell>
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </TableCell>
                <TableCell>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex justify-end mt-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-xl font-bold">${calculateTotal().toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create Purchase Order'}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
