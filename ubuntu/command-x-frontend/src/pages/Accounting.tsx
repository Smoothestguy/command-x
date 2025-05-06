import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  ArrowUpDown,
  Eye,
  BarChart2,
  TrendingUp,
  CreditCard,
  FileCheck,
  Save,
  Calculator,
  Loader2,
} from "lucide-react";
import { getProjects, getWorkOrders, getSubcontractors } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { DateRange } from "react-day-picker";

const Accounting: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("project");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Loading states for financial reporting tools
  const [isGeneratingStatements, setIsGeneratingStatements] = useState(false);
  const [isPreparingTaxDocs, setIsPreparingTaxDocs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch projects data
  const { isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Fetch work orders data
  const { isLoading: workOrdersLoading, error: workOrdersError } = useQuery({
    queryKey: ["workOrders"],
    queryFn: () => getWorkOrders(),
  });

  // Fetch subcontractors data
  const { isLoading: subcontractorsLoading, error: subcontractorsError } =
    useQuery({
      queryKey: ["subcontractors"],
      queryFn: getSubcontractors,
    });

  const isLoading =
    projectsLoading || workOrdersLoading || subcontractorsLoading;
  const hasError = projectsError || workOrdersError || subcontractorsError;

  const handleExportData = () => {
    // Implementation for exporting data
    toast({
      title: "Exporting data",
      description: "Your data is being exported. This may take a moment.",
    });
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Your data has been exported successfully.",
        variant: "default",
      });
    }, 2000);
  };

  const handlePrintReport = () => {
    // Implementation for printing report
    toast({
      title: "Preparing print",
      description: "Your report is being prepared for printing.",
    });
    // Simulate print process
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  // Financial reporting tool handlers
  const handleGenerateFinancialStatements = () => {
    // Set loading state
    setIsGeneratingStatements(true);

    // Show initial toast
    toast({
      title: "Generating financial statements",
      description:
        "Your financial statements are being generated. This may take a moment.",
    });

    // Simulate processing with multiple steps
    setTimeout(() => {
      toast({
        title: "Processing data",
        description: "Analyzing financial transactions...",
        variant: "default",
      });

      setTimeout(() => {
        toast({
          title: "Creating reports",
          description: "Formatting financial statements...",
          variant: "default",
        });

        // Final completion toast
        setTimeout(() => {
          // Reset loading state
          setIsGeneratingStatements(false);

          toast({
            title: "Financial statements generated",
            description:
              "Your financial statements have been generated successfully.",
            action: (
              <ToastAction
                altText="Download"
                onClick={() => {
                  toast({
                    title: "Download started",
                    description:
                      "Your financial statements are being downloaded.",
                    variant: "default",
                  });
                }}
              >
                Download
              </ToastAction>
            ),
            variant: "default",
          });
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handlePrepareTaxDocumentation = () => {
    // Set loading state
    setIsPreparingTaxDocs(true);

    // Show initial toast
    toast({
      title: "Preparing tax documentation",
      description:
        "Your tax documentation is being prepared. This may take a moment.",
    });

    // Simulate processing with multiple steps
    setTimeout(() => {
      toast({
        title: "Collecting tax data",
        description: "Gathering relevant financial information...",
        variant: "default",
      });

      setTimeout(() => {
        toast({
          title: "Calculating tax liabilities",
          description: "Computing tax obligations based on financial data...",
          variant: "default",
        });

        // Final completion toast
        setTimeout(() => {
          // Reset loading state
          setIsPreparingTaxDocs(false);

          toast({
            title: "Tax documentation prepared",
            description:
              "Your tax documentation has been prepared successfully.",
            action: (
              <ToastAction
                altText="Download"
                onClick={() => {
                  toast({
                    title: "Download started",
                    description: "Your tax documentation is being downloaded.",
                    variant: "default",
                  });
                }}
              >
                Download
              </ToastAction>
            ),
            variant: "default",
          });
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleExportToAccounting = () => {
    // Set loading state
    setIsExporting(true);

    // Show initial toast
    toast({
      title: "Exporting to accounting software",
      description: "Your data is being exported. This may take a moment.",
    });

    // Simulate processing with multiple steps
    setTimeout(() => {
      toast({
        title: "Formatting data",
        description: "Converting financial data to compatible format...",
        variant: "default",
      });

      setTimeout(() => {
        toast({
          title: "Transferring data",
          description: "Sending data to accounting software...",
          variant: "default",
        });

        // Final completion toast
        setTimeout(() => {
          // Reset loading state
          setIsExporting(false);

          toast({
            title: "Export complete",
            description:
              "Your data has been exported to accounting software successfully.",
            action: (
              <ToastAction
                altText="View"
                onClick={() => {
                  toast({
                    title: "Opening exported data",
                    description: "Redirecting to exported data view.",
                    variant: "default",
                  });
                }}
              >
                View
              </ToastAction>
            ),
            variant: "default",
          });
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleRefreshData = () => {
    // Implementation for refreshing data
    window.location.reload();
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle row selection
  const handleRowSelect = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectedRows.length === accountingEntries.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(accountingEntries.map((entry) => entry.id));
    }
  };

  // Mock data for accounting entries
  const accountingEntries = [
    {
      id: "1",
      action: "View",
      project: "2-20-M4 Mira Loma",
      subcontractor: "ABC Contractors",
      workOrderNumber: "WO-2023-001",
      completed: 100,
      swoTotal: 12500.0,
      retainage: 5,
      retainageAmount: 625.0,
      paidAmount: 11875.0,
      total: 12500.0,
      status: "Approved",
    },
    {
      id: "2",
      action: "View",
      project: "2-20-M4 Mira Loma",
      subcontractor: "ABC Contractors",
      workOrderNumber: "WO-2023-002",
      completed: 100,
      swoTotal: 8750.5,
      retainage: 5,
      retainageAmount: 437.53,
      paidAmount: 8312.97,
      total: 8750.5,
      status: "Approved",
    },
    {
      id: "3",
      action: "View",
      project: "2-20-M4 Mira Loma",
      subcontractor: "XYZ Services",
      workOrderNumber: "WO-2023-003",
      completed: 75,
      swoTotal: 15250.75,
      retainage: 5,
      retainageAmount: 762.54,
      paidAmount: 10688.21,
      total: 15250.75,
      status: "Pending",
    },
    {
      id: "4",
      action: "View",
      project: "3-21-M4 Mira Loma",
      subcontractor: "Delta Engineering",
      workOrderNumber: "WO-2023-004",
      completed: 100,
      swoTotal: 3500.0,
      retainage: 5,
      retainageAmount: 175.0,
      paidAmount: 3325.0,
      total: 3500.0,
      status: "Approved",
    },
    {
      id: "5",
      action: "View",
      project: "3-21-M4 Mira Loma",
      subcontractor: "Delta Engineering",
      workOrderNumber: "WO-2023-005",
      completed: 0,
      swoTotal: 2100.0,
      retainage: 5,
      retainageAmount: 0.0,
      paidAmount: 0.0,
      total: 2100.0,
      status: "Rejected",
    },
    {
      id: "6",
      action: "View",
      project: "4-21-M4 Mira Loma",
      subcontractor: "Omega Construction",
      workOrderNumber: "WO-2023-006",
      completed: 100,
      swoTotal: 9800.0,
      retainage: 5,
      retainageAmount: 490.0,
      paidAmount: 9310.0,
      total: 9800.0,
      status: "Approved",
    },
    {
      id: "7",
      action: "View",
      project: "4-21-M4 Mira Loma",
      subcontractor: "Omega Construction",
      workOrderNumber: "WO-2023-007",
      completed: 50,
      swoTotal: 11250.0,
      retainage: 5,
      retainageAmount: 562.5,
      paidAmount: 5062.5,
      total: 11250.0,
      status: "Pending",
    },
    {
      id: "8",
      action: "View",
      project: "5-21-M4 Mira Loma",
      subcontractor: "Acme Builders",
      workOrderNumber: "WO-2023-008",
      completed: 100,
      swoTotal: 7500.0,
      retainage: 5,
      retainageAmount: 375.0,
      paidAmount: 7125.0,
      total: 7500.0,
      status: "Approved",
    },
    {
      id: "9",
      action: "View",
      project: "5-21-M4 Mira Loma",
      subcontractor: "Acme Builders",
      workOrderNumber: "WO-2023-009",
      completed: 25,
      swoTotal: 4200.0,
      retainage: 5,
      retainageAmount: 210.0,
      paidAmount: 840.0,
      total: 4200.0,
      status: "Pending",
    },
    {
      id: "10",
      action: "View",
      project: "6-21-M4 Mira Loma",
      subcontractor: "Best Contractors",
      workOrderNumber: "WO-2023-010",
      completed: 100,
      swoTotal: 13750.0,
      retainage: 5,
      retainageAmount: 687.5,
      paidAmount: 13062.5,
      total: 13750.0,
      status: "Approved",
    },
  ];

  // Filter entries based on search and filters
  const filteredEntries = accountingEntries.filter((entry) => {
    const matchesSearch =
      !searchTerm ||
      entry.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.subcontractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProject =
      projectFilter === "all" || entry.project === projectFilter;
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let aValue = a[sortField as keyof typeof a];
    let bValue = b[sortField as keyof typeof b];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Get unique projects for filter
  const uniqueProjects = [
    "all",
    ...new Set(accountingEntries.map((entry) => entry.project)),
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Accounting</h1>
        <div className="flex items-center gap-2">
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-auto"
          />
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save View
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="w-full h-96 flex items-center justify-center">
          <Skeleton className="h-96 w-full rounded-md" />
        </div>
      )}

      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-bold">Error Loading Data</h3>
          <p>
            There was a problem loading the financial data. Please try
            refreshing the page.
          </p>
        </div>
      )}

      {!isLoading && !hasError && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by project, subcontractor, or ID..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueProjects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project === "all" ? "All Projects" : project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedRows.length === accountingEntries.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead
                    className="w-[80px] cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center">
                      Action
                      {sortField === "id" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[150px] cursor-pointer"
                    onClick={() => handleSort("project")}
                  >
                    <div className="flex items-center">
                      Project Number
                      {sortField === "project" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("subcontractor")}
                  >
                    <div className="flex items-center">
                      Subcontractor Company
                      {sortField === "subcontractor" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("workOrderNumber")}
                  >
                    <div className="flex items-center">
                      Work Order Number
                      {sortField === "workOrderNumber" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-center cursor-pointer"
                    onClick={() => handleSort("completed")}
                  >
                    <div className="flex items-center justify-center">
                      % Completed
                      {sortField === "completed" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("swoTotal")}
                  >
                    <div className="flex items-center justify-end">
                      SWO Total
                      {sortField === "swoTotal" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("retainage")}
                  >
                    <div className="flex items-center justify-end">
                      Retainage %
                      {sortField === "retainage" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("retainageAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Retainage Amount
                      {sortField === "retainageAmount" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("paidAmount")}
                  >
                    <div className="flex items-center justify-end">
                      Paid Amount
                      {sortField === "paidAmount" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("total")}
                  >
                    <div className="flex items-center justify-end">
                      Total
                      {sortField === "total" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">
                      No accounting entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEntries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(entry.id)}
                          onCheckedChange={() => handleRowSelect(entry.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.project}
                      </TableCell>
                      <TableCell>{entry.subcontractor}</TableCell>
                      <TableCell>{entry.workOrderNumber}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span>{entry.completed}%</span>
                          <Progress
                            value={entry.completed}
                            className="h-2 w-16 mt-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${entry.swoTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.retainage}%
                      </TableCell>
                      <TableCell className="text-right">
                        ${entry.retainageAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${entry.paidAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${entry.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {sortedEntries.length} of {accountingEntries.length}{" "}
              entries
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-primary-foreground"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>

          {/* Enhanced Accounting Features */}
          <div className="mt-8">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid grid-cols-7 mb-4">
                <TabsTrigger value="dashboard">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Financial Dashboard
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Reporting Tools
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Tracking
                </TabsTrigger>
                <TabsTrigger value="billing">
                  <Calculator className="h-4 w-4 mr-2" />
                  Billing Automation
                </TabsTrigger>
                <TabsTrigger value="audit">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Audit Trail
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Financial Analytics
                </TabsTrigger>
              </TabsList>

              {/* Financial Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Financial Summary
                      </CardTitle>
                      <CardDescription>
                        Overview of financial status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total SWO Amount:
                          </span>
                          <span className="font-medium">
                            $
                            {accountingEntries
                              .reduce((sum, entry) => sum + entry.swoTotal, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Paid:
                          </span>
                          <span className="font-medium">
                            $
                            {accountingEntries
                              .reduce((sum, entry) => sum + entry.paidAmount, 0)
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Outstanding Balance:
                          </span>
                          <span className="font-medium">
                            $
                            {accountingEntries
                              .reduce(
                                (sum, entry) =>
                                  sum + (entry.total - entry.paidAmount),
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Retainage:
                          </span>
                          <span className="font-medium">
                            $
                            {accountingEntries
                              .reduce(
                                (sum, entry) => sum + entry.retainageAmount,
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Status Breakdown
                      </CardTitle>
                      <CardDescription>Entries by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Approved:
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) => entry.status === "Approved"
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Pending:
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) => entry.status === "Pending"
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Rejected:
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) => entry.status === "Rejected"
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Completion Status
                      </CardTitle>
                      <CardDescription>Work order completion</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Completed (100%):
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) => entry.completed === 100
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            In Progress:
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) =>
                                  entry.completed > 0 && entry.completed < 100
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Not Started:
                          </span>
                          <span className="font-medium">
                            {
                              accountingEntries.filter(
                                (entry) => entry.completed === 0
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        Budget Variance Analysis
                      </CardTitle>
                      <CardDescription>
                        Real-time financial health indicators
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Budget Utilization</span>
                          <span className="font-medium text-green-600">
                            78%
                          </span>
                        </div>
                        <Progress value={78} className="h-2" />

                        <div className="flex items-center justify-between mt-4">
                          <span>Cost Variance</span>
                          <span className="font-medium text-amber-600">
                            +5.2%
                          </span>
                        </div>
                        <Progress value={52} className="h-2" />

                        <div className="flex items-center justify-between mt-4">
                          <span>Schedule Variance</span>
                          <span className="font-medium text-red-600">
                            -8.7%
                          </span>
                        </div>
                        <Progress value={35} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription>
                        Latest accounting entries
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {accountingEntries
                          .sort((a, b) => parseInt(b.id) - parseInt(a.id))
                          .slice(0, 3)
                          .map((entry) => (
                            <div
                              key={entry.id}
                              className="flex justify-between items-center"
                            >
                              <div>
                                <div className="font-medium">
                                  {entry.project}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.subcontractor} -{" "}
                                  {entry.workOrderNumber}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  entry.status === "Approved"
                                    ? "success"
                                    : entry.status === "Pending"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {entry.status}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View All Activity
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Filters Tab */}
              <TabsContent value="filters">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Accounting Filters</CardTitle>
                    <CardDescription>
                      Filter accounting data with precision
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Payment Status</h3>
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="verified" />
                            <label htmlFor="verified" className="text-sm">
                              Verified
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="completed" />
                            <label htmlFor="completed" className="text-sm">
                              Completed
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="pending" />
                            <label htmlFor="pending" className="text-sm">
                              Pending
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Date Range</h3>
                        <DatePickerWithRange
                          date={dateRange}
                          setDate={setDateRange}
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Amount Range</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs">Min</label>
                            <Input type="number" placeholder="0.00" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs">Max</label>
                            <Input type="number" placeholder="100000.00" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Subcontractor</h3>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcontractor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Subcontractors
                            </SelectItem>
                            <SelectItem value="abc">ABC Contractors</SelectItem>
                            <SelectItem value="xyz">XYZ Services</SelectItem>
                            <SelectItem value="delta">
                              Delta Engineering
                            </SelectItem>
                            <SelectItem value="omega">
                              Omega Construction
                            </SelectItem>
                            <SelectItem value="acme">Acme Builders</SelectItem>
                            <SelectItem value="best">
                              Best Contractors
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Completion %</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs">Min %</label>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max="100"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs">Max %</label>
                            <Input
                              type="number"
                              placeholder="100"
                              min="0"
                              max="100"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Retainage %</h3>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select retainage %" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset Filters</Button>
                    <Button>Apply Filters</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Other tabs would be implemented similarly */}
              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reporting Tools</CardTitle>
                    <CardDescription>
                      Generate and customize financial reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Financial Statements
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          Generate income statements, balance sheets, and cash
                          flow reports
                        </CardContent>
                        <CardFooter>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={handleGenerateFinancialStatements}
                            disabled={isGeneratingStatements}
                          >
                            {isGeneratingStatements ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Tax Documentation
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          Prepare tax forms and supporting documentation
                        </CardContent>
                        <CardFooter>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={handlePrepareTaxDocumentation}
                            disabled={isPreparingTaxDocs}
                          >
                            {isPreparingTaxDocs ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Preparing...
                              </>
                            ) : (
                              "Prepare"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Export Options
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          Export data to QuickBooks, Sage, Excel, or PDF formats
                        </CardContent>
                        <CardFooter>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={handleExportToAccounting}
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                              </>
                            ) : (
                              "Export"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Placeholder for other tabs */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Tracking Visualizations</CardTitle>
                    <CardDescription>
                      Monitor payment status and aging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Payment tracking visualizations would be displayed here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Automation</CardTitle>
                    <CardDescription>
                      Streamline your billing processes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Billing automation tools would be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit">
                <Card>
                  <CardHeader>
                    <CardTitle>Audit Trail and Compliance</CardTitle>
                    <CardDescription>
                      Track all financial activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Audit trail and compliance tools would be displayed here
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Analytics</CardTitle>
                    <CardDescription>
                      Gain insights from your financial data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Financial analytics tools would be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default Accounting;
