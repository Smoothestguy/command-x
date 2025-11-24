import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "sonner";
import { PurchaseOrderData } from "../types/purchaseOrder";
import {
  getVendors,
  getPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrders,
} from "../services/purchaseOrderApi";
import PurchaseOrderForm from "../components/purchase-orders/PurchaseOrderForm";
import PurchaseOrderDetail from "../components/purchase-orders/PurchaseOrderDetail";

// Function to get all purchase orders (not just for a specific work order)
const getAllPurchaseOrders = async (): Promise<PurchaseOrderData[]> => {
  // In a real implementation, this would be an API call to get all purchase orders
  // For now, we'll use our existing mock data

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Get all purchase orders by using a special value (-1) to indicate we want all orders
  // Our API will handle this special case
  const allPurchaseOrders = await getPurchaseOrders(-1);
  return allPurchaseOrders;
};

const PurchaseOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");

  // Fetch all purchase orders
  const {
    data: purchaseOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrderData[], Error>({
    queryKey: ["allPurchaseOrders"],
    queryFn: getAllPurchaseOrders,
  });

  // Fetch vendors for filter dropdown
  const { data: vendors } = useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });

  // Delete purchase order mutation
  const deleteMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPurchaseOrders"] });
      toast.success("Purchase order deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete purchase order");
      console.error("Error deleting purchase order:", error);
    },
  });

  // Filter purchase orders based on search term, status, and vendor
  const filteredPurchaseOrders = purchaseOrders?.filter((po) => {
    const matchesSearch =
      po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.items.some((item) =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    const matchesVendor =
      vendorFilter === "all" || po.vendor_id.toString() === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

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

  // Handle create purchase order
  const handleCreatePurchaseOrder = () => {
    setIsCreateDialogOpen(true);
  };

  // Handle view purchase order
  const handleViewPurchaseOrder = (purchaseOrderId: number) => {
    setSelectedPurchaseOrderId(purchaseOrderId);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage and track purchase orders across all work orders
          </p>
        </div>
        <Button onClick={handleCreatePurchaseOrder} className="w-full sm:w-auto">
          Create Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter purchase orders by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by PO number, vendor, or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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
            <div>
              <label className="text-sm font-medium mb-1 block">Vendor</label>
              <Select value={vendorFilter} onValueChange={setVendorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading purchase orders...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading purchase orders</p>
        </div>
      ) : filteredPurchaseOrders && filteredPurchaseOrders.length > 0 ? (
        <>
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">PO Number</TableHead>
                  <TableHead className="font-semibold">Work Order</TableHead>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Issue Date</TableHead>
                  <TableHead className="font-semibold">
                    Expected Delivery
                  </TableHead>
                  <TableHead className="font-semibold">Total</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchaseOrders.map((po) => {
                  const totalItems = po.items.length;
                  const fulfilledItems = po.items.filter(
                    (item) => (item.received_quantity || 0) >= item.quantity
                  ).length;
                  const partiallyFulfilledItems = po.items.filter(
                    (item) =>
                      (item.received_quantity || 0) > 0 &&
                      (item.received_quantity || 0) < item.quantity
                  ).length;
                  const totalAmount =
                    po.total_amount ||
                    po.items.reduce(
                      (sum, item) => sum + item.quantity * item.unit_price,
                      0
                    );

                  return (
                    <TableRow
                      key={po.purchase_order_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        handleViewPurchaseOrder(po.purchase_order_id!)
                      }
                    >
                      <TableCell className="font-medium">
                        {po.po_number}
                      </TableCell>
                      <TableCell>WO-{po.work_order_id}</TableCell>
                      <TableCell>{po.vendor?.name}</TableCell>
                      <TableCell>{renderStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        {po.issue_date
                          ? new Date(po.issue_date).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {po.expected_delivery_date
                          ? new Date(
                              po.expected_delivery_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${totalAmount.toLocaleString()}
                        {po.status === "Partially Fulfilled" && (
                          <div className="flex items-center mt-1">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.round(
                                    ((fulfilledItems +
                                      partiallyFulfilledItems * 0.5) /
                                      totalItems) *
                                      100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(
                                ((fulfilledItems +
                                  partiallyFulfilledItems * 0.5) /
                                  totalItems) *
                                  100
                              )}
                              % fulfilled
                            </span>
                          </div>
                        )}
                        {po.status === "Fulfilled" && (
                          <div className="flex items-center mt-1">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-green-500 h-2 rounded-full w-full"></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              100% fulfilled
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPurchaseOrder(po.purchase_order_id!);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {filteredPurchaseOrders.map((po) => {
              const totalAmount =
                po.total_amount ||
                po.items.reduce(
                  (sum, item) => sum + item.quantity * item.unit_price,
                  0
                );
              return (
                <div
                  key={po.purchase_order_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-slate-500">
                        PO #{po.po_number}
                      </div>
                      <div className="text-base font-semibold">
                        {po.vendor?.name || "N/A"}
                      </div>
                      <div className="text-xs text-slate-500">
                        WO-{po.work_order_id}
                      </div>
                    </div>
                    {renderStatusBadge(po.status || "Draft")}
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Total</span>
                    <span className="font-semibold text-slate-800">
                      ${totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Issue</span>
                    <span>
                      {po.issue_date
                        ? new Date(po.issue_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Delivery</span>
                    <span>
                      {po.expected_delivery_date
                        ? new Date(
                            po.expected_delivery_date
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        handleViewPurchaseOrder(po.purchase_order_id!)
                      }
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => deleteMutation.mutate(po.purchase_order_id!)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-12 rounded flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-600 mb-2">
            No purchase orders found
          </p>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
            {searchTerm || statusFilter !== "all" || vendorFilter !== "all"
              ? "Try adjusting your filters to see more results."
              : "Get started by creating your first purchase order."}
          </p>
          <Button onClick={handleCreatePurchaseOrder}>
            Create Purchase Order
          </Button>
        </div>
      )}

      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>Create a new purchase order</DialogDescription>
          </DialogHeader>

          {/* We need to modify the PurchaseOrderForm to work without a specific work order */}
          {/* For now, we'll use a placeholder work order ID */}
          <PurchaseOrderForm
            workOrderId={101} // This would normally be selected by the user
            onSuccess={(newPurchaseOrder) => {
              setIsCreateDialogOpen(false);
              refetch();
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View/Edit Purchase Order Dialog */}
      {selectedPurchaseOrderId && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Order Details</DialogTitle>
              <DialogDescription>
                View or edit purchase order details
              </DialogDescription>
            </DialogHeader>

            <PurchaseOrderDetail
              purchaseOrderId={selectedPurchaseOrderId}
              onClose={() => setIsViewDialogOpen(false)}
              onUpdate={() => {
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PurchaseOrders;
