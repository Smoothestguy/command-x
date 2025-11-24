import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getWorkOrders,
  assignPaymentItemToWorkOrder,
  WorkOrderData,
} from "@/services/api";
import { updatePaymentItem } from "@/services/paymentItemsApi";
import { PaymentItemData } from "@/types/paymentItem";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WorkOrderSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  selectedItems: PaymentItemData[];
  onSuccess?: () => void;
}

const WorkOrderSelectionDialog: React.FC<WorkOrderSelectionDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  selectedItems,
  onSuccess,
}) => {
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch work orders for the project
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery({
    queryKey: ["workOrders", projectId],
    queryFn: () => getWorkOrders(projectId),
    enabled: isOpen && !!projectId,
  });

  // Mutation to assign payment items to work order
  const assignMutation = useMutation({
    mutationFn: async (workOrderId: number) => {
      // Update each selected payment item to assign it to the work order
      const promises = selectedItems.map((item) =>
        updatePaymentItem(item.item_id, {
          work_order_id: workOrderId,
          status: "in_progress",
        })
      );

      await Promise.all(promises);
      return workOrderId;
    },
    onSuccess: (workOrderId) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["paymentItems"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });

      const selectedWorkOrder = workOrders?.find(
        (wo: WorkOrderData) => wo.work_order_id === workOrderId
      );

      toast.success("Payment items assigned successfully!", {
        description: `${selectedItems.length} items assigned to "${selectedWorkOrder?.description}"`,
      });

      onSuccess?.();
      onClose();
      setSelectedWorkOrderId("");
    },
    onError: (error) => {
      toast.error("Failed to assign payment items", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const handleAssign = () => {
    if (!selectedWorkOrderId) {
      toast.error("Please select a work order");
      return;
    }

    assignMutation.mutate(Number(selectedWorkOrderId));
  };

  const handleClose = () => {
    if (!assignMutation.isPending) {
      setSelectedWorkOrderId("");
      onClose();
    }
  };

  const totalValue = selectedItems.reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Items to Work Order</DialogTitle>
          <DialogDescription>
            Select a work order to assign the selected payment items to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Items Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Selected Items:</span>
                  <Badge variant="secondary">{selectedItems.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Value:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Order Selection */}
          <div className="space-y-2">
            <Label htmlFor="workOrder">Select Work Order</Label>
            {isLoadingWorkOrders ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading work orders...
              </div>
            ) : (
              <Select
                value={selectedWorkOrderId}
                onValueChange={setSelectedWorkOrderId}
                disabled={assignMutation.isPending}
              >
                <SelectTrigger id="workOrder">
                  <SelectValue placeholder="Choose a work order" />
                </SelectTrigger>
                <SelectContent>
                  {workOrders?.map((workOrder: WorkOrderData) => {
                    const idValue = workOrder.work_order_id ?? "";
                    return (
                      <SelectItem
                        key={idValue?.toString()}
                        value={idValue?.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {workOrder.description}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Status: {workOrder.status} • Assigned to:{" "}
                            {workOrder.assigned_subcontractor_name ||
                              "Unassigned"}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {workOrders?.length === 0 && !isLoadingWorkOrders && (
            <div className="text-center py-4 text-muted-foreground">
              <p>
                No work orders found for this project. Create a work order
                first.
              </p>
              <p className="text-xs mt-2">Project ID: {projectId}</p>
              <p className="text-xs">
                Work Orders Found: {workOrders?.length || 0}
              </p>
              <p className="text-xs">
                Query Enabled: {isOpen && !!projectId ? "Yes" : "No"}
              </p>
              <p className="text-xs">
                Loading: {isLoadingWorkOrders ? "Yes" : "No"}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={
              !selectedWorkOrderId ||
              assignMutation.isPending ||
              workOrders?.length === 0
            }
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              "Add to Work Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderSelectionDialog;
