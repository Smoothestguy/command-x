import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendors } from "../services/purchaseOrderApi";
import { VendorData } from "../types/purchaseOrder";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  Building,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for vendors
let mockVendors: VendorData[] = [
  {
    vendor_id: 1,
    name: "ABC Supplies",
    legal_name: "ABC Supplies LLC",
    tax_id: "45-1234567",
    w9_url: "https://example.com/w9/abc-supplies.pdf",
    w9_received: true,
    contact_name: "John Smith",
    email: "john@abcsupplies.com",
    phone: "555-123-4567",
    address: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    notes: "Reliable supplier for construction materials",
  },
  {
    vendor_id: 2,
    name: "XYZ Materials",
    legal_name: "XYZ Materials Inc.",
    tax_id: "99-7654321",
    w9_received: false,
    contact_name: "Jane Doe",
    email: "jane@xyzmaterials.com",
    phone: "555-987-6543",
    address: "456 Oak Ave",
    city: "Somewhere",
    state: "NY",
    zip: "67890",
    notes: "Specializes in high-end finishes",
  },
  {
    vendor_id: 3,
    name: "123 Hardware",
    legal_name: "123 Hardware Co.",
    tax_id: "12-2223333",
    w9_received: true,
    contact_name: "Bob Johnson",
    email: "bob@123hardware.com",
    phone: "555-456-7890",
    address: "789 Pine Rd",
    city: "Nowhere",
    state: "TX",
    zip: "54321",
    notes: "Best prices on tools and hardware",
  },
];

// Create a custom API client for vendor operations using mock data
const vendorApiClient = {
  getVendors: async (): Promise<VendorData[]> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockVendors];
  },

  getVendorById: async (id: number): Promise<VendorData> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const vendor = mockVendors.find((v) => v.vendor_id === id);
    if (!vendor) {
      throw new Error(`Vendor with ID ${id} not found`);
    }

    return { ...vendor };
  },

  createVendor: async (vendor: Partial<VendorData>): Promise<VendorData> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newVendor: VendorData = {
      ...vendor,
      vendor_id: Math.max(0, ...mockVendors.map((v) => v.vendor_id || 0)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as VendorData;

    mockVendors.push(newVendor);

    return { ...newVendor };
  },

  updateVendor: async (
    id: number,
    vendor: Partial<VendorData>
  ): Promise<VendorData> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockVendors.findIndex((v) => v.vendor_id === id);
    if (index === -1) {
      throw new Error(`Vendor with ID ${id} not found`);
    }

    const updatedVendor: VendorData = {
      ...mockVendors[index],
      ...vendor,
      updated_at: new Date().toISOString(),
    };

    mockVendors[index] = updatedVendor;

    return { ...updatedVendor };
  },

  deleteVendor: async (id: number): Promise<void> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockVendors.findIndex((v) => v.vendor_id === id);
    if (index === -1) {
      throw new Error(`Vendor with ID ${id} not found`);
    }

    mockVendors.splice(index, 1);
  },
};

// Validation schema for vendor form
const vendorValidationSchema = Yup.object({
  name: Yup.string().required("Vendor name is required"),
  contact_name: Yup.string(),
  email: Yup.string().email("Invalid email address"),
  phone: Yup.string(),
  address: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zip: Yup.string(),
  notes: Yup.string(),
  legal_name: Yup.string(),
  tax_id: Yup.string(),
  w9_url: Yup.string().url("Must be a valid URL"),
  w9_received: Yup.boolean(),
});

const Vendors: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);

  // Fetch vendors
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorApiClient.getVendors,
  });

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: vendorApiClient.createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsCreateDialogOpen(false);
      toast.success("Vendor created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: (vendor: VendorData) =>
      vendorApiClient.updateVendor(vendor.vendor_id!, vendor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsEditDialogOpen(false);
      toast.success("Vendor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => vendorApiClient.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsDeleteDialogOpen(false);
      toast.success("Vendor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
    },
  });

  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vendor.contact_name &&
          vendor.contact_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (vendor.email &&
          vendor.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [vendors, searchTerm]);

  // Create vendor form
  const createFormik = useFormik({
    initialValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      notes: "",
      legal_name: "",
      tax_id: "",
      w9_url: "",
      w9_received: false,
    },
    validationSchema: vendorValidationSchema,
    onSubmit: (values) => {
      createMutation.mutate(values);
    },
  });

  // Edit vendor form
  const editFormik = useFormik({
    initialValues: {
      vendor_id: 0,
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      notes: "",
      legal_name: "",
      tax_id: "",
      w9_url: "",
      w9_received: false,
    },
    validationSchema: vendorValidationSchema,
    onSubmit: (values) => {
      updateMutation.mutate(values as VendorData);
    },
    enableReinitialize: true,
  });

  // Handle edit click
  const handleEditClick = (vendor: VendorData) => {
    setSelectedVendor(vendor);
    editFormik.setValues({
      vendor_id: vendor.vendor_id || 0,
      name: vendor.name || "",
      contact_name: vendor.contact_name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      city: vendor.city || "",
      state: vendor.state || "",
      zip: vendor.zip || "",
      notes: vendor.notes || "",
      legal_name: vendor.legal_name || "",
      tax_id: vendor.tax_id || "",
      w9_url: vendor.w9_url || "",
      w9_received: vendor.w9_received || false,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (vendorId: number) => {
    setSelectedVendorId(vendorId);
    setIsDeleteDialogOpen(true);
  };

  // Handle create click
  const handleCreateClick = () => {
    createFormik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (selectedVendorId) {
      deleteMutation.mutate(selectedVendorId);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          Vendor Management
        </h1>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["vendors"] })
            }
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
          Error loading vendors. Please try again later.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredVendors.length === 0 && (
        <div className="text-center p-8 border border-dashed rounded-md">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No vendors match your search criteria."
              : "You haven't added any vendors yet."}
          </p>
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>
      )}

      {/* Vendor list */}
      {!isLoading && !error && filteredVendors.length > 0 && (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="rounded-md border hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.vendor_id}>
                    <TableCell className="font-medium space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{vendor.name}</span>
                        <Badge variant={vendor.w9_received ? "secondary" : "outline"}>
                          {vendor.w9_received ? "W9 on file" : "W9 pending"}
                        </Badge>
                      </div>
                      {vendor.legal_name && (
                        <div className="text-xs text-muted-foreground">
                          {vendor.legal_name}
                        </div>
                      )}
                      {vendor.tax_id && (
                        <div className="text-xs text-muted-foreground">
                          Tax ID: {vendor.tax_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{vendor.contact_name || "-"}</TableCell>
                    <TableCell>{vendor.email || "-"}</TableCell>
                    <TableCell>{vendor.phone || "-"}</TableCell>
                    <TableCell>
                      {vendor.address
                        ? `${vendor.address}${
                            vendor.city ? `, ${vendor.city}` : ""
                          }${vendor.state ? `, ${vendor.state}` : ""}${
                            vendor.zip ? ` ${vendor.zip}` : ""
                          }`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(vendor)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(vendor.vendor_id!)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile-Optimized List View - Shown only on small screens */}
          <div className="space-y-4 md:hidden">
            {filteredVendors.map((vendor) => (
              <Card
                key={vendor.vendor_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{vendor.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 pt-0">
                  <div className="space-y-2 text-sm">
                    {vendor.contact_name && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{vendor.contact_name}</span>
                      </div>
                    )}
                    {vendor.legal_name && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{vendor.legal_name}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{vendor.email}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant={vendor.w9_received ? "secondary" : "outline"}>
                        {vendor.w9_received ? "W9 on file" : "W9 pending"}
                      </Badge>
                      {vendor.w9_url && (
                        <a
                          href={vendor.w9_url}
                          className="text-xs text-blue-600 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View W9
                        </a>
                      )}
                    </div>
                    {vendor.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <span>
                          {vendor.address}
                          {vendor.city && <>, {vendor.city}</>}
                          {vendor.state && <>, {vendor.state}</>}
                          {vendor.zip && <> {vendor.zip}</>}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(vendor)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(vendor.vendor_id!)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create Vendor Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Enter the details for the new vendor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createFormik.handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Vendor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter vendor name"
                    value={createFormik.values.name}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                  />
                  {createFormik.touched.name && createFormik.errors.name && (
                    <div className="text-red-500 text-sm">
                      {createFormik.errors.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Person</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    placeholder="Enter contact name"
                    value={createFormik.values.contact_name}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={createFormik.values.email}
                    onChange={createFormik.handleChange}
                    onBlur={createFormik.handleBlur}
                  />
                  {createFormik.touched.email && createFormik.errors.email && (
                    <div className="text-red-500 text-sm">
                      {createFormik.errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={createFormik.values.phone}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter street address"
                    value={createFormik.values.address}
                    onChange={createFormik.handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={createFormik.values.city}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={createFormik.values.state}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    placeholder="ZIP Code"
                    value={createFormik.values.zip}
                    onChange={createFormik.handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input
                    id="legal_name"
                    name="legal_name"
                    placeholder="Legal entity name"
                    value={createFormik.values.legal_name}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    placeholder="XX-XXXXXXX"
                    value={createFormik.values.tax_id}
                    onChange={createFormik.handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="w9_url">W-9 URL</Label>
                  <Input
                    id="w9_url"
                    name="w9_url"
                    placeholder="https://..."
                    value={createFormik.values.w9_url}
                    onChange={createFormik.handleChange}
                  />
                </div>
                <div className="space-y-2 flex items-end gap-2">
                  <input
                    id="w9_received"
                    name="w9_received"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={createFormik.values.w9_received}
                    onChange={createFormik.handleChange}
                  />
                  <Label htmlFor="w9_received" className="mb-0">
                    W-9 on file
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input
                    id="legal_name"
                    name="legal_name"
                    placeholder="Legal entity name"
                    value={editFormik.values.legal_name}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    placeholder="XX-XXXXXXX"
                    value={editFormik.values.tax_id}
                    onChange={editFormik.handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="w9_url">W-9 URL</Label>
                  <Input
                    id="w9_url"
                    name="w9_url"
                    placeholder="https://..."
                    value={editFormik.values.w9_url}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2 flex items-end gap-2">
                  <input
                    id="w9_received"
                    name="w9_received"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={editFormik.values.w9_received}
                    onChange={editFormik.handleChange}
                  />
                  <Label htmlFor="w9_received" className="mb-0">
                    W-9 on file
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about this vendor"
                  value={createFormik.values.notes}
                  onChange={createFormik.handleChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Vendor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update the vendor information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editFormik.handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Vendor Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter vendor name"
                    value={editFormik.values.name}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                  />
                  {editFormik.touched.name && editFormik.errors.name && (
                    <div className="text-red-500 text-sm">
                      {editFormik.errors.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Person</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    placeholder="Enter contact name"
                    value={editFormik.values.contact_name}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={editFormik.values.email}
                    onChange={editFormik.handleChange}
                    onBlur={editFormik.handleBlur}
                  />
                  {editFormik.touched.email && editFormik.errors.email && (
                    <div className="text-red-500 text-sm">
                      {editFormik.errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={editFormik.values.phone}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter street address"
                    value={editFormik.values.address}
                    onChange={editFormik.handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="City"
                    value={editFormik.values.city}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="State"
                    value={editFormik.values.state}
                    onChange={editFormik.handleChange}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    placeholder="ZIP Code"
                    value={editFormik.values.zip}
                    onChange={editFormik.handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Additional notes about this vendor"
                  value={editFormik.values.notes}
                  onChange={editFormik.handleChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this vendor. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vendors;
