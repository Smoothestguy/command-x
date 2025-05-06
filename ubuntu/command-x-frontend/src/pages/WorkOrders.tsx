import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  WorkOrderData,
  getProjects,
  ProjectData,
  getSubcontractors,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Upload,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  Loader2,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WorkOrderSchema = Yup.object().shape({
  project_id: Yup.number().required("Project is required"),
  description: Yup.string().required("Description is required"),
  assigned_subcontractor_id: Yup.number().nullable(),
  status: Yup.string(),
  scheduled_date: Yup.date().nullable(),
  completion_date: Yup.date().nullable(),
  estimated_cost: Yup.number()
    .nullable()
    .positive("Estimated cost must be positive"),
  // Add other validations as needed
});

const WorkOrders: React.FC = () => {
  const queryClient = useQueryClient();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] =
    useState<WorkOrderData | null>(null);

  // Filtering and sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortField, setSortField] =
    useState<keyof WorkOrderData>("scheduled_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [dateRange, setDateRange] = useState<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  // UI states
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Fetch Projects for dropdown
  const { data: projects } = useQuery<ProjectData[], Error>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Fetch Subcontractors for dropdown
  const { data: subcontractors } = useQuery<SubcontractorData[], Error>({
    queryKey: ["subcontractors"],
    queryFn: getSubcontractors,
  });

  // Fetch Work Orders
  const {
    data: workOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkOrderData[], Error>({
    queryKey: ["workOrders"],
    queryFn: () => getWorkOrders(), // Fetch all for now
  });

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success("Work orders refreshed");
  };

  // --- Mutations ---

  // Create Work Order
  const createMutation = useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      setIsCreateDialogOpen(false);
      toast.success("Work Order created successfully!");
    },
    onError: (err) => {
      console.error("Error creating work order:", err);
      toast.error("Failed to create work order.");
    },
  });

  // Update Work Order
  const updateMutation = useMutation({
    mutationFn: (workOrderData: Partial<WorkOrderData>) => {
      if (!selectedWorkOrder?.work_order_id)
        throw new Error("No work order selected for update");
      return updateWorkOrder(selectedWorkOrder.work_order_id, workOrderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      setIsEditDialogOpen(false);
      setSelectedWorkOrder(null);
      toast.success("Work Order updated successfully!");
    },
    onError: (err) => {
      console.error("Error updating work order:", err);
      toast.error("Failed to update work order.");
    },
  });

  // Delete Work Order
  const deleteMutation = useMutation({
    mutationFn: deleteWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      toast.success("Work Order deleted successfully!");
    },
    onError: (err) => {
      console.error("Error deleting work order:", err);
      toast.error("Failed to delete work order.");
    },
  });

  // --- Form Handling (using Formik) ---

  const formik = useFormik<Partial<WorkOrderData>>({
    initialValues: {
      project_id: undefined,
      description: "",
      assigned_subcontractor_id: null,
      status: "Pending",
      scheduled_date: null,
      completion_date: null,
      estimated_cost: null,
    },
    validationSchema: WorkOrderSchema,
    onSubmit: (values) => {
      // Ensure project_id is a number before submitting
      const submissionData = {
        ...values,
        project_id: Number(values.project_id),
        estimated_cost: values.estimated_cost
          ? Number(values.estimated_cost)
          : null,
        assigned_subcontractor_id: values.assigned_subcontractor_id
          ? Number(values.assigned_subcontractor_id)
          : null,
      };

      if (selectedWorkOrder) {
        updateMutation.mutate(submissionData);
      } else {
        // Cast to WorkOrderData for create, assuming required fields are met by validation
        createMutation.mutate(submissionData as WorkOrderData);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedWorkOrder changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedWorkOrder) {
      formik.setValues({
        project_id: selectedWorkOrder.project_id,
        description: selectedWorkOrder.description || "",
        assigned_subcontractor_id:
          selectedWorkOrder.assigned_subcontractor_id || null,
        status: selectedWorkOrder.status || "Pending",
        scheduled_date: selectedWorkOrder.scheduled_date
          ? new Date(selectedWorkOrder.scheduled_date)
              .toISOString()
              .split("T")[0]
          : null,
        completion_date: selectedWorkOrder.completion_date
          ? new Date(selectedWorkOrder.completion_date)
              .toISOString()
              .split("T")[0]
          : null,
        estimated_cost: selectedWorkOrder.estimated_cost || null,
        // Set other fields as needed
      });
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkOrder]);

  const handleEditClick = (workOrder: WorkOrderData) => {
    setSelectedWorkOrder(workOrder);
    setIsEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedWorkOrder(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Helper to get project name
  const getProjectName = useCallback(
    (projectId: number | undefined) => {
      if (!projectId) return "N/A";
      return (
        projects?.find((p) => p.project_id === projectId)?.project_name ||
        `Project ID: ${projectId}`
      );
    },
    [projects]
  );

  // Helper to get subcontractor name
  const getSubcontractorName = useCallback(
    (subcontractorId: number | undefined | null) => {
      if (!subcontractorId) return "N/A";
      return (
        subcontractors?.find((s) => s.subcontractor_id === subcontractorId)
          ?.company_name || `Subcontractor ID: ${subcontractorId}`
      );
    },
    [subcontractors]
  );

  // Toggle row expansion
  const toggleRowExpansion = (workOrderId: number) => {
    setExpandedRows((prev) =>
      prev.includes(workOrderId)
        ? prev.filter((id) => id !== workOrderId)
        : [...prev, workOrderId]
    );
  };

  // Toggle row selection
  const toggleRowSelection = (workOrderId: number) => {
    setSelectedRows((prev) =>
      prev.includes(workOrderId)
        ? prev.filter((id) => id !== workOrderId)
        : [...prev, workOrderId]
    );
  };

  // Select all rows
  const toggleSelectAll = () => {
    if (selectedRows.length === (filteredWorkOrders?.length || 0)) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredWorkOrders?.map((wo) => wo.work_order_id!) || []);
    }
  };

  // Handle batch delete
  const handleBatchDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.length} work orders?`
      )
    ) {
      // In a real app, you might want to use a batch delete API endpoint
      // For now, we'll delete them one by one
      selectedRows.forEach((id) => {
        deleteMutation.mutate(id);
      });
      setSelectedRows([]);
    }
  };

  // Handle batch status update
  const handleBatchStatusUpdate = (status: string) => {
    // In a real app, you might want to use a batch update API endpoint
    selectedRows.forEach((id) => {
      const workOrder = workOrders?.find((wo) => wo.work_order_id === id);
      if (workOrder) {
        updateWorkOrder(id, { ...workOrder, status });
      }
    });
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    toast.success(`Updated ${selectedRows.length} work orders to ${status}`);
    setSelectedRows([]);
  };

  // Handle sort
  const handleSort = (field: keyof WorkOrderData) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort work orders
  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];

    // First, filter by active tab
    let filtered = [...workOrders];
    if (activeTab === "inProgress") {
      filtered = filtered.filter((wo) => wo.status === "In Progress");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((wo) => wo.status === "Completed");
    } else if (activeTab === "pending") {
      filtered = filtered.filter(
        (wo) => wo.status === "Pending" || wo.status === "Scheduled"
      );
    }

    // Then apply other filters
    filtered = filtered.filter((wo) => {
      // Search term filter
      const searchMatch =
        wo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectName(wo.project_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        wo.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubcontractorName(wo.assigned_subcontractor_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === "all" || wo.status === statusFilter;

      // Project filter
      const projectMatch =
        projectFilter === "all" || wo.project_id.toString() === projectFilter;

      // Date range filter
      let dateMatch = true;
      if (dateRange.from && wo.scheduled_date) {
        dateMatch = new Date(wo.scheduled_date) >= new Date(dateRange.from);
      }
      if (dateMatch && dateRange.to && wo.scheduled_date) {
        dateMatch = new Date(wo.scheduled_date) <= new Date(dateRange.to);
      }

      return searchMatch && statusMatch && projectMatch && dateMatch;
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
      } else if (fieldA instanceof Date && fieldB instanceof Date) {
        return sortDirection === "asc"
          ? fieldA.getTime() - fieldB.getTime()
          : fieldB.getTime() - fieldA.getTime();
      } else if (typeof fieldA === "number" && typeof fieldB === "number") {
        return sortDirection === "asc" ? fieldA - fieldB : fieldB - fieldA;
      }

      // Default case: convert to string and compare
      const strA = String(fieldA || "");
      const strB = String(fieldB || "");
      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    return filtered;
  }, [
    workOrders,
    searchTerm,
    statusFilter,
    projectFilter,
    dateRange,
    sortField,
    sortDirection,
    activeTab,
    getProjectName,
    getSubcontractorName,
  ]);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
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
            <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Work Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inProgress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem
                      key={project.project_id}
                      value={project.project_id!.toString()}
                    >
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[180px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        type="date"
                        value={dateRange.from || ""}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        type="date"
                        value={dateRange.to || ""}
                        onChange={(e) =>
                          setDateRange((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setDateRange({ from: null, to: null })}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* View mode and batch actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Cards
              </Button>
            </div>

            {selectedRows.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Batch Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleBatchStatusUpdate("In Progress")}
                    >
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBatchStatusUpdate("Completed")}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBatchStatusUpdate("On Hold")}
                    >
                      Mark as On Hold
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={handleBatchDelete}
                    >
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading work orders...</span>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Error loading work orders: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredWorkOrders && (
        <>
          {filteredWorkOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No work orders found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or create a new work order.
                  </p>
                  <Button className="mt-4" onClick={handleCreateClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "cards" ? (
            // Card view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkOrders.map((wo) => (
                <Card key={wo.work_order_id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {wo.description}
                        </CardTitle>
                        <CardDescription>
                          {getProjectName(wo.project_id)}
                        </CardDescription>
                      </div>
                      <Checkbox
                        checked={selectedRows.includes(wo.work_order_id!)}
                        onCheckedChange={() =>
                          toggleRowSelection(wo.work_order_id!)
                        }
                        className="mt-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status:
                        </span>
                        <Badge
                          variant={
                            wo.status === "Completed"
                              ? "default"
                              : wo.status === "In Progress"
                              ? "secondary"
                              : wo.status === "On Hold"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {wo.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Scheduled:
                        </span>
                        <span className="text-sm">
                          {wo.scheduled_date
                            ? new Date(wo.scheduled_date).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Estimated Cost:
                        </span>
                        <span className="text-sm font-medium">
                          {wo.estimated_cost
                            ? `$${wo.estimated_cost.toLocaleString()}`
                            : "-"}
                        </span>
                      </div>
                      {wo.actual_cost && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Actual Cost:
                          </span>
                          <span className="text-sm font-medium">
                            ${wo.actual_cost.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Subcontractor:
                        </span>
                        <span className="text-sm">
                          {getSubcontractorName(wo.assigned_subcontractor_id)}
                        </span>
                      </div>
                      {wo.status === "In Progress" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWorkOrder(wo);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(wo)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkOrder(wo);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            // Table view
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedRows.length === filteredWorkOrders.length &&
                          filteredWorkOrders.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("description")}
                      >
                        Description
                        {sortField === "description" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("project_id")}
                      >
                        Project
                        {sortField === "project_id" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortField === "status" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("scheduled_date")}
                      >
                        Scheduled Date
                        {sortField === "scheduled_date" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort("estimated_cost")}
                      >
                        Estimated Cost
                        {sortField === "estimated_cost" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkOrders.map((wo) => (
                    <React.Fragment key={wo.work_order_id}>
                      <TableRow
                        className={
                          expandedRows.includes(wo.work_order_id!)
                            ? "border-b-0"
                            : ""
                        }
                        onClick={() => toggleRowExpansion(wo.work_order_id!)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedRows.includes(wo.work_order_id!)}
                            onCheckedChange={() =>
                              toggleRowSelection(wo.work_order_id!)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {expandedRows.includes(wo.work_order_id!) ? (
                              <ChevronDown className="mr-2 h-4 w-4" />
                            ) : (
                              <ChevronRight className="mr-2 h-4 w-4" />
                            )}
                            {wo.description}
                          </div>
                        </TableCell>
                        <TableCell>{getProjectName(wo.project_id)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              wo.status === "Completed"
                                ? "default"
                                : wo.status === "In Progress"
                                ? "secondary"
                                : wo.status === "On Hold"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {wo.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {wo.scheduled_date
                            ? new Date(wo.scheduled_date).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {wo.estimated_cost
                            ? `$${wo.estimated_cost.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedWorkOrder(wo);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(wo);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedWorkOrder(wo);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded row details */}
                      {expandedRows.includes(wo.work_order_id!) && (
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={7} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">
                                  Work Order Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Subcontractor:
                                    </span>
                                    <span>
                                      {getSubcontractorName(
                                        wo.assigned_subcontractor_id
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Completion Date:
                                    </span>
                                    <span>
                                      {wo.completion_date
                                        ? new Date(
                                            wo.completion_date
                                          ).toLocaleDateString()
                                        : "Not completed"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Actual Cost:
                                    </span>
                                    <span>
                                      {wo.actual_cost
                                        ? `$${wo.actual_cost.toLocaleString()}`
                                        : "Not available"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  Financial Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Amount Billed:
                                    </span>
                                    <span>
                                      {wo.amount_billed
                                        ? `$${wo.amount_billed.toLocaleString()}`
                                        : "$0"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Amount Paid:
                                    </span>
                                    <span>
                                      {wo.amount_paid
                                        ? `$${wo.amount_paid.toLocaleString()}`
                                        : "$0"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Retainage:
                                    </span>
                                    <span>
                                      {wo.retainage_percentage
                                        ? `${wo.retainage_percentage}%`
                                        : "0%"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  Quick Actions
                                </h4>
                                <div className="flex flex-col gap-2">
                                  <Select
                                    value={wo.status}
                                    onValueChange={(value) => {
                                      if (wo.work_order_id) {
                                        updateWorkOrder(wo.work_order_id, {
                                          ...wo,
                                          status: value,
                                        });
                                        queryClient.invalidateQueries({
                                          queryKey: ["workOrders"],
                                        });
                                        toast.success(
                                          `Status updated to ${value}`
                                        );
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Pending">
                                        Pending
                                      </SelectItem>
                                      <SelectItem value="Scheduled">
                                        Scheduled
                                      </SelectItem>
                                      <SelectItem value="In Progress">
                                        In Progress
                                      </SelectItem>
                                      <SelectItem value="On Hold">
                                        On Hold
                                      </SelectItem>
                                      <SelectItem value="Completed">
                                        Completed
                                      </SelectItem>
                                      <SelectItem value="Cancelled">
                                        Cancelled
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Invoice
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                    >
                                      <Download className="mr-2 h-4 w-4" />
                                      Export
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Work Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about this work order.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    General Information
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Description:
                      </span>
                      <span className="col-span-2 font-medium">
                        {selectedWorkOrder.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Project:</span>
                      <span className="col-span-2">
                        {getProjectName(selectedWorkOrder.project_id)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="col-span-2">
                        <Badge
                          variant={
                            selectedWorkOrder.status === "Completed"
                              ? "default"
                              : selectedWorkOrder.status === "In Progress"
                              ? "secondary"
                              : selectedWorkOrder.status === "On Hold"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {selectedWorkOrder.status}
                        </Badge>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Subcontractor:
                      </span>
                      <span className="col-span-2">
                        {getSubcontractorName(
                          selectedWorkOrder.assigned_subcontractor_id
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Financial Details
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Estimated Cost:
                      </span>
                      <span className="col-span-2 font-medium">
                        {selectedWorkOrder.estimated_cost
                          ? `$${selectedWorkOrder.estimated_cost.toLocaleString()}`
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Actual Cost:
                      </span>
                      <span className="col-span-2">
                        {selectedWorkOrder.actual_cost
                          ? `$${selectedWorkOrder.actual_cost.toLocaleString()}`
                          : "Not available"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Amount Billed:
                      </span>
                      <span className="col-span-2">
                        {selectedWorkOrder.amount_billed
                          ? `$${selectedWorkOrder.amount_billed.toLocaleString()}`
                          : "$0"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">
                        Amount Paid:
                      </span>
                      <span className="col-span-2">
                        {selectedWorkOrder.amount_paid
                          ? `$${selectedWorkOrder.amount_paid.toLocaleString()}`
                          : "$0"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Retainage:</span>
                      <span className="col-span-2">
                        {selectedWorkOrder.retainage_percentage
                          ? `${selectedWorkOrder.retainage_percentage}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Schedule Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">
                      Scheduled Date:
                    </span>
                    <span className="col-span-2">
                      {selectedWorkOrder.scheduled_date
                        ? new Date(
                            selectedWorkOrder.scheduled_date
                          ).toLocaleDateString()
                        : "Not scheduled"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-muted-foreground">
                      Completion Date:
                    </span>
                    <span className="col-span-2">
                      {selectedWorkOrder.completion_date
                        ? new Date(
                            selectedWorkOrder.completion_date
                          ).toLocaleDateString()
                        : "Not completed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                handleEditClick(selectedWorkOrder!);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="py-4">
              <div className="p-4 border rounded-md bg-muted/50">
                <p className="font-medium">{selectedWorkOrder.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Project: {getProjectName(selectedWorkOrder.project_id)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {selectedWorkOrder.status}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedWorkOrder?.work_order_id) {
                  deleteMutation.mutate(selectedWorkOrder.work_order_id);
                  setIsDeleteDialogOpen(false);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={
          selectedWorkOrder ? setIsEditDialogOpen : setIsCreateDialogOpen
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkOrder ? "Edit Work Order" : "Create Work Order"}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkOrder
                ? "Update the work order details below."
                : "Enter the details for the new work order."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project_id" className="text-right">
                  Project
                </Label>
                <Select
                  value={formik.values.project_id?.toString() || ""}
                  onValueChange={(value) =>
                    formik.setFieldValue(
                      "project_id",
                      value ? Number(value) : undefined
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((p) => (
                      <SelectItem
                        key={p.project_id}
                        value={p.project_id!.toString()}
                      >
                        {p.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.project_id && formik.errors.project_id ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.project_id}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.description && formik.errors.description ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.description}
                  </div>
                ) : null}
              </div>

              {/* Add other fields like Status (Select), Subcontractor (Select), Dates (Input type=date), Costs (Input type=number) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formik.values.status || ""}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduled_date" className="text-right">
                  Scheduled
                </Label>
                <Input
                  id="scheduled_date"
                  name="scheduled_date"
                  type="date"
                  value={formik.values.scheduled_date || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimated_cost" className="text-right">
                  Est. Cost ($)
                </Label>
                <Input
                  id="estimated_cost"
                  name="estimated_cost"
                  type="number"
                  value={formik.values.estimated_cost || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.estimated_cost &&
                formik.errors.estimated_cost ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.estimated_cost}
                  </div>
                ) : null}
              </div>

              {/* TODO: Add Subcontractor Select field */}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  selectedWorkOrder
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
                  : "Save Work Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
