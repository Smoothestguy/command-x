import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { getProjectById, ProjectData } from "@/services/api";
import { PaymentItemData } from "@/types/paymentItem";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { toast } from "@/components/ui/use-toast";
import PaymentItemForm from "@/components/payment-items/PaymentItemForm";
import Layout from "@/components/layout/Layout";

const AddPaymentItemPage: React.FC = () => {
  console.log("AddPaymentItemPage component rendering");
  const { projectId } = useParams<{ projectId: string }>();
  console.log("Project ID from params:", projectId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("AddPaymentItemPage mounted with projectId:", projectId);
  }, [projectId]);

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery<ProjectData>({
    queryKey: ["project", projectId],
    queryFn: () => {
      console.log("Fetching project with ID:", projectId);
      try {
        return getProjectById(projectId!);
      } catch (error) {
        console.error("Error in getProjectById:", error);
        throw error;
      }
    },
    enabled: !!projectId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createPaymentItem,
    onSuccess: () => {
      console.log("Payment item created successfully");
      queryClient.invalidateQueries({ queryKey: ["paymentItems", projectId] });
      toast({
        title: "Success",
        description: "Payment item created successfully",
      });
      // Navigate back to payment items page
      navigate(`/projects/${projectId}/payment-items`);
    },
    onError: (error) => {
      console.error("Failed to create payment item:", error);
      toast({
        title: "Error",
        description: `Failed to create payment item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (data: Partial<PaymentItemData>) => {
    console.log("Form submitted with data:", data);
    createMutation.mutate({
      ...data,
      project_id: Number(projectId),
    } as PaymentItemData);
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/projects/${projectId}/payment-items`);
  };

  if (isLoadingProject) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading project details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (projectError || !project) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg text-red-500">
              Error loading project details. Please check console for errors.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add Payment Item
            </h1>
            <p className="text-muted-foreground">
              Create a new payment item for {project.project_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Payment Items
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Item Details</CardTitle>
            <CardDescription>
              Fill in the details to create a new payment item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentItemForm
              projectId={Number(projectId)}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPaymentItemPage;
