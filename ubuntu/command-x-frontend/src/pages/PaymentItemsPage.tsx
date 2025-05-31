import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, FileText, Plus } from "lucide-react";
import { getProjectById, getUserRole } from "@/services/api";
import { PaymentItemData } from "@/types/paymentItem";
import PaymentItemsTable from "@/components/payment-items/PaymentItemsTable";
import PaymentItemDialog from "@/components/payment-items/PaymentItemDialog";
import DeletePaymentItemDialog from "@/components/payment-items/DeletePaymentItemDialog";
import PaymentItemDetails from "@/components/payment-items/PaymentItemDetails";
import PaymentItemApproval from "@/components/payment-items/PaymentItemApproval";
import BasicAddPaymentItemButton from "@/components/payment-items/BasicAddPaymentItemButton";
import InlineEditPaymentItem from "@/components/payment-items/InlineEditPaymentItem";

const PaymentItemsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Debug logging
  console.log("🔍 PaymentItemsPage - projectId from URL:", projectId);
  console.log("🔍 PaymentItemsPage - projectId type:", typeof projectId);
  console.log("🔍 PaymentItemsPage - current URL:", window.location.pathname);
  const [selectedPaymentItem, setSelectedPaymentItem] =
    useState<PaymentItemData | null>(null);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  // Fetch user role to determine if user can approve items
  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: getUserRole,
  });

  // Check if user can approve items
  const canApproveItems =
    userRole === "qc_manager" ||
    userRole === "supervisor" ||
    userRole === "project_manager" ||
    userRole === "accountant" ||
    userRole === "finance_manager" ||
    userRole === "admin";

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => {
      console.log(
        "🔍 PaymentItemsPage - React Query calling getProjectById with:",
        projectId
      );
      return getProjectById(projectId!);
    },
    enabled: !!projectId,
    onSuccess: (data) => {
      console.log("🔍 PaymentItemsPage - React Query success:", data);
    },
    onError: (error) => {
      console.error("🔍 PaymentItemsPage - React Query error:", error);
    },
  });

  // Debug the query state
  console.log("🔍 PaymentItemsPage - Query state:", {
    projectId,
    isLoadingProject,
    hasProject: !!project,
    projectError,
    enabled: !!projectId,
  });

  // Handle payment item view
  const handleViewPaymentItem = (item: PaymentItemData) => {
    setSelectedPaymentItem(item);
    setIsDetailsDialogOpen(true);
  };

  // Handle payment item edit
  const handleEditPaymentItem = (item: PaymentItemData) => {
    console.log("Starting inline edit for item:", item.item_id);
    setEditingItemId(item.item_id);
    setSelectedPaymentItem(item);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    console.log("Canceling inline edit");
    setEditingItemId(null);
  };

  // Handle payment item delete
  const handleDeletePaymentItem = (item: PaymentItemData) => {
    setSelectedPaymentItem(item);
    setIsDeleteDialogOpen(true);
  };

  // Handle payment item approval
  const handleApprovePaymentItem = (item: PaymentItemData) => {
    setSelectedPaymentItem(item);
    setIsApprovalDialogOpen(true);
  };

  // Handle edit from details view
  const handleEditFromDetails = (item: PaymentItemData) => {
    setIsDetailsDialogOpen(false);
    setTimeout(() => {
      setSelectedPaymentItem(item);
      setIsEditDialogOpen(true);
    }, 100);
  };

  // Handle add payment item
  const handleAddPaymentItem = () => {
    console.log("handleAddPaymentItem called, projectId:", projectId);
    setSelectedPaymentItem(null);
    setIsAddDialogOpen(true);
    console.log("isAddDialogOpen set to true");
  };

  if (isLoadingProject) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-red-800">
            Error Loading Project
          </h2>
          <p className="text-red-600 mt-2">
            Failed to load project details. Please try again.
          </p>
          <div className="mt-4 text-sm text-red-500">
            <p>
              <strong>Project ID:</strong> {projectId}
            </p>
            <p>
              <strong>Error:</strong> {projectError?.message || "Unknown error"}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-semibold text-yellow-800">
            Project Not Found
          </h2>
          <p className="text-yellow-600 mt-2">
            The requested project could not be found.
          </p>
          <div className="mt-4 text-sm text-yellow-600">
            <p>
              <strong>Project ID:</strong> {projectId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <h3 className="text-sm font-semibold text-blue-800">
          Debug Information
        </h3>
        <div className="mt-2 text-xs text-blue-600 space-y-1">
          <p>
            <strong>Project ID:</strong> {projectId}
          </p>
          <p>
            <strong>Project Name:</strong> {project.project_name}
          </p>
          <p>
            <strong>Project Status:</strong> {project.status}
          </p>
          <p>
            <strong>Current URL:</strong> {window.location.pathname}
          </p>
          <p>
            <strong>User Role:</strong> {userRole}
          </p>
          <p>
            <strong>Can Approve Items:</strong> {canApproveItems ? "Yes" : "No"}
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Items</h1>
          <p className="text-muted-foreground">
            Manage and track payment items for {project.project_name}
          </p>
        </div>
        <div className="flex gap-2">
          {canApproveItems && (
            <Button
              variant="outline"
              onClick={() => {
                if (selectedPaymentItem) {
                  handleApprovePaymentItem(selectedPaymentItem);
                }
              }}
              disabled={!selectedPaymentItem}
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Approve Items
            </Button>
          )}
          <BasicAddPaymentItemButton projectId={projectId!} />
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Items</CardTitle>
          <CardDescription>
            View and manage payment items for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editingItemId !== null && selectedPaymentItem ? (
            <div className="mb-6">
              <InlineEditPaymentItem
                projectId={projectId!}
                paymentItem={selectedPaymentItem}
                onCancel={handleCancelEdit}
              />
            </div>
          ) : null}

          <PaymentItemsTable
            projectId={projectId!}
            onViewItem={handleViewPaymentItem}
            onEditItem={handleEditPaymentItem}
            onDeleteItem={handleDeletePaymentItem}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {projectId && (
        <>
          {/* Add Payment Item Dialog */}
          <PaymentItemDialog
            projectId={projectId}
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
          />

          {/* Edit Payment Item Dialog */}
          {selectedPaymentItem && (
            <PaymentItemDialog
              projectId={projectId}
              paymentItem={selectedPaymentItem}
              isOpen={isEditDialogOpen}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}

          {/* Delete Payment Item Dialog */}
          {selectedPaymentItem && (
            <DeletePaymentItemDialog
              projectId={projectId}
              itemId={selectedPaymentItem.item_id}
              itemDescription={selectedPaymentItem.description}
              isOpen={isDeleteDialogOpen}
              onClose={() => setIsDeleteDialogOpen(false)}
            />
          )}

          {/* Payment Item Details Dialog */}
          {selectedPaymentItem && (
            <PaymentItemDetails
              itemId={selectedPaymentItem.item_id}
              isOpen={isDetailsDialogOpen}
              onClose={() => setIsDetailsDialogOpen(false)}
              onEdit={handleEditFromDetails}
            />
          )}

          {/* Payment Item Approval Dialog */}
          {selectedPaymentItem && (
            <PaymentItemApproval
              itemId={selectedPaymentItem.item_id}
              projectId={projectId}
              isOpen={isApprovalDialogOpen}
              onClose={() => setIsApprovalDialogOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PaymentItemsPage;
