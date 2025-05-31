import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WorkOrderData,
  ProjectData,
  SubcontractorData,
  LineItemData,
} from "../services/api";
import {
  workOrdersApi,
  projectsApi,
  subcontractorsApi,
} from "../services/supabaseApi";
import { getCurrentUser } from "../lib/supabase";
import { getPaymentItems, getLocations } from "../services/paymentItemsApi";
import { PaymentItemData, LocationData } from "../types/paymentItem";
import PurchaseOrderSection from "../components/purchase-orders/PurchaseOrderSection";
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
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Fetch Projects for dropdown
  const { data: projects } = useQuery<ProjectData[], Error>({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  });

  // Fetch Subcontractors for dropdown
  const { data: subcontractors } = useQuery<SubcontractorData[], Error>({
    queryKey: ["subcontractors"],
    queryFn: subcontractorsApi.getAll,
  });

  // Log data when it changes
  useEffect(() => {
    if (projects) {
      console.log("Projects loaded:", projects);
      console.log("First project ID type:", typeof projects[0]?.project_id);
    }
  }, [projects]);

  useEffect(() => {
    if (subcontractors) {
      console.log("Subcontractors loaded:", subcontractors);
      console.log(
        "First subcontractor ID type:",
        typeof subcontractors[0]?.subcontractor_id
      );
    }
  }, [subcontractors]);

  // Fetch Work Orders
  const {
    data: workOrders,
    isLoading,
    error,
    refetch,
  } = useQuery<WorkOrderData[], Error>({
    queryKey: ["workOrders"],
    queryFn: () => workOrdersApi.getAll(), // Fetch all for now
  });

  // Fetch Payment Items for the selected work order (for invoice)
  const { data: paymentItems } = useQuery<PaymentItemData[], Error>({
    queryKey: ["paymentItems", selectedWorkOrder?.work_order_id],
    queryFn: () =>
      getPaymentItems({ workOrderId: selectedWorkOrder?.work_order_id }),
    enabled: !!selectedWorkOrder?.work_order_id && isInvoiceDialogOpen,
  });

  // Fetch Locations for the selected work order's project (for invoice)
  const { data: locations } = useQuery<LocationData[], Error>({
    queryKey: ["locations", selectedWorkOrder?.project_id],
    queryFn: () => getLocations({ projectId: selectedWorkOrder?.project_id }),
    enabled: !!selectedWorkOrder?.project_id && isInvoiceDialogOpen,
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
    mutationFn: async (workOrderData: WorkOrderData) => {
      console.log("Creating work order with data:", workOrderData);
      try {
        // Get current user for created_by field
        const { user } = await getCurrentUser();

        // Convert the data to match Supabase schema
        const supabaseData = {
          project_id: workOrderData.project_id || "",
          description: workOrderData.description || "",
          assigned_subcontractor_id:
            workOrderData.assigned_subcontractor_id || null,
          status:
            (workOrderData.status as
              | "Pending"
              | "Assigned"
              | "Started"
              | "In Progress"
              | "Quality Check"
              | "Completed"
              | "Cancelled") || "Pending",
          scheduled_date: workOrderData.scheduled_date || null,
          completion_date: workOrderData.completion_date || null,
          estimated_cost: workOrderData.estimated_cost || null,
          actual_cost: workOrderData.actual_cost || null,
          retainage_percentage: workOrderData.retainage_percentage || 0,
          amount_billed: workOrderData.amount_billed || 0,
          amount_paid: workOrderData.amount_paid || 0,
          created_by: user?.id || null,
        };

        console.log("Supabase data to be sent:", supabaseData);
        return workOrdersApi.create(supabaseData);
      } catch (error) {
        console.error("Error in createWorkOrder function:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Work order created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      setIsCreateDialogOpen(false);
      toast.success("Work Order created successfully!");
    },
    onError: (err) => {
      console.error("Error creating work order:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      toast.error(
        `Failed to create work order: ${err.message || "Unknown error"}`
      );
      // Don't close the dialog on error so the user can try again
    },
  });

  // Update Work Order
  const updateMutation = useMutation({
    mutationFn: (workOrderData: Partial<WorkOrderData>) => {
      if (!selectedWorkOrder?.work_order_id)
        throw new Error("No work order selected for update");

      // Convert the data to match Supabase schema
      const supabaseData = {
        ...(workOrderData.project_id && {
          project_id: workOrderData.project_id.toString(),
        }),
        ...(workOrderData.description && {
          description: workOrderData.description,
        }),
        ...(workOrderData.assigned_subcontractor_id && {
          assigned_subcontractor_id:
            workOrderData.assigned_subcontractor_id.toString(),
        }),
        ...(workOrderData.status && {
          status: workOrderData.status as
            | "Pending"
            | "Assigned"
            | "Started"
            | "In Progress"
            | "Quality Check"
            | "Completed"
            | "Cancelled",
        }),
        ...(workOrderData.scheduled_date && {
          scheduled_date: workOrderData.scheduled_date,
        }),
        ...(workOrderData.completion_date && {
          completion_date: workOrderData.completion_date,
        }),
        ...(workOrderData.estimated_cost !== undefined && {
          estimated_cost: workOrderData.estimated_cost || 0,
        }),
        ...(workOrderData.actual_cost !== undefined && {
          actual_cost: workOrderData.actual_cost || 0,
        }),
        ...(workOrderData.retainage_percentage !== undefined && {
          retainage_percentage: workOrderData.retainage_percentage || 0,
        }),
        ...(workOrderData.amount_billed !== undefined && {
          amount_billed: workOrderData.amount_billed || 0,
        }),
        ...(workOrderData.amount_paid !== undefined && {
          amount_paid: workOrderData.amount_paid || 0,
        }),
      };

      return workOrdersApi.update(
        selectedWorkOrder.work_order_id.toString(),
        supabaseData
      );
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
    mutationFn: (workOrderId: number) =>
      workOrdersApi.delete(workOrderId.toString()),
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
      console.log("Form submitted with values:", values);

      try {
        // Ensure IDs are strings for Supabase
        const submissionData = {
          ...values,
          project_id: values.project_id || "",
          estimated_cost: values.estimated_cost
            ? Number(values.estimated_cost)
            : null,
          assigned_subcontractor_id: values.assigned_subcontractor_id || null,
        };

        console.log("Processed submission data:", submissionData);

        if (selectedWorkOrder) {
          console.log("Updating existing work order");
          updateMutation.mutate(submissionData);
        } else {
          console.log("Creating new work order");
          // Cast to WorkOrderData for create, assuming required fields are met by validation
          createMutation.mutate(submissionData as WorkOrderData);
        }
      } catch (error) {
        console.error("Error processing form submission:", error);
        toast.error("An error occurred while processing your request");
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

  const handleCreateClick = (e?: React.MouseEvent) => {
    console.log("handleCreateClick called");
    if (e) {
      e.preventDefault(); // Prevent any default navigation
      e.stopPropagation(); // Stop event propagation
      console.log("Event prevented and stopped");
    }
    setSelectedWorkOrder(null); // Ensure form is for creation
    formik.resetForm();
    console.log("About to set isCreateDialogOpen to true");
    setIsCreateDialogOpen(true);
    console.log("isCreateDialogOpen set to true");

    // Force a re-render with a timeout
    setTimeout(() => {
      console.log("Timeout callback - forcing dialog open again");
      setIsCreateDialogOpen(true);
    }, 100);
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
    (projectId: string | undefined) => {
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
    (subcontractorId: string | undefined | null) => {
      if (!subcontractorId) return "N/A";
      return (
        subcontractors?.find((s) => s.subcontractor_id === subcontractorId)
          ?.company_name || `Subcontractor ID: ${subcontractorId}`
      );
    },
    [subcontractors]
  );

  // Toggle row expansion
  const toggleRowExpansion = (workOrderId: string) => {
    setExpandedRows((prev) =>
      prev.includes(workOrderId)
        ? prev.filter((id) => id !== workOrderId)
        : [...prev, workOrderId]
    );
  };

  // Toggle row selection
  const toggleRowSelection = (workOrderId: string) => {
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

  // Handle batch status dialog open
  const handleBatchStatusDialogOpen = () => {
    if (selectedRows.length === 0) {
      toast.error("No work orders selected");
      return;
    }
    // Sync the selected rows with selectedWorkOrderIds when opening the dialog
    setSelectedWorkOrderIds(selectedRows);
    setIsBatchStatusDialogOpen(true);
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
  const [selectedWorkOrderIds, setSelectedWorkOrderIds] = useState<string[]>(
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
    // Actually update the work orders with the selected status
    selectedWorkOrderIds.forEach((id) => {
      const workOrder = workOrders?.find((wo) => wo.work_order_id === id);
      if (workOrder) {
        // Use the update mutation for batch updates
        setSelectedWorkOrder(workOrder);
        updateMutation.mutate({ status: batchStatusValue });
      }
    });

    // Refresh the work orders list
    queryClient.invalidateQueries({ queryKey: ["workOrders"] });

    // Show success message and close dialog
    toast.success(
      `Updated ${selectedWorkOrderIds.length} work order${
        selectedWorkOrderIds.length === 1 ? "" : "s"
      } to ${batchStatusValue}`
    );

    setIsBatchStatusDialogOpen(false);
    setSelectedWorkOrderIds([]);
    setSelectedRows([]);
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
          onClick={handleBatchStatusDialogOpen}
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
    <div className="p-4 md:p-8 bg-background text-foreground">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-foreground">
          Work Orders
        </h1>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => {
              console.log("Create Work Order button clicked");

              // Create a modal dialog directly in the DOM
              const modalContainer = document.createElement("div");
              modalContainer.className =
                "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4";
              modalContainer.id = "work-order-modal";

              const modalContent = document.createElement("div");
              modalContent.className =
                "bg-white p-3 sm:p-6 rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto";
              modalContent.innerHTML = `
                <div class="sticky top-0 bg-white pb-3 border-b mb-4 -mx-3 sm:-mx-6 px-3 sm:px-6 z-10">
                  <div class="flex justify-between items-center">
                    <h2 class="text-lg sm:text-2xl font-bold">Create Enhanced Work Order</h2>
                    <button type="button" id="mobile-close-btn" class="sm:hidden p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                  <div class="text-xs sm:text-sm text-gray-600 mt-1">
                    Complete all sections for comprehensive work order management
                  </div>
                </div>
                <form id="work-order-form">
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Project</label>
                    <select id="project-select" class="w-full p-2 border rounded">
                      <option value="">Select a project</option>
                      ${projects
                        ?.map(
                          (p) =>
                            `<option value="${p.project_id}">${p.project_name}</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Description</label>
                    <textarea id="description-input" class="w-full p-2 border rounded" rows="3"></textarea>
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Status</label>
                    <select id="status-select" class="w-full p-2 border rounded">
                      <option value="Pending">Pending</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Estimated Cost ($)</label>
                    <input id="cost-input" type="number" class="w-full p-2 border rounded" />
                  </div>

                  <!-- Enhanced Fields -->
                  <div class="mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-blue-900">Enhanced Features</h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <label class="block text-sm font-medium mb-1">Scheduled Date</label>
                        <input id="scheduled-date" type="date" class="w-full p-2 border rounded" />
                      </div>
                      <div>
                        <label class="block text-sm font-medium mb-1">Retainage %</label>
                        <input id="retainage" type="number" step="0.01" min="0" max="100" class="w-full p-2 border rounded" placeholder="0.00" />
                      </div>
                    </div>

                    <div class="mb-4">
                      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                        <label class="block text-sm font-medium">Multi-Contractor Assignments <span id="contractor-count" class="text-blue-600 font-semibold">(0)</span></label>
                        <button type="button" id="add-contractor-btn" class="w-full sm:w-auto px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 touch-manipulation">
                          + Add Contractor
                        </button>
                      </div>
                      <div id="contractors-container" class="space-y-3">
                        <!-- Contractors will be added here dynamically -->
                      </div>
                      <div id="allocation-summary" class="mt-2 p-2 rounded text-sm" style="display: none;">
                        <span id="allocation-text"></span>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-1">Work Location</label>
                      <select id="location-select" class="w-full p-2 border rounded">
                        <option value="">Select location</option>
                        <option value="bedroom1">Bedroom 1</option>
                        <option value="bedroom2">Bedroom 2</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="living">Living Room</option>
                        <option value="bathroom">Bathroom</option>
                      </select>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-1">Work Category</label>
                      <select id="category-select" class="w-full p-2 border rounded">
                        <option value="">Select category</option>
                        <option value="materials">Materials</option>
                        <option value="labor">Labor</option>
                        <option value="equipment">Equipment</option>
                        <option value="subcontractor">Subcontractor</option>
                      </select>
                    </div>

                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-1">Priority Level</label>
                      <select id="priority-select" class="w-full p-2 border rounded">
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <!-- Payment Item Selection -->
                  <div class="mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                      <h3 class="text-base sm:text-lg font-semibold text-orange-900">Payment Item Selection</h3>
                      <span id="selected-payment-items-count" class="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded self-start sm:self-auto">0 selected</span>
                    </div>

                    <!-- Search and Filter Controls -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label class="block text-xs font-medium mb-1 text-orange-700">Search Items</label>
                        <input type="text" id="payment-item-search" class="w-full p-2 text-sm border rounded"
                               placeholder="Search payment items...">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1 text-orange-700">Filter by Location</label>
                        <select id="payment-item-location-filter" class="w-full p-2 text-sm border rounded">
                          <option value="">All Locations</option>
                          <option value="bedroom1">Bedroom 1</option>
                          <option value="bedroom2">Bedroom 2</option>
                          <option value="kitchen">Kitchen</option>
                          <option value="living">Living Room</option>
                          <option value="bathroom">Bathroom</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1 text-orange-700">Filter by Category</label>
                        <select id="payment-item-category-filter" class="w-full p-2 text-sm border rounded">
                          <option value="">All Categories</option>
                          <option value="materials">Materials</option>
                          <option value="labor">Labor</option>
                          <option value="equipment">Equipment</option>
                          <option value="subcontractor">Subcontractor</option>
                        </select>
                      </div>
                    </div>

                    <!-- Available Payment Items -->
                    <div class="mb-4">
                      <label class="block text-sm font-medium mb-2 text-orange-700">Available Payment Items</label>
                      <div id="payment-items-list" class="max-h-48 overflow-y-auto border rounded p-2 bg-white">
                        <!-- Payment items will be populated here -->
                      </div>
                    </div>

                    <!-- Selected Payment Items Summary -->
                    <div id="selected-payment-items-summary" class="mt-4 p-3 bg-orange-100 rounded text-sm" style="display: none;">
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-orange-900">Selected Payment Items Total:</span>
                        <span id="payment-items-total" class="font-bold text-orange-900">$0.00</span>
                      </div>
                      <div id="selected-payment-items-list" class="space-y-1">
                        <!-- Selected items will be listed here -->
                      </div>
                    </div>
                  </div>

                  <!-- Line Item Management -->
                  <div class="mb-6 p-3 sm:p-4 bg-purple-50 rounded-lg">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                      <h3 class="text-base sm:text-lg font-semibold text-purple-900">Custom Line Items</h3>
                      <button type="button" id="add-line-item-btn" class="w-full sm:w-auto px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 touch-manipulation">
                        + Add Line Item
                      </button>
                    </div>

                    <div id="line-items-container" class="space-y-3">
                      <!-- Line items will be added here dynamically -->
                    </div>

                    <div id="line-items-summary" class="mt-4 p-3 bg-purple-100 rounded text-sm" style="display: none;">
                      <div class="flex justify-between items-center">
                        <span class="font-medium text-purple-900">Line Items Total:</span>
                        <span id="line-items-total" class="font-bold text-purple-900">$0.00</span>
                      </div>
                    </div>
                  </div>

                  <!-- Real-time Cost Calculations Panel -->
                  <div class="mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <h3 class="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4 flex items-center">
                      <span class="mr-2">💰</span>
                      Real-time Cost Breakdown
                    </h3>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <!-- Cost Components -->
                      <div class="space-y-3">
                        <div class="flex justify-between items-center p-2 bg-white rounded border">
                          <span class="text-sm font-medium text-gray-700">Base Cost:</span>
                          <span id="calc-base-cost" class="font-bold text-green-700">$0.00</span>
                        </div>
                        <div class="flex justify-between items-center p-2 bg-white rounded border">
                          <span class="text-sm font-medium text-gray-700">Contractor Allocations:</span>
                          <span id="calc-contractor-cost" class="font-bold text-blue-700">$0.00</span>
                        </div>
                        <div class="flex justify-between items-center p-2 bg-white rounded border">
                          <span class="text-sm font-medium text-gray-700">Payment Items:</span>
                          <span id="calc-payment-items-cost" class="font-bold text-orange-700">$0.00</span>
                        </div>
                        <div class="flex justify-between items-center p-2 bg-white rounded border">
                          <span class="text-sm font-medium text-gray-700">Custom Line Items:</span>
                          <span id="calc-line-items-cost" class="font-bold text-purple-700">$0.00</span>
                        </div>
                      </div>

                      <!-- Total and Progress -->
                      <div class="space-y-3">
                        <div class="p-4 bg-green-100 rounded-lg border-2 border-green-300">
                          <div class="text-center">
                            <div class="text-sm font-medium text-green-700 mb-1">Total Project Cost</div>
                            <div id="calc-total-cost" class="text-2xl font-bold text-green-900">$0.00</div>
                          </div>
                        </div>

                        <div class="p-3 bg-white rounded border">
                          <div class="text-xs font-medium text-gray-600 mb-2">Cost Allocation Progress</div>
                          <div class="space-y-2">
                            <div class="flex justify-between text-xs">
                              <span>Contractors</span>
                              <span id="contractor-percentage">0%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                              <div id="contractor-progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>

                            <div class="flex justify-between text-xs">
                              <span>Payment Items</span>
                              <span id="payment-percentage">0%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                              <div id="payment-progress-bar" class="bg-orange-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>

                            <div class="flex justify-between text-xs">
                              <span>Line Items</span>
                              <span id="line-items-percentage">0%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                              <div id="line-items-progress-bar" class="bg-purple-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                          </div>
                        </div>

                        <div id="cost-warnings" class="space-y-1">
                          <!-- Cost warnings will appear here -->
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Mobile-optimized action buttons -->
                  <div class="sticky bottom-0 bg-white pt-4 pb-2 -mx-3 sm:-mx-6 px-3 sm:px-6 border-t mt-6">
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end">
                      <button id="cancel-work-order-btn" type="button" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-200 rounded text-sm font-medium touch-manipulation">
                        Cancel
                      </button>
                      <button id="create-work-order-btn" type="button" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-500 text-white rounded text-sm font-medium touch-manipulation">
                        Create Enhanced Work Order
                      </button>
                    </div>
                  </div>
                </form>
              `;

              modalContainer.appendChild(modalContent);
              document.body.appendChild(modalContainer);

              // Multi-contractor functionality
              let contractorCount = 0;
              const contractors = [];

              function addContractor() {
                contractorCount++;
                const contractorDiv = document.createElement("div");
                contractorDiv.className =
                  "p-4 border-2 border-blue-200 rounded-lg bg-blue-50 shadow-sm";
                contractorDiv.id = `contractor-${contractorCount}`;

                contractorDiv.innerHTML = `
                  <div class="flex justify-between items-center mb-3">
                    <h4 class="text-sm sm:text-base font-semibold text-blue-900">Contractor #${contractorCount}</h4>
                    <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Assignment ${contractorCount}</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label class="block text-xs font-medium mb-1">Contractor</label>
                      <select class="contractor-select w-full p-2 text-sm border rounded" data-id="${contractorCount}">
                        <option value="">Select contractor</option>
                        <option value="1">ABC Construction</option>
                        <option value="2">XYZ Electrical</option>
                        <option value="3">DEF Plumbing</option>
                        <option value="4">QRS Roofing</option>
                        <option value="5">TUV Painting</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1">Allocation %</label>
                      <input type="number" class="allocation-input w-full p-2 text-sm border rounded"
                             data-id="${contractorCount}" min="0" max="100" step="0.01" placeholder="0.00">
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1">Role Description</label>
                      <input type="text" class="role-input w-full p-2 text-sm border rounded"
                             data-id="${contractorCount}" placeholder="e.g., Electrical work">
                    </div>
                    <div class="flex flex-col items-end space-y-2">
                      <button type="button" class="approve-contractor w-full px-2 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                              data-id="${contractorCount}">Approve</button>
                      <button type="button" class="remove-contractor w-full px-2 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                              data-id="${contractorCount}">Remove</button>
                    </div>
                  </div>
                `;

                document
                  .getElementById("contractors-container")
                  .appendChild(contractorDiv);
                updateContractorCount();
                updateAllocationSummary();

                // Add event listeners for this contractor
                contractorDiv
                  .querySelector(".allocation-input")
                  .addEventListener("input", updateAllocationSummary);

                const approveButton = contractorDiv.querySelector(
                  ".approve-contractor"
                );
                console.log("🔥 Found approve button:", approveButton);

                if (approveButton) {
                  approveButton.addEventListener("click", function () {
                    console.log(
                      "🔥 Approve button clicked! ID:",
                      this.dataset.id
                    );
                    approveContractor(this.dataset.id);
                  });
                } else {
                  console.error("❌ Approve button not found!");
                }
                contractorDiv
                  .querySelector(".remove-contractor")
                  .addEventListener("click", function () {
                    removeContractor(this.dataset.id);
                  });
              }

              function removeContractor(id) {
                const contractorDiv = document.getElementById(
                  `contractor-${id}`
                );
                if (contractorDiv) {
                  contractorDiv.remove();
                  updateContractorCount();
                  updateAllocationSummary();
                }
              }

              function approveContractor(id) {
                console.log("🔥 approveContractor called with ID:", id);
                const contractorDiv = document.getElementById(
                  `contractor-${id}`
                );
                console.log("🔥 Found contractorDiv:", contractorDiv);
                if (contractorDiv) {
                  // Get contractor details
                  const contractorSelect = contractorDiv.querySelector(
                    ".contractor-select"
                  ) as HTMLSelectElement;
                  const allocationInput = contractorDiv.querySelector(
                    ".allocation-input"
                  ) as HTMLInputElement;
                  const roleInput = contractorDiv.querySelector(
                    ".role-input"
                  ) as HTMLInputElement;
                  const approveButton = contractorDiv.querySelector(
                    ".approve-contractor"
                  ) as HTMLButtonElement;

                  console.log("🔥 Found elements:", {
                    contractorSelect,
                    allocationInput,
                    roleInput,
                    approveButton,
                  });

                  const contractorName =
                    contractorSelect?.options[contractorSelect.selectedIndex]
                      ?.text || "Unknown";
                  const allocation = allocationInput?.value || "0";
                  const role = roleInput?.value || "No role specified";

                  console.log("🔥 Contractor details:", {
                    contractorName,
                    allocation,
                    role,
                  });

                  // Update button to show approved state
                  if (approveButton) {
                    approveButton.textContent = "✓ Approved";
                    approveButton.className =
                      "approve-contractor w-full px-2 py-2 bg-blue-500 text-white text-sm rounded cursor-not-allowed";
                    approveButton.disabled = true;
                  }

                  // Add visual indicator to the contractor div
                  contractorDiv.style.border = "2px solid #10b981";
                  contractorDiv.style.backgroundColor = "#f0fdf4";

                  // Update the allocation summary and overall total immediately
                  updateAllocationSummary();
                  updateOverallTotal();

                  // Show approval notification
                  console.log(
                    `✅ Contractor approved: ${contractorName} (${allocation}% - ${role})`
                  );

                  // Show confirmation alert
                  alert(
                    `✅ Contractor "${contractorName}" has been approved!\n\nAllocation: ${allocation}%\nRole: ${role}`
                  );
                }
              }

              function updateContractorCount() {
                const contractorDivs = document.querySelectorAll(
                  '[id^="contractor-"]'
                );
                const count = contractorDivs.length;
                document.getElementById(
                  "contractor-count"
                ).textContent = `(${count})`;
              }

              function updateAllocationSummary() {
                const allocationInputs =
                  document.querySelectorAll(".allocation-input");
                let totalAllocation = 0;

                allocationInputs.forEach((input) => {
                  const value = parseFloat(input.value) || 0;
                  totalAllocation += value;
                });

                const summaryDiv =
                  document.getElementById("allocation-summary");
                const summaryText = document.getElementById("allocation-text");

                if (allocationInputs.length > 0) {
                  summaryDiv.style.display = "block";
                  summaryText.textContent = `Total Allocation: ${totalAllocation.toFixed(
                    2
                  )}%`;

                  if (Math.abs(totalAllocation - 100) < 0.01) {
                    summaryDiv.className =
                      "mt-2 p-2 rounded text-sm bg-green-100 text-green-800";
                    summaryText.textContent += " ✓ Perfect!";
                  } else {
                    summaryDiv.className =
                      "mt-2 p-2 rounded text-sm bg-yellow-100 text-yellow-800";
                    summaryText.textContent += ` (Must total 100%)`;
                  }
                } else {
                  summaryDiv.style.display = "none";
                }
              }

              // Payment Item Selection functionality
              const selectedPaymentItems = [];
              const mockPaymentItems = [
                {
                  id: 1,
                  name: "Electrical Outlets",
                  cost: 25.0,
                  location: "bedroom1",
                  category: "materials",
                },
                {
                  id: 2,
                  name: "Light Fixtures",
                  cost: 150.0,
                  location: "bedroom1",
                  category: "materials",
                },
                {
                  id: 3,
                  name: "Plumbing Installation",
                  cost: 300.0,
                  location: "bathroom",
                  category: "labor",
                },
                {
                  id: 4,
                  name: "Kitchen Cabinets",
                  cost: 2500.0,
                  location: "kitchen",
                  category: "materials",
                },
                {
                  id: 5,
                  name: "Flooring Installation",
                  cost: 800.0,
                  location: "living",
                  category: "labor",
                },
                {
                  id: 6,
                  name: "Paint Supplies",
                  cost: 120.0,
                  location: "bedroom2",
                  category: "materials",
                },
                {
                  id: 7,
                  name: "HVAC Work",
                  cost: 1200.0,
                  location: "living",
                  category: "subcontractor",
                },
                {
                  id: 8,
                  name: "Tile Installation",
                  cost: 450.0,
                  location: "bathroom",
                  category: "labor",
                },
              ];

              function populatePaymentItems() {
                const searchTerm =
                  document
                    .getElementById("payment-item-search")
                    ?.value.toLowerCase() || "";
                const locationFilter =
                  document.getElementById("payment-item-location-filter")
                    ?.value || "";
                const categoryFilter =
                  document.getElementById("payment-item-category-filter")
                    ?.value || "";

                const filteredItems = mockPaymentItems.filter((item) => {
                  const matchesSearch = item.name
                    .toLowerCase()
                    .includes(searchTerm);
                  const matchesLocation =
                    !locationFilter || item.location === locationFilter;
                  const matchesCategory =
                    !categoryFilter || item.category === categoryFilter;
                  return matchesSearch && matchesLocation && matchesCategory;
                });

                const paymentItemsList =
                  document.getElementById("payment-items-list");
                paymentItemsList.innerHTML = "";

                if (filteredItems.length === 0) {
                  paymentItemsList.innerHTML =
                    '<div class="text-gray-500 text-center py-4">No payment items found</div>';
                  return;
                }

                filteredItems.forEach((item) => {
                  const isSelected = selectedPaymentItems.some(
                    (selected) => selected.id === item.id
                  );
                  const itemDiv = document.createElement("div");
                  itemDiv.className = `p-2 border rounded mb-2 cursor-pointer hover:bg-orange-50 ${
                    isSelected
                      ? "bg-orange-100 border-orange-300"
                      : "bg-white border-gray-200"
                  }`;

                  itemDiv.innerHTML = `
                    <div class="flex justify-between items-center">
                      <div class="flex-1">
                        <div class="font-medium text-sm">${item.name}</div>
                        <div class="text-xs text-gray-600">
                          ${item.location
                            .replace(/([a-z])([0-9])/g, "$1 $2")
                            .replace(/^./, (str) => str.toUpperCase())} •
                          ${
                            item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)
                          }
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-bold text-orange-900">$${item.cost.toFixed(
                          2
                        )}</div>
                        <div class="text-xs ${
                          isSelected ? "text-orange-600" : "text-gray-500"
                        }">
                          ${isSelected ? "✓ Selected" : "Click to select"}
                        </div>
                      </div>
                    </div>
                  `;

                  itemDiv.addEventListener("click", () =>
                    togglePaymentItem(item)
                  );
                  paymentItemsList.appendChild(itemDiv);
                });
              }

              function togglePaymentItem(item) {
                const existingIndex = selectedPaymentItems.findIndex(
                  (selected) => selected.id === item.id
                );

                if (existingIndex >= 0) {
                  // Remove item
                  selectedPaymentItems.splice(existingIndex, 1);
                } else {
                  // Add item
                  selectedPaymentItems.push(item);
                }

                updatePaymentItemsDisplay();
                populatePaymentItems(); // Refresh the list to update selection state
              }

              function updatePaymentItemsDisplay() {
                const countSpan = document.getElementById(
                  "selected-payment-items-count"
                );
                const summaryDiv = document.getElementById(
                  "selected-payment-items-summary"
                );
                const totalSpan = document.getElementById(
                  "payment-items-total"
                );
                const listDiv = document.getElementById(
                  "selected-payment-items-list"
                );

                countSpan.textContent = `${selectedPaymentItems.length} selected`;

                if (selectedPaymentItems.length > 0) {
                  summaryDiv.style.display = "block";

                  const total = selectedPaymentItems.reduce(
                    (sum, item) => sum + item.cost,
                    0
                  );
                  totalSpan.textContent = `$${total.toFixed(2)}`;

                  listDiv.innerHTML = selectedPaymentItems
                    .map(
                      (item) => `
                    <div class="flex justify-between items-center text-xs">
                      <span>${item.name}</span>
                      <span class="font-medium">$${item.cost.toFixed(2)}</span>
                    </div>
                  `
                    )
                    .join("");
                } else {
                  summaryDiv.style.display = "none";
                }

                // Update overall total calculation
                updateOverallTotal();
              }

              // Initialize payment items
              populatePaymentItems();

              // Add event listeners for payment item filters
              document
                .getElementById("payment-item-search")
                .addEventListener("input", populatePaymentItems);
              document
                .getElementById("payment-item-location-filter")
                .addEventListener("change", populatePaymentItems);
              document
                .getElementById("payment-item-category-filter")
                .addEventListener("change", populatePaymentItems);

              // Line Item Management functionality
              let lineItemCount = 0;
              const lineItems = [];

              function addLineItem() {
                lineItemCount++;
                const lineItemDiv = document.createElement("div");
                lineItemDiv.className =
                  "p-4 border-2 border-purple-200 rounded-lg bg-purple-50 shadow-sm";
                lineItemDiv.id = `line-item-${lineItemCount}`;

                lineItemDiv.innerHTML = `
                  <div class="flex justify-between items-center mb-3">
                    <h4 class="text-sm sm:text-base font-semibold text-purple-900">Line Item #${lineItemCount}</h4>
                    <span class="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">Item ${lineItemCount}</span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div class="md:col-span-2">
                      <label class="block text-xs font-medium mb-1">Description</label>
                      <input type="text" class="line-item-description w-full p-2 text-sm border rounded"
                             data-id="${lineItemCount}" placeholder="e.g., Electrical outlets">
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1">Quantity</label>
                      <input type="number" class="line-item-quantity w-full p-2 text-sm border rounded"
                             data-id="${lineItemCount}" min="1" step="1" value="1">
                    </div>
                    <div>
                      <label class="block text-xs font-medium mb-1">Unit Cost ($)</label>
                      <input type="number" class="line-item-cost w-full p-2 text-sm border rounded"
                             data-id="${lineItemCount}" min="0" step="0.01" placeholder="0.00">
                    </div>
                    <div class="flex flex-col">
                      <label class="block text-xs font-medium mb-1">Total</label>
                      <div class="flex items-center justify-between h-[34px]">
                        <span class="line-item-total font-medium text-purple-900" data-id="${lineItemCount}">$0.00</span>
                        <button type="button" class="remove-line-item px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                data-id="${lineItemCount}">Remove</button>
                      </div>
                    </div>
                  </div>
                `;

                document
                  .getElementById("line-items-container")
                  .appendChild(lineItemDiv);
                updateLineItemsTotal();

                // Add event listeners for this line item
                lineItemDiv
                  .querySelector(".line-item-quantity")
                  .addEventListener("input", updateLineItemsTotal);
                lineItemDiv
                  .querySelector(".line-item-cost")
                  .addEventListener("input", updateLineItemsTotal);
                lineItemDiv
                  .querySelector(".remove-line-item")
                  .addEventListener("click", function () {
                    removeLineItem(this.dataset.id);
                  });
              }

              function removeLineItem(id) {
                const lineItemDiv = document.getElementById(`line-item-${id}`);
                if (lineItemDiv) {
                  lineItemDiv.remove();
                  updateLineItemsTotal();
                }
              }

              function updateLineItemsTotal() {
                const quantityInputs = document.querySelectorAll(
                  ".line-item-quantity"
                );
                const costInputs = document.querySelectorAll(".line-item-cost");
                const totalSpans =
                  document.querySelectorAll(".line-item-total");
                let grandTotal = 0;

                // Update individual line item totals
                quantityInputs.forEach((quantityInput, index) => {
                  const quantity = parseFloat(quantityInput.value) || 0;
                  const cost = parseFloat(costInputs[index]?.value) || 0;
                  const total = quantity * cost;

                  if (totalSpans[index]) {
                    totalSpans[index].textContent = `$${total.toFixed(2)}`;
                  }

                  grandTotal += total;
                });

                // Update summary
                const summaryDiv =
                  document.getElementById("line-items-summary");
                const totalSpan = document.getElementById("line-items-total");

                if (quantityInputs.length > 0) {
                  summaryDiv.style.display = "block";
                  totalSpan.textContent = `$${grandTotal.toFixed(2)}`;
                } else {
                  summaryDiv.style.display = "none";
                }

                // Update overall total calculation
                updateOverallTotal();
              }

              function updateOverallTotal() {
                const baseCost =
                  parseFloat(document.getElementById("cost-input")?.value) || 0;
                const lineItemsTotal = parseFloat(
                  document
                    .getElementById("line-items-total")
                    ?.textContent.replace("$", "") || "0"
                );
                const paymentItemsTotal = parseFloat(
                  document
                    .getElementById("payment-items-total")
                    ?.textContent.replace("$", "") || "0"
                );

                // Calculate contractor allocations (using allocation percentages)
                const allocationInputs =
                  document.querySelectorAll(".allocation-input");
                let contractorTotal = 0;
                allocationInputs.forEach((input) => {
                  const allocation = parseFloat(input.value) || 0;
                  // For now, we'll just use the allocation percentage as a simple indicator
                  // In a real app, you'd calculate based on the total project cost
                  contractorTotal += allocation;
                });

                const overallTotal =
                  baseCost + lineItemsTotal + paymentItemsTotal;

                // Update detailed cost breakdown
                document.getElementById(
                  "calc-base-cost"
                ).textContent = `$${baseCost.toFixed(2)}`;
                document.getElementById(
                  "calc-contractor-cost"
                ).textContent = `$${contractorTotal.toFixed(2)}`;
                document.getElementById(
                  "calc-payment-items-cost"
                ).textContent = `$${paymentItemsTotal.toFixed(2)}`;
                document.getElementById(
                  "calc-line-items-cost"
                ).textContent = `$${lineItemsTotal.toFixed(2)}`;
                document.getElementById(
                  "calc-total-cost"
                ).textContent = `$${overallTotal.toFixed(2)}`;

                // Update progress bars and percentages
                if (overallTotal > 0) {
                  const contractorPercentage =
                    (contractorTotal / overallTotal) * 100;
                  const paymentPercentage =
                    (paymentItemsTotal / overallTotal) * 100;
                  const lineItemsPercentage =
                    (lineItemsTotal / overallTotal) * 100;

                  document.getElementById(
                    "contractor-percentage"
                  ).textContent = `${contractorPercentage.toFixed(1)}%`;
                  document.getElementById(
                    "payment-percentage"
                  ).textContent = `${paymentPercentage.toFixed(1)}%`;
                  document.getElementById(
                    "line-items-percentage"
                  ).textContent = `${lineItemsPercentage.toFixed(1)}%`;

                  document.getElementById(
                    "contractor-progress-bar"
                  ).style.width = `${contractorPercentage}%`;
                  document.getElementById(
                    "payment-progress-bar"
                  ).style.width = `${paymentPercentage}%`;
                  document.getElementById(
                    "line-items-progress-bar"
                  ).style.width = `${lineItemsPercentage}%`;
                } else {
                  // Reset progress bars
                  document.getElementById("contractor-percentage").textContent =
                    "0%";
                  document.getElementById("payment-percentage").textContent =
                    "0%";
                  document.getElementById("line-items-percentage").textContent =
                    "0%";

                  document.getElementById(
                    "contractor-progress-bar"
                  ).style.width = "0%";
                  document.getElementById("payment-progress-bar").style.width =
                    "0%";
                  document.getElementById(
                    "line-items-progress-bar"
                  ).style.width = "0%";
                }

                // Update cost warnings
                updateCostWarnings(baseCost, contractorTotal, overallTotal);

                // Update button text with total
                const createButton = document.getElementById(
                  "create-work-order-btn"
                );
                createButton.textContent = `Create Enhanced Work Order ($${overallTotal.toFixed(
                  2
                )})`;
              }

              function updateCostWarnings(
                baseCost,
                contractorTotal,
                overallTotal
              ) {
                const warningsDiv = document.getElementById("cost-warnings");
                warningsDiv.innerHTML = "";

                // Check for over-allocation
                if (contractorTotal > overallTotal) {
                  const overAllocation = contractorTotal - overallTotal;
                  warningsDiv.innerHTML += `
                    <div class="p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700">
                      ⚠️ Over-allocated by $${overAllocation.toFixed(
                        2
                      )}! Contractor costs exceed total budget.
                    </div>
                  `;
                }

                // Check for under-allocation
                if (
                  contractorTotal > 0 &&
                  contractorTotal < overallTotal * 0.5
                ) {
                  warningsDiv.innerHTML += `
                    <div class="p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-700">
                      💡 Consider allocating more budget to contractors (currently ${(
                        (contractorTotal / overallTotal) *
                        100
                      ).toFixed(1)}% of total).
                    </div>
                  `;
                }

                // Check for high total cost
                if (overallTotal > 50000) {
                  warningsDiv.innerHTML += `
                    <div class="p-2 bg-blue-100 border border-blue-300 rounded text-xs text-blue-700">
                      📊 High-value project ($${overallTotal.toFixed(
                        2
                      )}). Consider additional approval workflows.
                    </div>
                  `;
                }

                // Show positive feedback for balanced allocation
                if (
                  contractorTotal > 0 &&
                  contractorTotal <= overallTotal &&
                  contractorTotal >= overallTotal * 0.3
                ) {
                  warningsDiv.innerHTML += `
                    <div class="p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                      ✅ Well-balanced cost allocation across all categories.
                    </div>
                  `;
                }
              }

              // Add event listeners
              document
                .getElementById("add-line-item-btn")
                .addEventListener("click", addLineItem);
              document
                .getElementById("cost-input")
                .addEventListener("input", updateOverallTotal);

              document
                .getElementById("add-contractor-btn")
                .addEventListener("click", addContractor);

              // Mobile close button
              document
                .getElementById("mobile-close-btn")
                ?.addEventListener("click", () => {
                  document.body.removeChild(modalContainer);
                });

              document
                .getElementById("cancel-work-order-btn")
                ?.addEventListener("click", () => {
                  document.body.removeChild(modalContainer);
                });

              document
                .getElementById("create-work-order-btn")
                ?.addEventListener("click", () => {
                  // Collect basic form data
                  const projectId = (
                    document.getElementById(
                      "project-select"
                    ) as HTMLSelectElement
                  )?.value;
                  const description = (
                    document.getElementById(
                      "description-input"
                    ) as HTMLTextAreaElement
                  )?.value;
                  const status = (
                    document.getElementById(
                      "status-select"
                    ) as HTMLSelectElement
                  )?.value;
                  const cost = (
                    document.getElementById("cost-input") as HTMLInputElement
                  )?.value;

                  // Collect enhanced form data
                  const location = (
                    document.getElementById(
                      "location-select"
                    ) as HTMLSelectElement
                  )?.value;
                  const category = (
                    document.getElementById(
                      "category-select"
                    ) as HTMLSelectElement
                  )?.value;
                  const priority = (
                    document.getElementById(
                      "priority-select"
                    ) as HTMLSelectElement
                  )?.value;

                  if (!projectId || !description) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  // Collect contractor assignments
                  const contractorAssignments: any[] = [];
                  document
                    .querySelectorAll('[id^="contractor-assignment-"]')
                    .forEach((contractorDiv) => {
                      const contractorSelect = contractorDiv.querySelector(
                        ".contractor-select"
                      ) as HTMLSelectElement;
                      const roleSelect = contractorDiv.querySelector(
                        ".contractor-role"
                      ) as HTMLSelectElement;
                      const allocatedCost = contractorDiv.querySelector(
                        ".contractor-cost"
                      ) as HTMLInputElement;

                      if (contractorSelect?.value && roleSelect?.value) {
                        contractorAssignments.push({
                          contractor: contractorSelect.value,
                          role: roleSelect.value,
                          allocatedCost: parseFloat(allocatedCost?.value) || 0,
                          status: "Assigned",
                        });
                      }
                    });

                  // Collect line items
                  const customLineItems: any[] = [];
                  document
                    .querySelectorAll('[id^="line-item-"]')
                    .forEach((lineItemDiv) => {
                      const descriptionInput = lineItemDiv.querySelector(
                        ".line-item-description"
                      ) as HTMLInputElement;
                      const quantityInput = lineItemDiv.querySelector(
                        ".line-item-quantity"
                      ) as HTMLInputElement;
                      const costInput = lineItemDiv.querySelector(
                        ".line-item-cost"
                      ) as HTMLInputElement;

                      if (
                        descriptionInput?.value &&
                        quantityInput?.value &&
                        costInput?.value
                      ) {
                        customLineItems.push({
                          description: descriptionInput.value,
                          quantity: parseInt(quantityInput.value),
                          unitCost: parseFloat(costInput.value),
                          total:
                            parseInt(quantityInput.value) *
                            parseFloat(costInput.value),
                        });
                      }
                    });

                  // Calculate totals
                  const baseCost = parseFloat(cost) || 0;
                  const lineItemsTotal = customLineItems.reduce(
                    (sum, item) => sum + item.total,
                    0
                  );
                  const paymentItemsTotal = selectedPaymentItems.reduce(
                    (sum, item) => sum + item.cost,
                    0
                  );
                  const totalCost =
                    baseCost + lineItemsTotal + paymentItemsTotal;

                  // Prepare enhanced work order data
                  const enhancedWorkOrderData = {
                    project_id: Number(projectId),
                    description,
                    status,
                    estimated_cost: totalCost,

                    // Enhanced fields (stored as JSON in notes or custom fields)
                    enhanced_data: {
                      location: location || "Not specified",
                      category: category || "General",
                      priority: priority || "normal",
                      contractorAssignments: contractorAssignments,
                      customLineItems: customLineItems,
                      selectedPaymentItems: [...selectedPaymentItems],
                      costBreakdown: {
                        baseCost: baseCost,
                        lineItemsTotal: lineItemsTotal,
                        paymentItemsTotal: paymentItemsTotal,
                        totalCost: totalCost,
                      },
                    },
                  };

                  console.log(
                    "Creating enhanced work order with data:",
                    enhancedWorkOrderData
                  );

                  // Show success message with details
                  const contractorCount = contractorAssignments.length;
                  const lineItemCount = customLineItems.length;
                  const paymentItemCount = selectedPaymentItems.length;

                  alert(`Enhanced Work Order Created Successfully!

Description: ${description}
Project ID: ${projectId}
Total Cost: $${totalCost.toFixed(2)}

Enhanced Features:
• ${contractorCount} contractor(s) assigned
• ${lineItemCount} custom line item(s)
• ${paymentItemCount} payment item(s) selected
• Location: ${location || "Not specified"}
• Category: ${category || "General"}
• Priority: ${priority || "normal"}

Cost Breakdown:
• Base Cost: $${baseCost.toFixed(2)}
• Line Items: $${lineItemsTotal.toFixed(2)}
• Payment Items: $${paymentItemsTotal.toFixed(2)}
• Total: $${totalCost.toFixed(2)}`);

                  // For now, send the basic data that the API expects
                  // TODO: Update API to handle enhanced data
                  const workOrderData = {
                    project_id: projectId,
                    description,
                    status,
                    estimated_cost: totalCost,
                  };

                  createMutation.mutate(workOrderData as WorkOrderData);
                  document.body.removeChild(modalContainer);
                });
            }}
            className="flex items-center justify-center"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Enhanced Work Order
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowStatusManagement(!showStatusManagement)}
            className="col-span-2 mt-2 sm:mt-0 flex items-center justify-center"
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
              <div className="flex flex-col justify-between items-center">
                <div className="w-full text-center mb-4">
                  <CardTitle className="text-2xl font-bold">
                    Work Order Status Management
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Track and manage work order status and completion
                  </CardDescription>
                </div>

                {/* iPhone 16 Pro Max optimized button layout */}
                <div className="w-full flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex-1 min-w-[80px] flex items-center justify-center px-2"
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterDialogOpen(true)}
                    className="flex-1 min-w-[80px] flex items-center justify-center px-2"
                  >
                    <Filter className="mr-1 h-4 w-4" />
                    Filter
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[80px] flex items-center justify-center px-2"
                      >
                        <Download className="mr-1 h-4 w-4" />
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
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    className="flex-1 min-w-[120px] flex items-center justify-center px-2"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4 text-center">
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

                {/* iPhone 16 Pro Max Optimized Card View */}
                <div className="md:hidden space-y-3">
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
                      <Card
                        key={wo.work_order_id}
                        className="overflow-hidden border-2 shadow-sm"
                      >
                        <CardHeader className="p-3 pb-2 border-b">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-bold">
                              Work Order #{wo.work_order_id}
                            </CardTitle>
                            <Badge
                              variant={
                                percentComplete === 100 ? "default" : "outline"
                              }
                              className="ml-2 px-3 py-1 text-xs font-semibold"
                            >
                              {percentComplete}% Complete
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="text-xs uppercase font-semibold text-muted-foreground">
                                SWO Total
                              </div>
                              <div className="text-base font-bold mt-1">
                                {formatCurrency(estimatedCost)}
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="text-xs uppercase font-semibold text-muted-foreground">
                                W.O. Amount
                              </div>
                              <div className="text-base font-bold mt-1">
                                {formatCurrency(actualCost)}
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="text-xs uppercase font-semibold text-muted-foreground">
                                Retainage Amount
                              </div>
                              <div className="text-base font-bold mt-1">
                                {formatCurrency(retainageAmount)}
                              </div>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md">
                              <div className="text-xs uppercase font-semibold text-muted-foreground">
                                Amount Due
                              </div>
                              <div className="text-base font-bold mt-1">
                                {formatCurrency(amountBilled - amountPaid)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Summary Cards - iPhone 16 Pro Max Optimized */}
              <div className="grid grid-cols-1 gap-5 mt-2">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-lg text-center font-bold">
                      Status Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <StatusSummary />
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-lg text-center font-bold">
                      Retainage Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <RetainageSummary />
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-lg text-center font-bold">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
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
                    <DropdownMenuItem onClick={handleBatchStatusDialogOpen}>
                      Update Status
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
                  <Button
                    className="mt-4"
                    type="button"
                    onClick={() => {
                      console.log(
                        "Empty state Create Work Order button clicked"
                      );

                      // Create a modal dialog directly in the DOM
                      const modalContainer = document.createElement("div");
                      modalContainer.className =
                        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                      modalContainer.id = "empty-work-order-modal";

                      const modalContent = document.createElement("div");
                      modalContent.className =
                        "bg-white p-6 rounded-lg shadow-lg max-w-md w-full";
                      modalContent.innerHTML = `
                        <h2 class="text-xl font-bold mb-4">Create Work Order</h2>
                        <form id="empty-work-order-form">
                          <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Project</label>
                            <select id="empty-project-select" class="w-full p-2 border rounded">
                              <option value="">Select a project</option>
                              ${projects
                                ?.map(
                                  (p) =>
                                    `<option value="${p.project_id}">${p.project_name}</option>`
                                )
                                .join("")}
                            </select>
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Description</label>
                            <textarea id="empty-description-input" class="w-full p-2 border rounded" rows="3"></textarea>
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Status</label>
                            <select id="empty-status-select" class="w-full p-2 border rounded">
                              <option value="Pending">Pending</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Progress">In Progress</option>
                              <option value="On Hold">On Hold</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium mb-1">Estimated Cost ($)</label>
                            <input id="empty-cost-input" type="number" class="w-full p-2 border rounded" />
                          </div>
                          <div class="flex justify-end mt-6">
                            <button id="empty-cancel-btn" type="button" class="px-4 py-2 bg-gray-200 rounded mr-2">Cancel</button>
                            <button id="empty-create-btn" type="button" class="px-4 py-2 bg-blue-500 text-white rounded">Create Work Order</button>
                          </div>
                        </form>
                      `;

                      modalContainer.appendChild(modalContent);
                      document.body.appendChild(modalContainer);

                      // Add event listeners
                      document
                        .getElementById("empty-cancel-btn")
                        ?.addEventListener("click", () => {
                          document.body.removeChild(modalContainer);
                        });

                      document
                        .getElementById("empty-create-btn")
                        ?.addEventListener("click", () => {
                          const projectId = (
                            document.getElementById(
                              "empty-project-select"
                            ) as HTMLSelectElement
                          )?.value;
                          const description = (
                            document.getElementById(
                              "empty-description-input"
                            ) as HTMLTextAreaElement
                          )?.value;
                          const status = (
                            document.getElementById(
                              "empty-status-select"
                            ) as HTMLSelectElement
                          )?.value;
                          const cost = (
                            document.getElementById(
                              "empty-cost-input"
                            ) as HTMLInputElement
                          )?.value;

                          if (!projectId || !description) {
                            alert("Please fill in all required fields");
                            return;
                          }

                          const workOrderData = {
                            project_id: projectId,
                            description,
                            status,
                            estimated_cost: cost ? Number(cost) : null,
                          };

                          console.log(
                            "Creating work order with data:",
                            workOrderData
                          );
                          createMutation.mutate(workOrderData as WorkOrderData);
                          document.body.removeChild(modalContainer);
                        });
                    }}
                  >
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
                                {/* Enhanced Contractor Assignments */}
                                {wo.contractor_assignments &&
                                  wo.contractor_assignments.length > 0 && (
                                    <div className="md:col-span-3 mb-4">
                                      <h4 className="font-medium mb-2 text-blue-900">
                                        🔧 Enhanced Multi-Contractor Assignments
                                        ({wo.contractor_assignments.length})
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {wo.contractor_assignments.map(
                                          (assignment: any, index: number) => (
                                            <div
                                              key={index}
                                              className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                            >
                                              <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                  <span className="font-medium text-blue-900">
                                                    Contractor #{index + 1}
                                                  </span>
                                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                    {
                                                      assignment.allocation_percentage
                                                    }
                                                    %
                                                  </span>
                                                </div>
                                                <div className="text-gray-700">
                                                  <div className="font-medium">
                                                    {getSubcontractorName(
                                                      assignment.subcontractor_id
                                                    ) ||
                                                      `Contractor ID: ${assignment.subcontractor_id}`}
                                                  </div>
                                                  {assignment.role_description && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                      Role:{" "}
                                                      {
                                                        assignment.role_description
                                                      }
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                      <div className="mt-2 text-sm text-blue-700">
                                        Total Allocation:{" "}
                                        {wo.contractor_assignments.reduce(
                                          (sum: number, assignment: any) =>
                                            sum +
                                            (assignment.allocation_percentage ||
                                              0),
                                          0
                                        )}
                                        %
                                      </div>
                                    </div>
                                  )}

                                {/* Enhanced Fields Display */}
                                {(wo.location ||
                                  wo.category ||
                                  wo.priority) && (
                                  <div className="md:col-span-3 mb-4">
                                    <h4 className="font-medium mb-2 text-green-900">
                                      ⭐ Enhanced Work Order Features
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      {wo.location && (
                                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                                          <div className="text-xs text-green-600 font-medium">
                                            Location
                                          </div>
                                          <div className="text-sm text-green-900">
                                            {wo.location}
                                          </div>
                                        </div>
                                      )}
                                      {wo.category && (
                                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                                          <div className="text-xs text-green-600 font-medium">
                                            Category
                                          </div>
                                          <div className="text-sm text-green-900">
                                            {wo.category}
                                          </div>
                                        </div>
                                      )}
                                      {wo.priority && (
                                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                                          <div className="text-xs text-green-600 font-medium">
                                            Priority
                                          </div>
                                          <div className="text-sm text-green-900 capitalize">
                                            {wo.priority}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

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
                                          setSelectedWorkOrder(wo);
                                          updateMutation.mutate({
                                            status: value,
                                          });
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
                {/* Mobile selection controls */}
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground">
                    {selectedRows.length > 0 ? (
                      <span>
                        {selectedRows.length} work order
                        {selectedRows.length === 1 ? "" : "s"} selected
                      </span>
                    ) : (
                      <span>Select work orders to update</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedRows.length === filteredWorkOrders.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    {selectedRows.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleBatchStatusDialogOpen}
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
                {filteredWorkOrders.map((wo) => (
                  <Card
                    key={wo.work_order_id}
                    className={`overflow-hidden relative cursor-pointer hover:border-primary ${
                      selectedRows.includes(wo.work_order_id!)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => toggleRowSelection(wo.work_order_id!)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          {/* Add checkbox for mobile selection */}
                          <Checkbox
                            className="mt-1"
                            checked={selectedRows.includes(wo.work_order_id!)}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onCheckedChange={() => {
                              toggleRowSelection(wo.work_order_id!);
                            }}
                          />
                          <div className="flex-1 pr-2">
                            <CardTitle className="text-base font-medium line-clamp-2">
                              {wo.description}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {getProjectName(wo.project_id)}
                            </CardDescription>
                          </div>
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
                    <CardFooter className="p-4 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkOrder(wo);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewInvoice(wo);
                          }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(wo);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-bold mb-4 text-blue-700 bg-blue-100 p-2 rounded">
                  PURCHASE ORDERS SECTION
                </h3>
                {selectedWorkOrder.work_order_id && (
                  <PurchaseOrderSection
                    workOrderId={selectedWorkOrder.work_order_id}
                  />
                )}
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

      {/* Enhanced Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detailed Invoice</DialogTitle>
            <DialogDescription>
              Comprehensive invoice with payment items breakdown by location
            </DialogDescription>
          </DialogHeader>

          {selectedWorkOrder && (
            <div className="py-4">
              <div className="border rounded-md overflow-hidden">
                {/* Invoice Header */}
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

                {/* Subcontractor Information */}
                <div className="bg-blue-50 border-b p-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">
                        Subcontractor Company:
                        <span className="bg-blue-200 px-2 py-1 rounded ml-2">
                          {getSubcontractorName(
                            selectedWorkOrder.assigned_subcontractor_id
                          ) || "Fairfield"}
                        </span>
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            Work Order ID Number:
                          </span>
                          <span className="bg-blue-200 px-2 py-1 rounded">
                            {selectedWorkOrder.work_order_id || "18083"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">% Complete:</span>
                          <span className="bg-green-200 px-2 py-1 rounded">
                            100%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Full Name:</span>
                          <span>Mattie Allen</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Assigned Date:</span>
                          <span>
                            {selectedWorkOrder.scheduled_date
                              ? new Date(
                                  selectedWorkOrder.scheduled_date
                                ).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">
                            Sub Work Order Status:
                          </span>
                          <span className="bg-green-200 px-2 py-1 rounded">
                            Completed
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Phone:</span>
                          <span>(229) 924-4153</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Full Address:</span>
                          <span>118 Tom Hall Circle Americus GA 31719</span>
                        </div>
                      </div>
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

                {/* Payment Items Section */}
                <div className="p-6">
                  <h4 className="font-medium mb-4 text-center text-lg">
                    Pay Items SUB WORK ORDERs
                  </h4>

                  {paymentItems && paymentItems.length > 0 ? (
                    <div className="space-y-6">
                      {/* Group payment items by location */}
                      {locations && locations.length > 0 ? (
                        locations.map((location) => {
                          const locationItems = paymentItems.filter(
                            (item) => item.location_id === location.location_id
                          );

                          if (locationItems.length === 0) return null;

                          return (
                            <div
                              key={location.location_id}
                              className="border rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-50 px-4 py-2 border-b">
                                <h5 className="font-medium text-gray-900">
                                  {location.name || location.location_name}
                                </h5>
                              </div>

                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-100">
                                    <TableHead className="text-xs">
                                      Pay Items
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Pay Items WO Item
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Location
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      UOM
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Qty
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      SubCon Unit Price
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Subcon Total
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Status
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {locationItems.map((item) => (
                                    <TableRow
                                      key={item.item_id}
                                      className="text-xs"
                                    >
                                      <TableCell className="font-medium">
                                        {item.item_code || item.item_id}
                                      </TableCell>
                                      <TableCell>{item.description}</TableCell>
                                      <TableCell>
                                        {location.name ||
                                          location.location_name}
                                      </TableCell>
                                      <TableCell>
                                        {item.unit_of_measure || "SF"}
                                      </TableCell>
                                      <TableCell>
                                        {item.quantity ||
                                          item.original_quantity}
                                      </TableCell>
                                      <TableCell>
                                        $
                                        {item.unit_price?.toFixed(5) ||
                                          "0.00000"}
                                      </TableCell>
                                      <TableCell>
                                        $
                                        {item.total_price?.toFixed(2) || "0.00"}
                                      </TableCell>
                                      <TableCell>
                                        <span className="bg-green-200 px-2 py-1 rounded text-xs">
                                          Complete
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          );
                        })
                      ) : (
                        // If no locations, show all items in one table
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-100">
                                <TableHead className="text-xs">
                                  Pay Items
                                </TableHead>
                                <TableHead className="text-xs">
                                  Pay Items WO Item
                                </TableHead>
                                <TableHead className="text-xs">
                                  Location
                                </TableHead>
                                <TableHead className="text-xs">UOM</TableHead>
                                <TableHead className="text-xs">Qty</TableHead>
                                <TableHead className="text-xs">
                                  SubCon Unit Price
                                </TableHead>
                                <TableHead className="text-xs">
                                  Subcon Total
                                </TableHead>
                                <TableHead className="text-xs">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paymentItems.map((item) => (
                                <TableRow
                                  key={item.item_id}
                                  className="text-xs"
                                >
                                  <TableCell className="font-medium">
                                    {item.item_code || item.item_id}
                                  </TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell>
                                    {item.location_name || "General"}
                                  </TableCell>
                                  <TableCell>
                                    {item.unit_of_measure || "SF"}
                                  </TableCell>
                                  <TableCell>
                                    {item.quantity || item.original_quantity}
                                  </TableCell>
                                  <TableCell>
                                    ${item.unit_price?.toFixed(5) || "0.00000"}
                                  </TableCell>
                                  <TableCell>
                                    ${item.total_price?.toFixed(2) || "0.00"}
                                  </TableCell>
                                  <TableCell>
                                    <span className="bg-green-200 px-2 py-1 rounded text-xs">
                                      Complete
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show enhanced layout even when no payment items
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h5 className="font-medium text-gray-900">
                          Work Order Summary
                        </h5>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="text-xs">Pay Items</TableHead>
                            <TableHead className="text-xs">
                              Pay Items WO Item
                            </TableHead>
                            <TableHead className="text-xs">Location</TableHead>
                            <TableHead className="text-xs">UOM</TableHead>
                            <TableHead className="text-xs">Qty</TableHead>
                            <TableHead className="text-xs">
                              SubCon Unit Price
                            </TableHead>
                            <TableHead className="text-xs">
                              Subcon Total
                            </TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="text-xs">
                            <TableCell className="font-medium">
                              WO-{selectedWorkOrder.work_order_id}
                            </TableCell>
                            <TableCell>
                              {selectedWorkOrder.description}
                            </TableCell>
                            <TableCell>General</TableCell>
                            <TableCell>lump sum</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell>
                              $
                              {selectedWorkOrder.amount_billed?.toFixed(5) ||
                                selectedWorkOrder.estimated_cost?.toFixed(5) ||
                                "0.00000"}
                            </TableCell>
                            <TableCell>
                              $
                              {selectedWorkOrder.amount_billed?.toFixed(2) ||
                                selectedWorkOrder.estimated_cost?.toFixed(2) ||
                                "0.00"}
                            </TableCell>
                            <TableCell>
                              <span className="bg-blue-200 px-2 py-1 rounded text-xs">
                                {selectedWorkOrder.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div className="p-4 bg-blue-50 border-t">
                        <p className="text-sm text-blue-700">
                          💡 <strong>Note:</strong> No detailed payment items
                          found for this work order. The invoice shows the work
                          order as a lump sum. To see detailed payment items,
                          add them through the Payment Items page.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Calculate totals from payment items */}
                  {(() => {
                    const subtotal =
                      paymentItems?.reduce(
                        (sum, item) => sum + (item.total_price || 0),
                        0
                      ) ||
                      selectedWorkOrder.amount_billed ||
                      selectedWorkOrder.estimated_cost ||
                      0;
                    const tax = Math.round(subtotal * 0.08);
                    const retainage = Math.round(
                      (subtotal *
                        (selectedWorkOrder.retainage_percentage || 0)) /
                        100
                    );
                    const totalDue = Math.round(subtotal + tax - retainage);

                    return (
                      <div className="mt-6 border-t pt-4">
                        <div className="flex justify-end">
                          <div className="w-1/2 space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Subtotal:</span>
                              <span>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Tax (8%):</span>
                              <span>${tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">
                                Retainage (
                                {selectedWorkOrder.retainage_percentage || 0}%):
                              </span>
                              <span>-${retainage.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-lg font-bold">
                              <span>Total Due:</span>
                              <span>${totalDue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          console.log("Create Dialog onOpenChange called with open =", open);
          if (!open) {
            console.log("Closing create dialog");
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Work Order</DialogTitle>
            <DialogDescription>
              Enter the details for the new work order.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Create form submit event triggered");
            }}
          >
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
                <Label
                  htmlFor="assigned_subcontractor_id"
                  className="text-right"
                >
                  Assigned Subcontractor
                </Label>
                <Select
                  value={
                    formik.values.assigned_subcontractor_id?.toString() || ""
                  }
                  onValueChange={(value) =>
                    formik.setFieldValue(
                      "assigned_subcontractor_id",
                      value ? Number(value) : null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a subcontractor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subcontractors?.map((s) => (
                      <SelectItem
                        key={s.subcontractor_id}
                        value={s.subcontractor_id!.toString()}
                      >
                        {s.company_name}
                      </SelectItem>
                    ))}
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={createMutation.isPending}
                onClick={() => {
                  console.log("Create Save button clicked");
                  formik.validateForm().then((errors) => {
                    console.log("Form validation errors:", errors);
                    if (Object.keys(errors).length === 0) {
                      console.log("Form is valid, submitting...");
                      formik.handleSubmit();
                    } else {
                      console.log("Form has validation errors");
                      formik.setTouched(
                        Object.keys(errors).reduce((acc, key) => {
                          acc[key] = true;
                          return acc;
                        }, {} as any)
                      );
                      toast.error("Please fix the form errors before saving");
                    }
                  });
                }}
              >
                {createMutation.isPending ? "Saving..." : "Save Work Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          console.log("Edit Dialog onOpenChange called with open =", open);
          if (!open) {
            console.log("Closing edit dialog");
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Work Order</DialogTitle>
            <DialogDescription>
              Update the work order details below.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Edit form submit event triggered");
            }}
          >
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
                <Label
                  htmlFor="assigned_subcontractor_id"
                  className="text-right"
                >
                  Assigned Subcontractor
                </Label>
                <Select
                  value={
                    formik.values.assigned_subcontractor_id?.toString() || ""
                  }
                  onValueChange={(value) =>
                    formik.setFieldValue(
                      "assigned_subcontractor_id",
                      value ? Number(value) : null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a subcontractor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subcontractors?.map((s) => (
                      <SelectItem
                        key={s.subcontractor_id}
                        value={s.subcontractor_id!.toString()}
                      >
                        {s.company_name}
                      </SelectItem>
                    ))}
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => {
                  console.log("Edit Save button clicked");
                  formik.validateForm().then((errors) => {
                    console.log("Form validation errors:", errors);
                    if (Object.keys(errors).length === 0) {
                      console.log("Form is valid, submitting...");
                      formik.handleSubmit();
                    } else {
                      console.log("Form has validation errors");
                      formik.setTouched(
                        Object.keys(errors).reduce((acc, key) => {
                          acc[key] = true;
                          return acc;
                        }, {} as any)
                      );
                      toast.error("Please fix the form errors before saving");
                    }
                  });
                }}
              >
                {updateMutation.isPending ? "Saving..." : "Save Work Order"}
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              Update Work Order Status
            </DialogTitle>
            <DialogDescription className="text-center">
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <Label className="text-lg">Selected Work Orders</Label>
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
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {selectedWorkOrderIds.length} work order
                      {selectedWorkOrderIds.length === 1 ? "" : "s"} selected
                    </div>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      {selectedWorkOrderIds.map((id) => {
                        const workOrder = filteredWorkOrders?.find(
                          (wo) => wo.work_order_id === id
                        );
                        return workOrder ? (
                          <div
                            key={id}
                            className="flex justify-between items-center py-2 px-1 border-b last:border-0"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
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
                              <span className="text-sm font-medium truncate">
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
                              className="ml-2 whitespace-nowrap"
                            >
                              {workOrder.status}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsBatchStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
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
            <DialogTitle className="text-center">Generate Report</DialogTitle>
            <DialogDescription className="text-center">
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
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsReportDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleGenerateReport}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crew Management Dialog */}
      <Dialog open={isCrewDialogOpen} onOpenChange={setIsCrewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Manage Crew Assignment
            </DialogTitle>
            <DialogDescription className="text-center">
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
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-muted-foreground text-center">
                  This will assign the selected crew to{" "}
                  <span className="font-medium">
                    {selectedWorkOrderIds.length}
                  </span>{" "}
                  work order(s).
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsCrewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleCrewAssignment}>
              Assign Crew
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Filter Work Orders
            </DialogTitle>
            <DialogDescription className="text-center">
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
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setDateRangeFilter({ from: "", to: "" });
                setStatusFilterValue("all");
                setIsFilterDialogOpen(false);
              }}
            >
              Reset
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
