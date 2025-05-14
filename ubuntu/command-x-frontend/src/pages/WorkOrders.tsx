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
  LineItemData,
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
  Users,
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
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

  // Handle view invoice
  const handleViewInvoice = (workOrder: WorkOrderData) => {
    setSelectedWorkOrder(workOrder);
    setIsInvoiceDialogOpen(true);
  };

  // Handle export
  const handleExport = (
    workOrder: WorkOrderData,
    format: "pdf" | "csv" | "excel"
  ) => {
    // In a real app, you would call an API to generate the export
    // For now, we'll simulate a download with a toast notification

    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 1500);
      }),
      {
        loading: `Preparing ${format.toUpperCase()} export...`,
        success: () => {
          // Create a fake download by creating a temporary anchor element
          const element = document.createElement("a");

          // Different file name based on format
          const fileName = `work_order_${workOrder.work_order_id}_${
            format === "excel" ? "xlsx" : format
          }`;

          // Set the attributes for download
          element.setAttribute("href", "#");
          element.setAttribute("download", fileName);
          element.style.display = "none";

          // Append to the body, click it, and remove it
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          return `Work Order exported as ${format.toUpperCase()}`;
        },
        error: `Failed to export as ${format.toUpperCase()}`,
      }
    );
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

  // Handle batch status update for selected rows
  const handleBatchStatusUpdateForRows = (status: string) => {
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

  const calculateTotals = useMemo(() => {
    if (!filteredWorkOrders)
      return {
        estimatedTotal: 0,
        actualTotal: 0,
        billedTotal: 0,
        paidTotal: 0,
      };

    return filteredWorkOrders.reduce(
      (acc, wo) => {
        return {
          estimatedTotal: acc.estimatedTotal + (wo.estimated_cost || 0),
          actualTotal: acc.actualTotal + (wo.actual_cost || 0),
          billedTotal: acc.billedTotal + (wo.amount_billed || 0),
          paidTotal: acc.paidTotal + (wo.amount_paid || 0),
        };
      },
      {
        estimatedTotal: 0,
        actualTotal: 0,
        billedTotal: 0,
        paidTotal: 0,
      }
    );
  }, [filteredWorkOrders]);

  const [isLineItemDialogOpen, setIsLineItemDialogOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);

  const handleManageLineItems = async (workOrder: WorkOrderData) => {
    setSelectedWorkOrder(workOrder);
    // Fetch line items for this work order
    try {
      // In a real implementation, you would fetch from API
      // For now, we'll use mock data
      const items = workOrder.line_items || [];
      setLineItems(items);
      setIsLineItemDialogOpen(true);
    } catch (error) {
      console.error("Error fetching line items:", error);
      toast.error("Failed to load line items");
    }
  };

  const [newLineItem, setNewLineItem] = useState({
    description: "",
    quantity: 1,
    unit_cost: 0,
    status: "Not Started",
  });

  // Work Order Status Management
  const [showStatusManagement, setShowStatusManagement] = useState(false);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate totals for status management
  const statusTotals = useMemo(() => {
    if (!filteredWorkOrders)
      return {
        totalSWO: 0,
        totalSubMaterial: 0,
        totalWOAmount: 0,
        totalUnbillable: 0,
        totalUnbillableHeld: 0,
        totalRetainageHeld: 0,
        totalRetainageAmount: 0,
        totalWODue: 0,
        totalPendingCOs: 0,
      };

    return filteredWorkOrders.reduce(
      (acc, wo) => {
        const estimatedCost = wo.estimated_cost || 0;
        const actualCost = wo.actual_cost || 0;
        const amountBilled = wo.amount_billed || 0;
        const amountPaid = wo.amount_paid || 0;
        const retainagePercentage = wo.retainage_percentage || 0;
        const retainageAmount = (amountBilled * retainagePercentage) / 100;

        // Assuming subcontractor material is 60% of estimated cost for this example
        const subMaterial = estimatedCost * 0.6;

        return {
          totalSWO: acc.totalSWO + estimatedCost,
          totalSubMaterial: acc.totalSubMaterial + subMaterial,
          totalWOAmount: acc.totalWOAmount + actualCost,
          totalUnbillable: acc.totalUnbillable + 0, // Placeholder
          totalUnbillableHeld: acc.totalUnbillableHeld + 0, // Placeholder
          totalRetainageHeld: acc.totalRetainageHeld + 0, // Placeholder
          totalRetainageAmount: acc.totalRetainageAmount + retainageAmount,
          totalWODue: acc.totalWODue + (amountBilled - amountPaid),
          totalPendingCOs: acc.totalPendingCOs + 0, // Placeholder
        };
      },
      {
        totalSWO: 0,
        totalSubMaterial: 0,
        totalWOAmount: 0,
        totalUnbillable: 0,
        totalUnbillableHeld: 0,
        totalRetainageHeld: 0,
        totalRetainageAmount: 0,
        totalWODue: 0,
        totalPendingCOs: 0,
      }
    );
  }, [filteredWorkOrders]);

  // Status Summary component
  const StatusSummary = () => {
    const totalWorkOrders = filteredWorkOrders?.length || 0;
    const completedWorkOrders =
      filteredWorkOrders?.filter((wo) => wo.status === "Completed").length || 0;

    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Work Orders:</span>
          <span className="font-semibold">{totalWorkOrders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Completed:</span>
          <span className="font-semibold">{completedWorkOrders}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total SWO Amount:</span>
          <span className="font-semibold">
            {formatCurrency(statusTotals.totalSWO)}
          </span>
        </div>
      </div>
    );
  };

  // Retainage Summary component
  const RetainageSummary = () => {
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Retainage:</span>
          <span className="font-semibold">
            {formatCurrency(statusTotals.totalRetainageAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Retainage Held:</span>
          <span className="font-semibold">
            {formatCurrency(statusTotals.totalRetainageHeld)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pending COs:</span>
          <span className="font-semibold">{statusTotals.totalPendingCOs}</span>
        </div>
      </div>
    );
  };

  // State for batch status update dialog
  const [isBatchStatusDialogOpen, setIsBatchStatusDialogOpen] = useState(false);
  const [batchStatusValue, setBatchStatusValue] = useState("In Progress");
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<number[]>(
    []
  );

  // State for report generation dialog
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState("status");
  const [reportFormat, setReportFormat] = useState("pdf");

  // State for crew management dialog
  const [isCrewDialogOpen, setIsCrewDialogOpen] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState("");

  // State for filter dialog
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [statusFilterValue, setStatusFilterValue] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState({ from: "", to: "" });

  // Handle batch status update
  const handleBatchStatusUpdate = () => {
    if (selectedWorkOrderIds.length === 0) {
      toast.error("No work orders selected");
      return;
    }

    // In a real implementation, you would call an API to update the status
    // For now, we'll simulate the update with a toast notification
    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 1500);
      }),
      {
        loading: `Updating status for ${
          selectedWorkOrderIds.length
        } work order${selectedWorkOrderIds.length === 1 ? "" : "s"}...`,
        success: () => {
          setIsBatchStatusDialogOpen(false);
          setSelectedWorkOrderIds([]);
          return `Updated ${selectedWorkOrderIds.length} work order${
            selectedWorkOrderIds.length === 1 ? "" : "s"
          } to ${batchStatusValue}`;
        },
        error: "Failed to update work order status",
      }
    );
  };

  // Handle report generation
  const handleGenerateReport = () => {
    // In a real implementation, you would call an API to generate the report
    // For now, we'll simulate the generation with a toast notification
    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 2000);
      }),
      {
        loading: `Generating ${reportType} report...`,
        success: () => {
          // Create a fake download by creating a temporary anchor element
          const element = document.createElement("a");
          const fileName = `work_order_${reportType}_report.${reportFormat}`;

          // Set the attributes for download
          element.setAttribute("href", "#");
          element.setAttribute("download", fileName);
          element.style.display = "none";

          // Append to the body, click it, and remove it
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          setIsReportDialogOpen(false);
          return `${
            reportType.charAt(0).toUpperCase() + reportType.slice(1)
          } report generated successfully`;
        },
        error: "Failed to generate report",
      }
    );
  };

  // Handle crew assignment
  const handleCrewAssignment = () => {
    if (!selectedCrew) {
      toast.error("No crew selected");
      return;
    }

    if (selectedWorkOrderIds.length === 0) {
      toast.error("No work orders selected");
      return;
    }

    // In a real implementation, you would call an API to assign the crew
    // For now, we'll simulate the assignment with a toast notification
    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 1500);
      }),
      {
        loading: `Assigning crew to ${selectedWorkOrderIds.length} work orders...`,
        success: () => {
          setIsCrewDialogOpen(false);
          setSelectedCrew("");
          setSelectedWorkOrderIds([]);
          return `Assigned ${selectedCrew} to ${selectedWorkOrderIds.length} work orders`;
        },
        error: "Failed to assign crew",
      }
    );
  };

  // Handle export
  const handleExportStatusData = (format: "csv" | "excel" | "pdf") => {
    // In a real implementation, you would call an API to generate the export
    // For now, we'll simulate the export with a toast notification
    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 1500);
      }),
      {
        loading: `Preparing ${format.toUpperCase()} export...`,
        success: () => {
          // Create a fake download by creating a temporary anchor element
          const element = document.createElement("a");
          const fileName = `work_order_status_${
            format === "excel" ? "xlsx" : format
          }`;

          // Set the attributes for download
          element.setAttribute("href", "#");
          element.setAttribute("download", fileName);
          element.style.display = "none";

          // Append to the body, click it, and remove it
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);

          return `Work Order Status data exported as ${format.toUpperCase()}`;
        },
        error: `Failed to export as ${format.toUpperCase()}`,
      }
    );
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    // In a real implementation, you would update the filter state and refetch data
    // For now, we'll simulate the filtering with a toast notification
    toast.success("Filters applied successfully");
    setIsFilterDialogOpen(false);

    // Here you would typically update your filter state and trigger a refetch
    // setStatusFilter(statusFilterValue);
    // setDateRange({ from: dateRangeFilter.from, to: dateRangeFilter.to });
  };

  // Quick Actions component
  const QuickActions = () => {
    return (
      <div className="space-y-2">
        <Button
          className="w-full"
          variant="default"
          onClick={() => {
            // Open the dialog without pre-selecting all work orders
            // This allows the user to choose which ones to update
            setIsBatchStatusDialogOpen(true);
          }}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Update Status
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create reports for work order status and progress</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  // Open the dialog without pre-selecting all work orders
                  setIsCrewDialogOpen(true);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Crew
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Assign crews to selected work orders</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  // Percentage Cell component for the status table
  const PercentageCell = ({ value }: { value: number }) => {
    return (
      <TableCell className="text-center">
        <Badge variant={value > 0 ? "default" : "outline"} className="w-16">
          {value}%
        </Badge>
      </TableCell>
    );
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // In a real implementation, you would call an API to save the changes
    // For now, we'll simulate the save with a toast notification
    toast.promise(
      new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
          resolve(true);
        }, 1500);
      }),
      {
        loading: "Saving changes...",
        success: "Changes saved successfully",
        error: "Failed to save changes",
      }
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">Work Orders</h1>
        <div className="flex flex-wrap justify-center gap-2">
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
          <Button
            variant="outline"
            onClick={() => setShowStatusManagement(!showStatusManagement)}
          >
            {showStatusManagement
              ? "Hide Status Management"
              : "Show Status Management"}
          </Button>
        </div>
      </div>

      {/* Work Order Status Management Section */}
      {showStatusManagement && (
        <div className="mb-8">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <CardTitle>Work Order Status Management</CardTitle>
                  <CardDescription>
                    Track and manage work order status and completion
                  </CardDescription>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterDialogOpen(true)}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleExportStatusData("pdf")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportStatusData("csv")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        CSV Spreadsheet
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportStatusData("excel")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Excel Spreadsheet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">
                  Work Order Status Details
                </h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          % Completed
                        </TableHead>
                        <TableHead className="text-center">
                          % Work Not Started
                        </TableHead>
                        <TableHead className="text-center">SWO Total</TableHead>
                        <TableHead className="text-center">
                          Sub W.O. Material
                        </TableHead>
                        <TableHead className="text-center">
                          W.O. Amount
                        </TableHead>
                        <TableHead className="text-center">
                          Unbillable Amount
                        </TableHead>
                        <TableHead className="text-center">
                          Unbillable Held
                        </TableHead>
                        <TableHead className="text-center">
                          Retainage Held
                        </TableHead>
                        <TableHead className="text-center">
                          Retainage Amount
                        </TableHead>
                        <TableHead className="text-center">
                          W.O. Amount Due
                        </TableHead>
                        <TableHead className="text-center">
                          Pending COs
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWorkOrders?.map((wo) => {
                        const percentComplete =
                          wo.status === "Completed"
                            ? 100
                            : wo.status === "In Progress"
                            ? 65
                            : 0;
                        const percentNotStarted =
                          wo.status === "Pending" ? 100 : 0;
                        const estimatedCost = wo.estimated_cost || 0;
                        const actualCost = wo.actual_cost || 0;
                        const amountBilled = wo.amount_billed || 0;
                        const amountPaid = wo.amount_paid || 0;
                        const retainagePercentage =
                          wo.retainage_percentage || 0;
                        const retainageAmount =
                          (amountBilled * retainagePercentage) / 100;

                        // Assuming subcontractor material is 60% of estimated cost for this example
                        const subMaterial = estimatedCost * 0.6;

                        return (
                          <TableRow key={wo.work_order_id}>
                            <PercentageCell value={percentComplete} />
                            <PercentageCell value={percentNotStarted} />
                            <TableCell className="text-center">
                              {formatCurrency(estimatedCost)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(subMaterial)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(actualCost)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(0)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(0)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(0)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(retainageAmount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {formatCurrency(amountBilled - amountPaid)}
                            </TableCell>
                            <TableCell className="text-center">0</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredWorkOrders?.map((wo) => {
                    const percentComplete =
                      wo.status === "Completed"
                        ? 100
                        : wo.status === "In Progress"
                        ? 65
                        : 0;
                    const estimatedCost = wo.estimated_cost || 0;
                    const actualCost = wo.actual_cost || 0;
                    const amountBilled = wo.amount_billed || 0;
                    const amountPaid = wo.amount_paid || 0;
                    const retainagePercentage = wo.retainage_percentage || 0;
                    const retainageAmount =
                      (amountBilled * retainagePercentage) / 100;

                    return (
                      <Card key={wo.work_order_id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-sm flex justify-between">
                            <span>Work Order #{wo.work_order_id}</span>
                            <Badge
                              variant={
                                percentComplete === 100 ? "default" : "outline"
                              }
                            >
                              {percentComplete}% Complete
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                SWO Total
                              </span>
                              <span className="font-medium">
                                {formatCurrency(estimatedCost)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                W.O. Amount
                              </span>
                              <span className="font-medium">
                                {formatCurrency(actualCost)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                Retainage Amount
                              </span>
                              <span className="font-medium">
                                {formatCurrency(retainageAmount)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-muted-foreground text-xs">
                                Amount Due
                              </span>
                              <span className="font-medium">
                                {formatCurrency(amountBilled - amountPaid)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Status Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StatusSummary />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Retainage Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RetainageSummary />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickActions />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile-optimized Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 overflow-x-auto">
          <TabsTrigger
            value="all"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            All Work Orders
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="inProgress"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Mobile-optimized Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Search input - full width on mobile */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter controls - stacked on mobile, row on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
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
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Projects" />
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
                  <Button variant="outline" className="w-full md:w-[180px]">
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

          {/* View mode and batch actions - stacked on mobile */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="flex-1 sm:flex-none"
              >
                <FileText className="mr-2 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === "cards" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="flex-1 sm:flex-none"
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Cards
              </Button>
            </div>

            {selectedRows.length > 0 && (
              <div className="flex gap-2 items-center w-full sm:w-auto justify-center sm:justify-start">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Batch Actions <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        handleBatchStatusUpdateForRows("In Progress")
                      }
                    >
                      Mark as In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleBatchStatusUpdateForRows("Completed")
                      }
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBatchStatusUpdateForRows("On Hold")}
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
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="rounded-md border hidden md:block">
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewInvoice(wo);
                                        }}
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Invoice
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                          >
                                            <Download className="mr-2 h-4 w-4" />
                                            Export
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>
                                            Export Format
                                          </DropdownMenuLabel>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleExport(wo, "pdf");
                                            }}
                                          >
                                            <FileText className="mr-2 h-4 w-4" />
                                            PDF Document
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleExport(wo, "csv");
                                            }}
                                          >
                                            <FileText className="mr-2 h-4 w-4" />
                                            CSV Spreadsheet
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleExport(wo, "excel");
                                            }}
                                          >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Excel Spreadsheet
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
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

              {/* Mobile-optimized Table View - Only visible on mobile */}
              <div className="md:hidden space-y-4">
                {filteredWorkOrders.map((wo) => (
                  <Card key={wo.work_order_id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                          <CardTitle className="text-base font-medium line-clamp-2">
                            {wo.description}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {getProjectName(wo.project_id)}
                          </CardDescription>
                        </div>
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
                          className="ml-2 whitespace-nowrap"
                        >
                          {wo.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 pb-2">
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-muted-foreground">Scheduled:</div>
                        <div className="text-right font-medium">
                          {wo.scheduled_date
                            ? new Date(wo.scheduled_date).toLocaleDateString()
                            : "-"}
                        </div>

                        <div className="text-muted-foreground">Est. Cost:</div>
                        <div className="text-right font-medium">
                          {wo.estimated_cost
                            ? `$${wo.estimated_cost.toLocaleString()}`
                            : "-"}
                        </div>

                        <div className="text-muted-foreground">
                          Subcontractor:
                        </div>
                        <div className="text-right font-medium truncate">
                          {getSubcontractorName(wo.assigned_subcontractor_id)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-24"
                        onClick={() => {
                          setSelectedWorkOrder(wo);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-24"
                          onClick={() => handleEditClick(wo)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-24"
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
            </>
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

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>Work order invoice details</DialogDescription>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="py-4">
              <div className="border rounded-md overflow-hidden">
                <div className="bg-primary text-primary-foreground p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">INVOICE</h2>
                      <p className="text-primary-foreground/80 mt-1">
                        #
                        {selectedWorkOrder.invoice_number ||
                          `INV-${selectedWorkOrder.work_order_id}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-lg font-semibold">
                        Command X Construction
                      </h3>
                      <p className="text-primary-foreground/80">
                        123 Builder Street
                      </p>
                      <p className="text-primary-foreground/80">
                        Construction City, CC 12345
                      </p>
                      <p className="text-primary-foreground/80">
                        info@commandx.com
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-2">
                        Bill To:
                      </h4>
                      <p className="font-medium">
                        {getProjectName(selectedWorkOrder.project_id)}
                      </p>
                      <p>Client Company Name</p>
                      <p>123 Client Street</p>
                      <p>Client City, CL 54321</p>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">
                            Invoice Date:
                          </span>
                          <span>
                            {selectedWorkOrder.invoice_date
                              ? new Date(
                                  selectedWorkOrder.invoice_date
                                ).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">
                            Due Date:
                          </span>
                          <span>
                            {selectedWorkOrder.invoice_date
                              ? new Date(
                                  new Date(
                                    selectedWorkOrder.invoice_date
                                  ).setDate(
                                    new Date(
                                      selectedWorkOrder.invoice_date
                                    ).getDate() + 30
                                  )
                                ).toLocaleDateString()
                              : new Date(
                                  new Date().setDate(new Date().getDate() + 30)
                                ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-muted-foreground">
                            Work Order ID:
                          </span>
                          <span>#{selectedWorkOrder.work_order_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-medium mb-4">Work Order Details</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          {selectedWorkOrder.description}
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          $
                          {selectedWorkOrder.amount_billed?.toLocaleString() ||
                            selectedWorkOrder.estimated_cost?.toLocaleString() ||
                            "0"}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {selectedWorkOrder.amount_billed?.toLocaleString() ||
                            selectedWorkOrder.estimated_cost?.toLocaleString() ||
                            "0"}
                        </TableCell>
                      </TableRow>

                      {/* If there were line items, we would map through them here */}
                      {/* For now, let's add a few sample line items */}
                      <TableRow>
                        <TableCell className="font-medium">Materials</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          $
                          {Math.round(
                            (selectedWorkOrder.estimated_cost || 0) * 0.4
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {Math.round(
                            (selectedWorkOrder.estimated_cost || 0) * 0.4
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Labor</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          $
                          {Math.round(
                            (selectedWorkOrder.estimated_cost || 0) * 0.6
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {Math.round(
                            (selectedWorkOrder.estimated_cost || 0) * 0.6
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-6 border-t pt-4">
                    <div className="flex justify-end">
                      <div className="w-1/2 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Subtotal:</span>
                          <span>
                            $
                            {selectedWorkOrder.amount_billed?.toLocaleString() ||
                              selectedWorkOrder.estimated_cost?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Tax (8%):</span>
                          <span>
                            $
                            {Math.round(
                              (selectedWorkOrder.amount_billed ||
                                selectedWorkOrder.estimated_cost ||
                                0) * 0.08
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            Retainage (
                            {selectedWorkOrder.retainage_percentage || 0}%):
                          </span>
                          <span>
                            $
                            {Math.round(
                              ((selectedWorkOrder.amount_billed ||
                                selectedWorkOrder.estimated_cost ||
                                0) *
                                (selectedWorkOrder.retainage_percentage || 0)) /
                                100
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                          <span>Total Due:</span>
                          <span>
                            $
                            {Math.round(
                              (selectedWorkOrder.amount_billed ||
                                selectedWorkOrder.estimated_cost ||
                                0) *
                                1.08 -
                                ((selectedWorkOrder.amount_billed ||
                                  selectedWorkOrder.estimated_cost ||
                                  0) *
                                  (selectedWorkOrder.retainage_percentage ||
                                    0)) /
                                  100
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-medium mb-2">Payment Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Please make payment to: Command X Construction
                      <br />
                      Bank: Construction Bank
                      <br />
                      Account: 123456789
                      <br />
                      Routing: 987654321
                    </p>

                    <p className="mt-4 text-sm text-muted-foreground">
                      Payment Terms: Net 30 days. Please include the invoice
                      number with your payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInvoiceDialogOpen(false)}
              >
                Close
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsInvoiceDialogOpen(false);
                      if (selectedWorkOrder) {
                        handleExport(selectedWorkOrder, "pdf");
                      }
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      {/* Batch Status Update Dialog */}
      <Dialog
        open={isBatchStatusDialogOpen}
        onOpenChange={setIsBatchStatusDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Work Order Status</DialogTitle>
            <DialogDescription>
              Change the status for the selected work orders.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={batchStatusValue}
                  onValueChange={setBatchStatusValue}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Selected Work Orders</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Select all filtered work orders
                        const ids =
                          filteredWorkOrders
                            ?.map((wo) => wo.work_order_id!)
                            .filter(Boolean) || [];
                        setSelectedWorkOrderIds(ids);
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkOrderIds([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {selectedWorkOrderIds.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border rounded-md text-center">
                    No work orders selected. Please select at least one work
                    order.
                  </div>
                ) : selectedWorkOrderIds.length > 5 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {selectedWorkOrderIds.length} work order
                      {selectedWorkOrderIds.length === 1 ? "" : "s"} selected
                    </div>
                    <ScrollArea className="h-[150px] border rounded-md p-2">
                      {selectedWorkOrderIds.map((id) => {
                        const workOrder = filteredWorkOrders?.find(
                          (wo) => wo.work_order_id === id
                        );
                        return workOrder ? (
                          <div
                            key={id}
                            className="flex justify-between items-center py-1 border-b last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={true}
                                onCheckedChange={(checked) => {
                                  if (!checked) {
                                    setSelectedWorkOrderIds((prev) =>
                                      prev.filter((woId) => woId !== id)
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm font-medium">
                                {workOrder.description}
                              </span>
                            </div>
                            <Badge
                              variant={
                                workOrder.status === "Completed"
                                  ? "default"
                                  : workOrder.status === "In Progress"
                                  ? "secondary"
                                  : workOrder.status === "On Hold"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {workOrder.status}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedWorkOrderIds.map((id) => {
                      const workOrder = filteredWorkOrders?.find(
                        (wo) => wo.work_order_id === id
                      );
                      return workOrder ? (
                        <div
                          key={id}
                          className="flex justify-between items-center py-1 border-b last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={true}
                              onCheckedChange={(checked) => {
                                if (!checked) {
                                  setSelectedWorkOrderIds((prev) =>
                                    prev.filter((woId) => woId !== id)
                                  );
                                }
                              }}
                            />
                            <span className="text-sm font-medium">
                              {workOrder.description}
                            </span>
                          </div>
                          <Badge
                            variant={
                              workOrder.status === "Completed"
                                ? "default"
                                : workOrder.status === "In Progress"
                                ? "secondary"
                                : workOrder.status === "On Hold"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {workOrder.status}
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBatchStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchStatusUpdate}
              disabled={selectedWorkOrderIds.length === 0}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Generation Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a report for work order status and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="progress">Progress Report</SelectItem>
                    <SelectItem value="retainage">Retainage Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportFormat">Format</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateReport}>Generate Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crew Management Dialog */}
      <Dialog open={isCrewDialogOpen} onOpenChange={setIsCrewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Crew Assignment</DialogTitle>
            <DialogDescription>
              Assign a crew to the selected work orders.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crew">Select Crew</Label>
                <Select value={selectedCrew} onValueChange={setSelectedCrew}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crew" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crew A">Crew A</SelectItem>
                    <SelectItem value="Crew B">Crew B</SelectItem>
                    <SelectItem value="Crew C">Crew C</SelectItem>
                    <SelectItem value="Crew D">Crew D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  This will assign the selected crew to{" "}
                  {selectedWorkOrderIds.length} work order(s).
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCrewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCrewAssignment}>Assign Crew</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Work Orders</DialogTitle>
            <DialogDescription>
              Apply filters to the work order status view.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={statusFilterValue}
                  onValueChange={setStatusFilterValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateRangeFilter.from}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateRangeFilter.to}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDateRangeFilter({ from: "", to: "" });
                setStatusFilterValue("all");
                setIsFilterDialogOpen(false);
              }}
            >
              Reset
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
