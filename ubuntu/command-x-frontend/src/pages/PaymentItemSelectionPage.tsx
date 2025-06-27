import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, MapPin, Tag } from "lucide-react";
import { getProjectById } from "@/services/api";
import { getPaymentItems } from "@/services/paymentItemsApi";
import { PaymentItemData } from "@/types/paymentItem";
import { useIsMobile } from "@/hooks/use-mobile";
import PaymentItemDialog from "@/components/payment-items/PaymentItemDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PaymentItemSelectionPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // State for selection and filtering
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock locations data
  const locations = [
    { location_id: 1, name: "Bedroom 1" },
    { location_id: 2, name: "Bedroom 2" },
    { location_id: 3, name: "Kitchen" },
    { location_id: 4, name: "Living Room" },
    { location_id: 5, name: "Bathroom" },
  ];

  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId!),
    enabled: !!projectId,
  });

  // Fetch payment items
  const { data: paymentItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["paymentItems", projectId],
    queryFn: () => getPaymentItems({ projectId: projectId! }),
    enabled: !!projectId,
  });

  // Filter payment items
  const filteredItems = paymentItems.filter((item) => {
    const matchesSearch = item.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "all" ||
      item.location_id?.toString() === locationFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Handle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Calculate total for selected items
  const selectedItemsTotal = selectedItems.reduce((total, itemId) => {
    const item = paymentItems.find((item) => item.item_id === itemId);
    return total + (item?.total_price || 0);
  }, 0);

  if (isLoadingProject || isLoadingItems) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading payment items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Payment Item Selection</h1>
          <p className="text-muted-foreground">
            {project?.project_name} • {selectedItems.length} selected
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search Items</span>
            <Button
              onClick={() => {
                console.log("Add Custom Item button clicked");
                setIsAddDialogOpen(true);
                console.log("isAddDialogOpen set to true");
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payment items..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
          >
            <div>
              <label className="text-sm font-medium mb-1 block">
                <MapPin className="h-4 w-4 inline-block mr-1" /> Filter by
                Location
              </label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
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
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                <Tag className="h-4 w-4 inline-block mr-1" /> Filter by Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="PLUMBING">Plumbing</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="MATERIALS">Materials</SelectItem>
                  <SelectItem value="LABOR">Labor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Payment Items */}
      <Card>
        <CardHeader>
          <CardTitle>Available Payment Items</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment items found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.item_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.item_id)}
                          onCheckedChange={() =>
                            toggleItemSelection(item.item_id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {item.location_id
                          ? locations.find(
                              (loc) => loc.location_id === item.location_id
                            )?.name || "-"
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        ${item.total_price?.toFixed(2) || "0.00"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Selection Summary */}
              {selectedItems.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        {selectedItems.length} items selected
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        Total: ${selectedItemsTotal.toFixed(2)}
                      </div>
                    </div>
                    <Button>Add to Work Order</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Item Dialog */}
      <PaymentItemDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        projectId={projectId!}
      />
    </div>
  );
};

export default PaymentItemSelectionPage;
