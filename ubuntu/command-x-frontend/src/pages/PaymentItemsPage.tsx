import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Package, Plus, ArrowLeft } from "lucide-react";
import { getProjectById, getUserRole } from "@/services/api";
import { getPaymentItems } from "@/services/paymentItemsApi";
import { PaymentItemData } from "@/types/paymentItem";
import EditablePaymentItemRow from "@/components/work-orders/EditablePaymentItemRow";
import PaymentItemDialog from "@/components/payment-items/PaymentItemDialog";

const PaymentItemsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // State for payment item selection interface
  const [selectedPaymentItems, setSelectedPaymentItems] = useState<number[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock locations data (same as Enhanced Work Order)
  const locations = [
    { location_id: 1, name: "Bedroom 1" },
    { location_id: 2, name: "Bedroom 2" },
    { location_id: 3, name: "Kitchen" },
    { location_id: 4, name: "Living Room" },
    { location_id: 5, name: "Bathroom" },
  ];

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });

  // Fetch payment items for the project
  const { data: availablePaymentItems, isLoading: isLoadingPaymentItems } =
    useQuery({
      queryKey: ["paymentItems", projectId],
      queryFn: () =>
        getPaymentItems({
          projectId: projectId!,
          status: "pending", // Show all items for management
        }),
      enabled: !!projectId,
    });

  // Filter payment items (same logic as Enhanced Work Order)
  const filteredPaymentItems = (availablePaymentItems || []).filter((item) => {
    const matchesSearch =
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" ||
      item.location_id?.toString() === locationFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Handle payment item selection toggle
  const togglePaymentItem = (itemId: number) => {
    setSelectedPaymentItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Calculate totals
  const selectedItemsTotal = filteredPaymentItems
    .filter((item) => selectedPaymentItems.includes(item.item_id))
    .reduce((sum, item) => sum + (item.total_price || 0), 0);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Items</h1>
            <p className="text-muted-foreground">
              Manage and track payment items for {project.project_name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Payment Item
        </Button>
      </div>

      {/* Payment Item Selection Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Payment Item Selection
            <Badge variant="secondary">
              {selectedPaymentItems.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>
            Select and manage payment items for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem
                    key={location.location_id}
                    value={location.location_id.toString()}
                  >
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="Flooring">Flooring</SelectItem>
                <SelectItem value="Painting">Painting</SelectItem>
                <SelectItem value="Carpentry">Carpentry</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
                <SelectItem value="Labor">Labor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingPaymentItems ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading payment items...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPaymentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        No payment items found
                        {searchTerm ||
                        locationFilter !== "all" ||
                        categoryFilter !== "all"
                          ? " matching your filters"
                          : " for this project"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPaymentItems.map((item) => (
                    <EditablePaymentItemRow
                      key={item.item_id}
                      item={item}
                      locations={locations}
                      isSelected={selectedPaymentItems.includes(item.item_id)}
                      onSelectionChange={(checked) => {
                        if (checked) {
                          setSelectedPaymentItems((prev) => [
                            ...prev,
                            item.item_id,
                          ]);
                        } else {
                          setSelectedPaymentItems((prev) =>
                            prev.filter((id) => id !== item.item_id)
                          );
                        }
                      }}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Selection Summary */}
          {selectedPaymentItems.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Selected Items: {selectedPaymentItems.length}
              </div>
              <div className="text-lg font-bold text-blue-900">
                Total: ${selectedItemsTotal.toFixed(2)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Item Dialog */}
      <PaymentItemDialog
        projectId={projectId!}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </div>
  );
};

export default PaymentItemsPage;
