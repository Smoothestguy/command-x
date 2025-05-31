import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentItemData } from "@/types/paymentItem";
import {
  getPaymentItemById,
  updatePaymentItem,
} from "@/services/paymentItemsApi";
import { getUserRole } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PaymentItemApprovalProps {
  itemId: number;
  projectId: string | number; // Support both UUID strings and legacy numbers
  isOpen: boolean;
  onClose: () => void;
}

type ApprovalType = "qc" | "supervisor" | "accountant";
type ApprovalStatus = "approved" | "rejected" | "pending";

const PaymentItemApproval: React.FC<PaymentItemApprovalProps> = ({
  itemId,
  projectId,
  isOpen,
  onClose,
}) => {
  const [approvalStatus, setApprovalStatus] =
    useState<ApprovalStatus>("pending");
  const [comments, setComments] = useState("");
  const queryClient = useQueryClient();

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

  // Fetch current user role
  const { data: userRole, isLoading: isLoadingUserRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: getUserRole,
    enabled: isOpen,
  });

  // Determine approval type based on user role
  const getApprovalType = (): ApprovalType | null => {
    if (!userRole) return null;

    switch (userRole) {
      case "qc_manager":
        return "qc";
      case "supervisor":
      case "project_manager":
        return "supervisor";
      case "accountant":
      case "finance_manager":
        return "accountant";
      default:
        return null;
    }
  };

  const approvalType = getApprovalType();

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
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      queryClient.invalidateQueries({ queryKey: ["paymentItem", itemId] });
      toast({
        title: "Success",
        description: "Payment item approval status updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update approval status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  // Handle approval submission
  const handleSubmit = () => {
    if (!item || !approvalType) return;

    const updateData: Partial<PaymentItemData> = {
      [`${approvalType}_approval_status`]: approvalStatus,
      [`${approvalType}_approval_comments`]: comments,
      [`${approvalType}_approval_date`]: new Date().toISOString(),
    };

    // Update overall status if all approvals are complete
    if (approvalStatus === "approved") {
      // Check if this is the final approval needed
      const otherApprovals = [
        approvalType !== "qc" ? item.qc_approval_status : approvalStatus,
        approvalType !== "supervisor"
          ? item.supervisor_approval_status
          : approvalStatus,
        approvalType !== "accountant"
          ? item.accountant_approval_status
          : approvalStatus,
      ];

      // If all approvals are now "approved", update the overall status
      if (otherApprovals.every((status) => status === "approved")) {
        updateData.status = "approved";
      }
    } else if (approvalStatus === "rejected") {
      // If any approval is rejected, update the overall status
      updateData.status = "rejected";
    }

    updateMutation.mutate({ itemId: item.item_id, data: updateData });
  };

  // Check if user has permission to approve
  const canApprove = !!approvalType;

  // Get current approval status for this user's role
  const getCurrentApprovalStatus = (): ApprovalStatus | undefined => {
    if (!item || !approvalType) return undefined;
    return item[`${approvalType}_approval_status` as keyof PaymentItemData] as
      | ApprovalStatus
      | undefined;
  };

  const currentApprovalStatus = getCurrentApprovalStatus();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment Item Approval</DialogTitle>
          <DialogDescription>
            Review and update the approval status for this payment item
          </DialogDescription>
        </DialogHeader>

        {isLoadingItem || isLoadingUserRole ? (
          <div className="py-4 text-center">Loading...</div>
        ) : itemError ? (
          <div className="py-4 text-center text-red-500">
            Error loading payment item details
          </div>
        ) : !canApprove ? (
          <div className="py-4 flex items-center justify-center text-amber-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            You don't have permission to approve this item
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{item?.description}</h3>
              <p className="text-sm text-gray-500">
                Item Code: {item?.item_code || "N/A"} | Amount: $
                {item?.total_price?.toFixed(2)}
              </p>
            </div>

            {currentApprovalStatus && currentApprovalStatus !== "pending" ? (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">
                  You have already {currentApprovalStatus} this item
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  To change your decision, please submit a new approval
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <Label>Approval Decision</Label>
              <RadioGroup
                value={approvalStatus}
                onValueChange={(value) =>
                  setApprovalStatus(value as ApprovalStatus)
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved" id="approved" />
                  <Label htmlFor="approved" className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
                    Approve
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected" id="rejected" />
                  <Label htmlFor="rejected" className="flex items-center">
                    <XCircle className="h-4 w-4 mr-1 text-red-500" /> Reject
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments about your decision..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canApprove || isLoadingItem || isLoadingUserRole}
            variant={approvalStatus === "approved" ? "default" : "destructive"}
          >
            {approvalStatus === "approved" ? "Approve" : "Reject"} Payment Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentItemApproval;
