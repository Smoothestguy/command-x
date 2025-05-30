import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import {
  getPurchaseOrders,
  createPurchaseOrder,
} from "../../services/purchaseOrderApi";
import { PurchaseOrderData } from "../../types/purchaseOrder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import PurchaseOrderForm from "./PurchaseOrderForm";
import PurchaseOrderDetail from "./PurchaseOrderDetail";

interface PurchaseOrderSectionProps {
  workOrderId: number;
}

const PurchaseOrderSection: React.FC<PurchaseOrderSectionProps> = ({
  workOrderId,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState<
    number | null
  >(null);

  // Fetch purchase orders for this work order
  const {
    data: purchaseOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrderData[]>({
    queryKey: ["purchaseOrders", workOrderId],
    queryFn: () => getPurchaseOrders(workOrderId),
  });

  // Helper function to render status badge
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

  // Handle create purchase order button click
  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-4 border border-gray-200 p-6 rounded-lg shadow-sm bg-white">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Purchase Orders</h2>
          <p className="text-sm text-gray-500">
            Manage purchase orders for this work order
          </p>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={handleCreateClick}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Purchase Order
        </Button>
      </div>

      <div className="py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">
              Loading purchase orders...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="text-sm">Error loading purchase orders</p>
          </div>
        ) : purchaseOrders && purchaseOrders.length > 0 ? (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded mb-4">
            <p className="text-sm font-medium">
              {purchaseOrders.length} purchase order(s) found
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 px-4 py-6 rounded flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400 mb-2"
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
            <p className="text-sm text-gray-500 mb-2">
              No purchase orders found for this work order.
            </p>
            <p className="text-xs text-gray-400">
              Click the "Create Purchase Order" button to get started.
            </p>
          </div>
        )}
      </div>

      {/* Purchase Orders Table */}
      {purchaseOrders && purchaseOrders.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold">PO Number</TableHead>
                <TableHead className="font-semibold">Vendor</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Issue Date</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => {
                // Calculate fulfillment percentage
                const totalItems = po.items.length;
                const fulfilledItems = po.items.filter(
                  (item) => (item.received_quantity || 0) >= item.quantity
                ).length;
                const partiallyFulfilledItems = po.items.filter(
                  (item) =>
                    (item.received_quantity || 0) > 0 &&
                    (item.received_quantity || 0) < item.quantity
                ).length;

                // Calculate total amount
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
                    onClick={() => {
                      setSelectedPurchaseOrderId(po.purchase_order_id!);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">
                      {po.po_number}
                    </TableCell>
                    <TableCell>{po.vendor?.name}</TableCell>
                    <TableCell>{renderStatusBadge(po.status)}</TableCell>
                    <TableCell>
                      {po.issue_date
                        ? new Date(po.issue_date).toLocaleDateString()
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
                          setSelectedPurchaseOrderId(po.purchase_order_id!);
                          setIsViewDialogOpen(true);
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
      )}

      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for this work order.
            </DialogDescription>
          </DialogHeader>

          <PurchaseOrderForm
            workOrderId={workOrderId}
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
                View or edit purchase order details.
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

export default PurchaseOrderSection;
