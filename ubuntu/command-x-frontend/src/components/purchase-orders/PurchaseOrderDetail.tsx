import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PurchaseOrderData,
  PurchaseOrderItemData,
} from "../../types/purchaseOrder";
import {
  getPurchaseOrder,
  updatePurchaseOrder,
  getVendors,
} from "../../services/purchaseOrderApi";
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
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import FulfillmentTracker from "./FulfillmentTracker";
import SplitOrderForm from "./SplitOrderForm";

interface PurchaseOrderDetailProps {
  purchaseOrderId: number;
  onClose: () => void;
  onUpdate: () => void;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({
  purchaseOrderId,
  onClose,
  onUpdate,
}) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRecordingFulfillment, setIsRecordingFulfillment] = useState(false);
  const [isSplittingOrder, setIsSplittingOrder] = useState(false);

  // State for form fields
  const [vendorId, setVendorId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [items, setItems] = useState<PurchaseOrderItemData[]>([]);

  // Fetch purchase order
  const {
    data: purchaseOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["purchaseOrder", purchaseOrderId],
    queryFn: () => getPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
  });

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  // Update purchase order mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<PurchaseOrderData>) =>
      updatePurchaseOrder(purchaseOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrder", purchaseOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      toast.success("Purchase order updated successfully");
      setIsEditing(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error("Failed to update purchase order");
      console.error("Error updating purchase order:", error);
    },
  });

  // Initialize form with purchase order data
  useEffect(() => {
    if (purchaseOrder) {
      setVendorId(purchaseOrder.vendor_id || "");
      setNotes(purchaseOrder.notes || "");
      setStatus(purchaseOrder.status || "");
      setExpectedDeliveryDate(
        purchaseOrder.expected_delivery_date
          ? new Date(purchaseOrder.expected_delivery_date)
              .toISOString()
              .split("T")[0]
          : ""
      );
      setItems(purchaseOrder.items || []);
    }
  }, [purchaseOrder]);

  // Handle item changes
  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItemData,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Add a new item
  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0 }]);
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
    return items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }

    if (items.some((item) => !item.description || item.quantity <= 0)) {
      toast.error("Please fill in all item details");
      return;
    }

    const updatedPurchaseOrder: Partial<PurchaseOrderData> = {
      vendor_id: Number(vendorId),
      status,
      expected_delivery_date: expectedDeliveryDate || undefined,
      notes: notes || undefined,
      items: items.map((item) => ({
        item_id: item.item_id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        received_quantity: item.received_quantity,
      })),
    };

    updateMutation.mutate(updatedPurchaseOrder);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    let variant = "default";

    switch (status) {
      case "Draft":
        variant = "outline";
        break;
      case "Sent":
        variant = "secondary";
        break;
      case "Partially Fulfilled":
        variant = "warning";
        break;
      case "Fulfilled":
        variant = "success";
        break;
      case "Cancelled":
        variant = "destructive";
        break;
    }

    return <Badge variant={variant as any}>{status}</Badge>;
  };

  if (isLoading) {
    return <div>Loading purchase order details...</div>;
  }

  if (error || !purchaseOrder) {
    return <div>Error loading purchase order details</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{purchaseOrder.po_number}</h2>
          <p className="text-muted-foreground">
            Vendor: {purchaseOrder.vendor?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {renderStatusBadge(purchaseOrder.status)}
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        // Edit Form
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
                  <SelectItem
                    key={vendor.vendor_id}
                    value={vendor.vendor_id!.toString()}
                  >
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Partially Fulfilled">
                  Partially Fulfilled
                </SelectItem>
                <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
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
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
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
                <div className="text-xl font-bold">
                  ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? "Updating..."
                : "Update Purchase Order"}
            </Button>
          </div>
        </form>
      ) : isRecordingFulfillment ? (
        // Fulfillment Tracking Mode
        <FulfillmentTracker
          purchaseOrder={purchaseOrder}
          onSuccess={() => {
            setIsRecordingFulfillment(false);
            onUpdate();
          }}
          onCancel={() => setIsRecordingFulfillment(false)}
        />
      ) : isSplittingOrder ? (
        // Split Order Mode
        <SplitOrderForm
          purchaseOrder={purchaseOrder}
          onSuccess={() => {
            setIsSplittingOrder(false);
            onUpdate();
          }}
          onCancel={() => setIsSplittingOrder(false)}
        />
      ) : (
        // View Mode
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Work Order ID
              </h3>
              <p>{purchaseOrder.work_order_id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Issue Date
              </h3>
              <p>
                {purchaseOrder.issue_date
                  ? new Date(purchaseOrder.issue_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Expected Delivery
              </h3>
              <p>
                {purchaseOrder.expected_delivery_date
                  ? new Date(
                      purchaseOrder.expected_delivery_date
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Created
              </h3>
              <p>
                {purchaseOrder.created_at
                  ? new Date(purchaseOrder.created_at).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {purchaseOrder.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Notes
              </h3>
              <p className="mt-1">{purchaseOrder.notes}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Items</h3>
              <div className="text-sm text-muted-foreground">
                Fulfillment Status:{" "}
                {purchaseOrder.status === "Fulfilled" ? (
                  <span className="text-green-600 font-medium">Complete</span>
                ) : purchaseOrder.status === "Partially Fulfilled" ? (
                  <span className="text-amber-600 font-medium">Partial</span>
                ) : (
                  <span className="text-gray-600 font-medium">Not Started</span>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items.map((item) => {
                  const received = item.received_quantity || 0;
                  const remaining = item.quantity - received;
                  const progress =
                    item.quantity > 0
                      ? Math.round((received / item.quantity) * 100)
                      : 0;

                  return (
                    <TableRow key={item.item_id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell>{received}</TableCell>
                      <TableCell>{remaining}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-24" />
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-xl font-bold">
                  $
                  {purchaseOrder.items
                    .reduce(
                      (sum, item) => sum + item.quantity * item.unit_price,
                      0
                    )
                    .toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            {purchaseOrder.status !== "Fulfilled" &&
              purchaseOrder.status !== "Cancelled" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsSplittingOrder(true)}
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    Split Order
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setIsRecordingFulfillment(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Record Fulfillment
                  </Button>
                </>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default PurchaseOrderDetail;
