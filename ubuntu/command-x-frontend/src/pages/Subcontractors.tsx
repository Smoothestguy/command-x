import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubcontractors,
  createSubcontractor,
  updateSubcontractor,
  deleteSubcontractor,
  SubcontractorData,
} from "../services/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  LayoutGrid,
  List,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Eye,
  Building,
  User,
  MapPin,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const SubcontractorSchema = Yup.object().shape({
  company_name: Yup.string().required("Company name is required"),
  contact_name: Yup.string(),
  email: Yup.string().email("Invalid email format"),
  phone: Yup.string(),
  address: Yup.string(),
  trade: Yup.string(),
  insurance_expiry: Yup.date().nullable(),
  license_number: Yup.string(),
  status: Yup.string(),
  notes: Yup.string(),
  rating: Yup.number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .nullable(),
});

const Subcontractors: React.FC = () => {
  const queryClient = useQueryClient();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] =
    useState<SubcontractorData | null>(null);

  // UI states
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [tradeFilter, setTradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] =
    useState<keyof SubcontractorData>("company_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch Subcontractors
  const {
    data: subcontractors,
    isLoading,
    error,
    refetch,
  } = useQuery<SubcontractorData[], Error>({
    queryKey: ["subcontractors"],
    queryFn: getSubcontractors,
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Subcontractors refreshed");
  };

  // Get unique trades for filter dropdown
  const uniqueTrades = useMemo(() => {
    if (!subcontractors) return [];
    const trades = subcontractors
      .map((sub) => sub.trade)
      .filter(
        (trade, index, self) => trade && self.indexOf(trade) === index
      ) as string[];
    return trades;
  }, [subcontractors]);

  // Filter and sort subcontractors
  const filteredSubcontractors = useMemo(() => {
    if (!subcontractors) return [];

    // First, filter by active tab
    let filtered = [...subcontractors];
    if (activeTab === "active") {
      filtered = filtered.filter((sub) => sub.status === "Active");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((sub) => sub.status === "Inactive");
    }

    // Then apply other filters
    filtered = filtered.filter((sub) => {
      // Search term filter
      const searchMatch =
        sub.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.contact_name &&
          sub.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.email &&
          sub.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.phone &&
          sub.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.trade &&
          sub.trade.toLowerCase().includes(searchTerm.toLowerCase()));

      // Trade filter
      const tradeMatch = tradeFilter === "all" || sub.trade === tradeFilter;

      // Status filter
      const statusMatch = statusFilter === "all" || sub.status === statusFilter;

      return searchMatch && tradeMatch && statusMatch;
    });

    // Finally, sort
    filtered.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];

      // Handle different field types
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc"
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
      }

      // Default case
      return 0;
    });

    return filtered;
  }, [
    subcontractors,
    activeTab,
    searchTerm,
    tradeFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  // --- Mutations ---

  // Create Subcontractor
  const createMutation = useMutation({
    mutationFn: createSubcontractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcontractors"] });
      setIsCreateDialogOpen(false);
      toast.success("Subcontractor created successfully!");
    },
    onError: (err) => {
      console.error("Error creating subcontractor:", err);
      toast.error("Failed to create subcontractor.");
    },
  });

  // Update Subcontractor
  const updateMutation = useMutation({
    mutationFn: (subcontractorData: Partial<SubcontractorData>) => {
      if (!selectedSubcontractor?.subcontractor_id)
        throw new Error("No subcontractor selected for update");
      return updateSubcontractor(
        selectedSubcontractor.subcontractor_id,
        subcontractorData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcontractors"] });
      setIsEditDialogOpen(false);
      setSelectedSubcontractor(null);
      toast.success("Subcontractor updated successfully!");
    },
    onError: (err) => {
      console.error("Error updating subcontractor:", err);
      toast.error("Failed to update subcontractor.");
    },
  });

  // Delete Subcontractor
  const deleteMutation = useMutation({
    mutationFn: deleteSubcontractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcontractors"] });
      toast.success("Subcontractor deleted successfully!");
    },
    onError: (err) => {
      console.error("Error deleting subcontractor:", err);
      toast.error("Failed to delete subcontractor.");
    },
  });

  // --- Form Handling (using Formik) ---

  const formik = useFormik<Partial<SubcontractorData>>({
    initialValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      address: "",
      trade: "",
      insurance_expiry: null,
      license_number: "",
      status: "Active",
      notes: "",
      rating: undefined,
    },
    validationSchema: SubcontractorSchema,
    onSubmit: (values) => {
      if (selectedSubcontractor) {
        updateMutation.mutate(values);
      } else {
        // Cast to SubcontractorData for create
        createMutation.mutate(values as SubcontractorData);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedSubcontractor changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedSubcontractor) {
      formik.setValues({
        company_name: selectedSubcontractor.company_name || "",
        contact_name: selectedSubcontractor.contact_name || "",
        email: selectedSubcontractor.email || "",
        phone: selectedSubcontractor.phone || "",
        address: selectedSubcontractor.address || "",
        trade: selectedSubcontractor.trade || "",
        insurance_expiry: selectedSubcontractor.insurance_expiry
          ? new Date(selectedSubcontractor.insurance_expiry)
              .toISOString()
              .split("T")[0]
          : null,
        license_number: selectedSubcontractor.license_number || "",
        status: selectedSubcontractor.status || "Active",
        notes: selectedSubcontractor.notes || "",
        rating: selectedSubcontractor.rating,
      });
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcontractor]);

  const handleEditClick = (subcontractor: SubcontractorData) => {
    setSelectedSubcontractor(subcontractor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (subcontractor: SubcontractorData) => {
    setSelectedSubcontractor(subcontractor);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedSubcontractor(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Handle view subcontractor details
  const handleViewClick = (subcontractor: SubcontractorData) => {
    setSelectedSubcontractor(subcontractor);
    setIsViewDialogOpen(true);
  };

  // Handle delete confirmation dialog
  const handleDeleteConfirm = (subcontractorId: number) => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate(subcontractorId);
  };

  // Calculate days until insurance expiry
  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Get insurance status badge
  const getInsuranceStatusBadge = (expiryDate: string | null) => {
    if (!expiryDate) return <Badge variant="outline">No Data</Badge>;

    const daysUntil = getDaysUntilExpiry(expiryDate);

    if (daysUntil === null) return <Badge variant="outline">Unknown</Badge>;
    if (daysUntil < 0) return <Badge variant="destructive">Expired</Badge>;
    if (daysUntil < 30)
      return (
        <Badge variant="warning" className="bg-orange-500 text-white">
          Expiring Soon
        </Badge>
      );
    return (
      <Badge variant="success" className="bg-green-500 text-white">
        Valid
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subcontractors</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Subcontractor
          </Button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="mb-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Subcontractors</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subcontractors..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={tradeFilter} onValueChange={setTradeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Trade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              {uniqueTrades.map((trade) => (
                <SelectItem key={trade} value={trade}>
                  {trade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
            </Button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading subcontractors...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Error loading subcontractors</h3>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && filteredSubcontractors && (
        <>
          {filteredSubcontractors.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <p className="text-muted-foreground">
                No subcontractors found matching your filters.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortField === "company_name") {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField("company_name");
                          setSortDirection("asc");
                        }
                      }}
                    >
                      Company Name{" "}
                      {sortField === "company_name" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortField === "trade") {
                          setSortDirection(
                            sortDirection === "asc" ? "desc" : "asc"
                          );
                        } else {
                          setSortField("trade");
                          setSortDirection("asc");
                        }
                      }}
                    >
                      Trade{" "}
                      {sortField === "trade" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubcontractors.map((sub) => (
                    <TableRow
                      key={sub.subcontractor_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewClick(sub)}
                    >
                      <TableCell className="font-medium">
                        {sub.company_name}
                      </TableCell>
                      <TableCell>{sub.contact_name}</TableCell>
                      <TableCell>{sub.email}</TableCell>
                      <TableCell>{sub.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10">
                          {sub.trade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sub.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                {getInsuranceStatusBadge(sub.insurance_expiry)}
                                {sub.insurance_expiry && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {new Date(
                                      sub.insurance_expiry
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {sub.insurance_expiry ? (
                                <>
                                  <p>
                                    Expires:{" "}
                                    {new Date(
                                      sub.insurance_expiry
                                    ).toLocaleDateString()}
                                  </p>
                                  <p>
                                    {getDaysUntilExpiry(
                                      sub.insurance_expiry
                                    ) !== null && (
                                      <>
                                        {getDaysUntilExpiry(
                                          sub.insurance_expiry
                                        )! < 0
                                          ? `Expired ${Math.abs(
                                              getDaysUntilExpiry(
                                                sub.insurance_expiry
                                              )!
                                            )} days ago`
                                          : `${getDaysUntilExpiry(
                                              sub.insurance_expiry
                                            )} days remaining`}
                                      </>
                                    )}
                                  </p>
                                </>
                              ) : (
                                <p>No insurance expiry date set</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell
                        className="text-right space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(sub);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(sub);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubcontractor(sub);
                            setIsDeleteDialogOpen(true);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubcontractors.map((sub) => (
                <Card
                  key={sub.subcontractor_id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {sub.company_name}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {sub.contact_name || "No contact name"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          sub.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">
                          {sub.trade || "No trade specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{sub.email || "No email"}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{sub.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{sub.address || "No address"}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Insurance: </span>
                        {getInsuranceStatusBadge(sub.insurance_expiry)}
                      </div>
                      {sub.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-yellow-500" />
                          <span>{sub.rating.toFixed(1)} / 5.0</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">
                        {sub.active_work_orders || 0}
                      </span>{" "}
                      active,{" "}
                      <span className="font-medium">
                        {sub.completed_work_orders || 0}
                      </span>{" "}
                      completed
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(sub)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(sub)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={
          selectedSubcontractor ? setIsEditDialogOpen : setIsCreateDialogOpen
        }
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSubcontractor
                ? "Edit Subcontractor"
                : "Add Subcontractor"}
            </DialogTitle>
            <DialogDescription>
              {selectedSubcontractor
                ? "Update the subcontractor details below."
                : "Enter the details for the new subcontractor."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_name" className="text-right">
                  Company
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formik.values.company_name || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.company_name && formik.errors.company_name ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.company_name}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_name" className="text-right">
                  Contact
                </Label>
                <Input
                  id="contact_name"
                  name="contact_name"
                  value={formik.values.contact_name || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formik.values.phone || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formik.values.address || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trade" className="text-right">
                  Trade
                </Label>
                <Select
                  name="trade"
                  value={formik.values.trade || ""}
                  onValueChange={(value) =>
                    formik.setFieldValue("trade", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a trade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Concrete">Concrete</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="Drywall">Drywall</SelectItem>
                    <SelectItem value="Painting">Painting</SelectItem>
                    <SelectItem value="Roofing">Roofing</SelectItem>
                    <SelectItem value="Landscaping">Landscaping</SelectItem>
                    <SelectItem value="Masonry">Masonry</SelectItem>
                    <SelectItem value="Flooring">Flooring</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  name="status"
                  value={formik.values.status || "Active"}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="insurance_expiry" className="text-right">
                  Insurance Expiry
                </Label>
                <Input
                  id="insurance_expiry"
                  name="insurance_expiry"
                  type="date"
                  value={formik.values.insurance_expiry || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license_number" className="text-right">
                  License #
                </Label>
                <Input
                  id="license_number"
                  name="license_number"
                  value={formik.values.license_number || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formik.values.notes || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">
                  Rating (1-5)
                </Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formik.values.rating || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  selectedSubcontractor
                    ? setIsEditDialogOpen(false)
                    : setIsCreateDialogOpen(false)
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save Subcontractor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Subcontractor Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedSubcontractor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {selectedSubcontractor.company_name}
                  <Badge
                    variant={
                      selectedSubcontractor.status === "Active"
                        ? "default"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {selectedSubcontractor.status}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Subcontractor details and performance metrics
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {selectedSubcontractor.contact_name ||
                            "No contact name"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedSubcontractor.email || "No email"}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedSubcontractor.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {selectedSubcontractor.address || "No address"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Business Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Trade: </span>
                        <Badge variant="outline" className="ml-2 bg-primary/10">
                          {selectedSubcontractor.trade || "Not specified"}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <FileCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          License:{" "}
                          {selectedSubcontractor.license_number ||
                            "Not provided"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Insurance: </span>
                        {getInsuranceStatusBadge(
                          selectedSubcontractor.insurance_expiry
                        )}
                        {selectedSubcontractor.insurance_expiry && (
                          <span className="ml-2 text-xs">
                            Expires:{" "}
                            {new Date(
                              selectedSubcontractor.insurance_expiry
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSubcontractor.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Notes
                      </h3>
                      <p className="text-sm border rounded-md p-2 bg-muted/20">
                        {selectedSubcontractor.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Performance
                    </h3>
                    <div className="space-y-4">
                      {selectedSubcontractor.rating && (
                        <div className="flex items-center">
                          <span className="mr-2">Rating:</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= selectedSubcontractor.rating!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm">
                              {selectedSubcontractor.rating.toFixed(1)} / 5.0
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Work Orders</span>
                          <span className="text-sm font-medium">
                            {(selectedSubcontractor.active_work_orders || 0) +
                              (selectedSubcontractor.completed_work_orders ||
                                0)}{" "}
                            total
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-grow">
                            <Progress
                              value={
                                ((selectedSubcontractor.completed_work_orders ||
                                  0) /
                                  ((selectedSubcontractor.active_work_orders ||
                                    0) +
                                    (selectedSubcontractor.completed_work_orders ||
                                      0) || 1)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="bg-blue-500/10">
                              <Clock className="h-3 w-3 mr-1" />
                              {selectedSubcontractor.active_work_orders ||
                                0}{" "}
                              Active
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {selectedSubcontractor.completed_work_orders ||
                                0}{" "}
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {selectedSubcontractor.total_paid !== undefined && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Total Paid</span>
                            <span className="text-sm font-medium">
                              $
                              {selectedSubcontractor.total_paid.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      System Information
                    </h3>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Subcontractor ID:</span>
                        <span>{selectedSubcontractor.subcontractor_id}</span>
                      </div>
                      {selectedSubcontractor.created_at && (
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>
                            {new Date(
                              selectedSubcontractor.created_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedSubcontractor.updated_at && (
                        <div className="flex justify-between">
                          <span>Last Updated:</span>
                          <span>
                            {new Date(
                              selectedSubcontractor.updated_at
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditClick(selectedSubcontractor);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subcontractor? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedSubcontractor && (
            <div className="py-4">
              <div className="flex items-center p-3 border rounded-md bg-muted/20">
                <Building className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">
                    {selectedSubcontractor.company_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubcontractor.contact_name} •{" "}
                    {selectedSubcontractor.trade}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedSubcontractor &&
                handleDeleteConfirm(selectedSubcontractor.subcontractor_id!)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Subcontractor
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subcontractors;
