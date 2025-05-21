import React from "react";
import { useQuery } from "@tanstack/react-query";
import { PaymentItemData } from "@/types/paymentItem";
import {
  getPaymentItemById,
  getLocationById,
} from "@/services/paymentItemsApi";
import { getWorkOrderById } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  MapPin,
  Clipboard,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { format } from "date-fns";

interface PaymentItemDetailsProps {
  itemId: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: PaymentItemData) => void;
}

const PaymentItemDetails: React.FC<PaymentItemDetailsProps> = ({
  itemId,
  isOpen,
  onClose,
  onEdit,
}) => {
  // Fetch payment item details
  const {
    data: item,
    isLoading: isLoadingItem,
    error: itemError,
  } = useQuery({
    queryKey: ["paymentItem", itemId],
    queryFn: () => getPaymentItemById(itemId),
    enabled: isOpen && !!itemId,
  });

  // Fetch location details if available
  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location", item?.location_id],
    queryFn: () => getLocationById(item!.location_id!),
    enabled: isOpen && !!item?.location_id,
  });

  // Fetch work order details if available
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", item?.work_order_id],
    queryFn: () => getWorkOrderById(item!.work_order_id!),
    enabled: isOpen && !!item?.work_order_id,
  });

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "-";
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Clock className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
          >
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  // Get approval status icon
  const getApprovalIcon = (status?: string) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />;

    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Item Details</DialogTitle>
          <DialogDescription>
            Detailed information about the payment item
          </DialogDescription>
        </DialogHeader>

        {isLoadingItem ? (
          <div className="py-8 text-center">
            Loading payment item details...
          </div>
        ) : itemError ? (
          <div className="py-8 text-center text-red-500">
            Error loading payment item details
          </div>
        ) : item ? (
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" /> Details
              </TabsTrigger>
              <TabsTrigger value="approvals">
                <CheckCircle className="h-4 w-4 mr-2" /> Approvals
              </TabsTrigger>
              <TabsTrigger value="related">
                <Clipboard className="h-4 w-4 mr-2" /> Related Items
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-lg">{item.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Item Code</p>
                  <p>{item.item_code || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Unit of Measure</p>
                  <p>{item.unit_of_measure}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Unit Price</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Quantity</p>
                  <p>
                    {item.original_quantity} {item.unit_of_measure}
                    {item.actual_quantity !== undefined &&
                      item.actual_quantity !== item.original_quantity && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Actual: {item.actual_quantity} {item.unit_of_measure}
                          )
                        </span>
                      )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Price</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.total_price)}
                    {item.actual_total_price !== undefined &&
                      item.actual_total_price !== item.total_price && (
                        <span className="text-sm text-gray-500 block">
                          (Actual: {formatCurrency(item.actual_total_price)})
                        </span>
                      )}
                  </p>
                </div>
              </div>

              {item.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">
                    {item.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Created</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    {formatDate(item.updated_at)}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Approvals Tab */}
            <TabsContent value="approvals" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Approval Status</CardTitle>
                  <CardDescription>
                    Current approval status for this payment item
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      {getApprovalIcon(item.qc_approval_status)}
                      <div>
                        <p className="text-sm font-medium">QC Approval</p>
                        <p className="text-sm text-gray-500">
                          {item.qc_approval_status || "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getApprovalIcon(item.supervisor_approval_status)}
                      <div>
                        <p className="text-sm font-medium">
                          Supervisor Approval
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.supervisor_approval_status || "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getApprovalIcon(item.accountant_approval_status)}
                      <div>
                        <p className="text-sm font-medium">
                          Accountant Approval
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.accountant_approval_status || "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Related Items Tab */}
            <TabsContent value="related" className="space-y-4 py-4">
              {/* Location Information */}
              {item.location_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" /> Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLocation ? (
                      <p>Loading location details...</p>
                    ) : location ? (
                      <div className="space-y-2">
                        <p className="font-medium">{location.name}</p>
                        {location.description && (
                          <p className="text-sm text-gray-500">
                            {location.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>No location details available</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Work Order Information */}
              {item.work_order_id && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clipboard className="h-4 w-4 mr-2" /> Work Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingWorkOrder ? (
                      <p>Loading work order details...</p>
                    ) : workOrder ? (
                      <div className="space-y-2">
                        <p className="font-medium">
                          {workOrder.work_order_number || workOrder.description}
                        </p>
                        {workOrder.description && (
                          <p className="text-sm text-gray-500">
                            {workOrder.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p>No work order details available</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center">No payment item found</div>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {item && onEdit && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Edit button clicked in details dialog");
                onClose(); // Close the details dialog first
                setTimeout(() => {
                  console.log("Calling onEdit with item:", item);
                  onEdit(item); // Then call onEdit
                }, 100);
              }}
            >
              Edit Payment Item
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentItemDetails;
