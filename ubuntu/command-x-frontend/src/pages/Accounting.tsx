import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import WorkOrderStatusTable from "@/components/accounting/WorkOrderStatusTable";
import PaymentStatusTable from "@/components/accounting/PaymentStatusTable";
import { workOrderData } from "@/components/accounting/WorkOrderStatusTable";
import MobileTable from "@/components/ui/mobile-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { DateRange } from "react-day-picker";

// View configuration interface
interface ViewConfig {
  id: string;
  name: string;
  filters: {
    searchTerm: string;
    projectFilter: string;
    statusFilter: string;
    dateRange: DateRange | undefined;
  };
  sortConfig: {
    field: string;
    direction: "asc" | "desc";
  };
}

const Accounting: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("project");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Loading states for financial reporting tools
  const [isGeneratingStatements, setIsGeneratingStatements] = useState(false);
  const [isPreparingTaxDocs, setIsPreparingTaxDocs] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingView, setIsSavingView] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // State to track if financial statements have been generated
  const [showGeneratedStatements, setShowGeneratedStatements] = useState(false);
  const [generatedDate, setGeneratedDate] = useState<string>("");

  // State for saved views
  const [savedViews, setSavedViews] = useState<ViewConfig[]>([]);
  const [isSaveViewDialogOpen, setIsSaveViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State for work order management
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<string[]>([]);

  // State for invoice viewing
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

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

    // Show initial toast with progress indication
    toast({
      title: "Generating financial statements",
      description: "Starting generation process (0%)...",
      duration: 5000,
    });

    // Simulate processing with multiple steps and progress updates
    setTimeout(() => {
      toast({
        title: "Processing financial data",
        description: "Analyzing transactions and accounts (25%)...",
        variant: "default",
        duration: 5000,
      });

      setTimeout(() => {
        toast({
          title: "Creating financial reports",
          description: "Generating income statements (50%)...",
          variant: "default",
          duration: 5000,
        });

        setTimeout(() => {
          toast({
            title: "Finalizing reports",
            description:
              "Creating balance sheets and cash flow statements (75%)...",
            variant: "default",
            duration: 5000,
          });

          // Final completion toast
          setTimeout(() => {
            // Reset loading state
            setIsGeneratingStatements(false);

            // Set the generated date
            const now = new Date();
            setGeneratedDate(now.toLocaleString());

            // Show the generated statements
            setShowGeneratedStatements(true);

            toast({
              title: "Financial statements generated",
              description:
                "Your financial statements have been generated successfully (100%).",
              action: (
                <ToastAction
                  altText="Download"
                  onClick={() => {
                    // Simulate file download with a data URL for a blank PDF
                    const link = document.createElement("a");
                    // Create a simple data URL that will trigger a download
                    link.href =
                      "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
                    link.setAttribute("download", "financial_statements.pdf");
                    document.body.appendChild(link);

                    toast({
                      title: "Download started",
                      description:
                        "Your financial statements are being downloaded.",
                      variant: "default",
                    });

                    // Simulate click after a short delay
                    setTimeout(() => {
                      try {
                        link.click();
                        document.body.removeChild(link);
                      } catch (err) {
                        console.error("Download simulation error:", err);
                      }
                    }, 500);
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
                  // Simulate file download with a data URL for a blank PDF
                  const link = document.createElement("a");
                  // Create a simple data URL that will trigger a download
                  link.href =
                    "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
                  link.setAttribute("download", "tax_documentation.pdf");
                  document.body.appendChild(link);

                  toast({
                    title: "Download started",
                    description: "Your tax documentation is being downloaded.",
                    variant: "default",
                  });

                  // Simulate click after a short delay
                  setTimeout(() => {
                    try {
                      link.click();
                      document.body.removeChild(link);
                    } catch (err) {
                      console.error("Download simulation error:", err);
                    }
                  }, 500);
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
                  // Create a modal-like effect by showing a toast with longer duration
                  toast({
                    title: "Exported Data View",
                    description: (
                      <div className="mt-2 space-y-2">
                        <p>Your data has been successfully exported to:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>QuickBooks Online</li>
                          <li>Excel Spreadsheet</li>
                          <li>PDF Report</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          You can access these files from your accounting
                          software or download them directly.
                        </p>
                      </div>
                    ),
                    variant: "default",
                    duration: 10000,
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

  // Save current view
  const handleSaveView = () => {
    setIsSaveViewDialogOpen(true);
  };

  const saveCurrentView = () => {
    if (!newViewName.trim()) return;

    setIsSavingView(true);

    // Create new view configuration
    const newView: ViewConfig = {
      id: Date.now().toString(),
      name: newViewName,
      filters: {
        searchTerm,
        projectFilter,
        statusFilter,
        dateRange,
      },
      sortConfig: {
        field: sortField,
        direction: sortDirection,
      },
    };

    // Simulate API call to save the view
    setTimeout(() => {
      setSavedViews([...savedViews, newView]);
      setIsSavingView(false);
      setIsSaveViewDialogOpen(false);
      setNewViewName("");
      setHasUnsavedChanges(false);

      toast({
        title: "View saved",
        description: `Your view "${newViewName}" has been saved successfully.`,
        variant: "default",
      });
    }, 1000);
  };

  // Load a saved view
  const handleLoadView = (view: ViewConfig) => {
    setSearchTerm(view.filters.searchTerm);
    setProjectFilter(view.filters.projectFilter);
    setStatusFilter(view.filters.statusFilter);
    setDateRange(view.filters.dateRange);
    setSortField(view.sortConfig.field);
    setSortDirection(view.sortConfig.direction);

    toast({
      title: "View loaded",
      description: `View "${view.name}" has been loaded successfully.`,
      variant: "default",
    });
  };

  // Work Order Status Management Handlers
  const handleUpdateStatus = () => {
    // Show the status update modal
    setShowStatusUpdateModal(true);
    // Default to selecting all work orders
    setSelectedWorkOrders(workOrderData.map((wo) => wo.id));
  };

  const handleStatusUpdateConfirm = () => {
    setIsUpdatingStatus(true);

    // Show initial toast
    toast({
      title: "Updating work order status",
      description: "Processing your request...",
    });

    // Simulate API call with timeout
    setTimeout(() => {
      // Update would happen here in a real implementation

      // Show success toast
      toast({
        title: "Status updated successfully",
        description: `${selectedWorkOrders.length} work orders updated to "${selectedStatus}"`,
        variant: "default",
      });

      setIsUpdatingStatus(false);
      setShowStatusUpdateModal(false);
    }, 1500);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleReportGeneration = () => {
    setIsGeneratingWorkOrderReport(true);

    // Show initial toast
    toast({
      title: "Generating work order report",
      description: "Processing your request...",
    });

    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Report generated successfully",
        description: "Your work order report is ready to download",
        action: (
          <ToastAction
            altText="Download"
            onClick={() => {
              // Simulate file download
              const link = document.createElement("a");
              link.href =
                "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
              link.setAttribute("download", "work_order_report.pdf");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </ToastAction>
        ),
        variant: "default",
      });

      setIsGeneratingWorkOrderReport(false);
      setShowReportModal(false);
    }, 2000);
  };

  const handleManageCrew = () => {
    setShowCrewManagementModal(true);
  };

  const handleCrewAssignment = (crewName: string) => {
    // Show initial toast
    toast({
      title: "Updating crew assignment",
      description: "Processing your request...",
    });

    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Crew assigned successfully",
        description: `Crew "${crewName}" has been assigned to the selected work orders.`,
        variant: "default",
      });

      setShowCrewManagementModal(false);
    }, 1500);
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveView}
            disabled={isSavingView}
          >
            {isSavingView ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save View
              </>
            )}
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

          {/* Mobile View */}
          {isMobileView ? (
            <div className="space-y-4">
              <MobileTable
                data={sortedEntries}
                keyExtractor={(entry) => entry.id}
                onRowClick={(entry) => {
                  setSelectedEntry(entry);
                  setIsInvoiceDialogOpen(true);
                }}
                columns={[
                  {
                    id: "project",
                    header: "Project",
                    cell: (entry) => (
                      <span className="font-medium">{entry.project}</span>
                    ),
                  },
                  {
                    id: "status",
                    header: "Status",
                    cell: (entry) => (
                      <Badge
                        className={
                          entry.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : entry.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {entry.status}
                      </Badge>
                    ),
                  },
                  {
                    id: "completed",
                    header: "Completed",
                    cell: (entry) => (
                      <div className="flex items-center space-x-2">
                        <span>{entry.completed}%</span>
                        <Progress
                          value={entry.completed}
                          className="h-2 w-12"
                        />
                      </div>
                    ),
                  },
                  {
                    id: "swoTotal",
                    header: "SWO Total",
                    cell: (entry) => (
                      <span className="font-medium">
                        $
                        {entry.swoTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ),
                  },
                  {
                    id: "paidAmount",
                    header: "Paid Amount",
                    cell: (entry) => (
                      <span className="font-medium">
                        $
                        {entry.paidAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ),
                  },
                ]}
                renderActions={(entry) => (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(entry);
                      setIsInvoiceDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                )}
              />
            </div>
          ) : (
            /* Desktop View */
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          selectedRows.length === accountingEntries.length
                        }
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
                            onClick={() => {
                              setSelectedEntry(entry);
                              setIsInvoiceDialogOpen(true);
                            }}
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
          )}

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
              <TabsList className="grid grid-cols-8 mb-4">
                <TabsTrigger value="dashboard">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Financial Dashboard
                </TabsTrigger>
                <TabsTrigger value="workorders">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Work Orders
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

              {/* Work Orders Tab */}
              <TabsContent value="workorders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Order Status Management</CardTitle>
                    <CardDescription>
                      Track and manage work order status and completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="default" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Work Order Status Details
                        </h3>
                        <WorkOrderStatusTable />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Status Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total Work Orders:
                                </span>
                                <span className="font-medium">4</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Completed:
                                </span>
                                <span className="font-medium text-green-600">
                                  4
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total SWO Amount:
                                </span>
                                <span className="font-medium">$69,670.25</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Retainage Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total Retainage:
                                </span>
                                <span className="font-medium">$987.08</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Retainage Held:
                                </span>
                                <span className="font-medium">$0.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Pending COs:
                                </span>
                                <span className="font-medium">0</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Quick Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  toast({
                                    title: "Status Updated",
                                    description:
                                      "Work order status has been updated successfully.",
                                  });
                                }}
                              >
                                Update Status
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  toast({
                                    title: "Report Generated",
                                    description:
                                      "Work order report has been generated successfully.",
                                    action: (
                                      <ToastAction
                                        altText="Download"
                                        onClick={() => {
                                          const link =
                                            document.createElement("a");
                                          link.href =
                                            "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
                                          link.setAttribute(
                                            "download",
                                            "work_order_report.pdf"
                                          );
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                        }}
                                      >
                                        Download
                                      </ToastAction>
                                    ),
                                  });
                                }}
                              >
                                Generate Report
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  toast({
                                    title: "Crew Assigned",
                                    description:
                                      "Abel Duran has been assigned to the selected work orders.",
                                  });
                                }}
                              >
                                Manage Crew
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Work Order Status Overview
                  </h3>
                  <WorkOrderStatusTable />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
                      <Link to="/activity" className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Activity
                        </Button>
                      </Link>
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
                            variant="default"
                          >
                            {isGeneratingStatements ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate
                              </>
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
                            variant="default"
                          >
                            {isPreparingTaxDocs ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Preparing...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Prepare
                              </>
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
                            variant="default"
                          >
                            {isExporting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Tracking Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Tracking Visualizations</CardTitle>
                    <CardDescription>
                      Monitor payment status and aging
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">
                          Payment Status Overview
                        </h3>
                        <PaymentStatusTable />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Payment Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Eligible for Payment:
                                </span>
                                <span className="font-medium">4</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Pending QC:
                                </span>
                                <span className="font-medium">4</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Completed:
                                </span>
                                <span className="font-medium">4</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Payment Actions
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button size="sm" className="w-full">
                                Process Selected Payments
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                Export Payment Report
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                              Payment Metrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Total Items:
                                </span>
                                <span className="font-medium">460</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Completion Rate:
                                </span>
                                <span className="font-medium text-green-600">
                                  100%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  QC Approval Rate:
                                </span>
                                <span className="font-medium text-amber-600">
                                  Pending
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
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

          {/* Financial Statements Display */}
          {showGeneratedStatements && (
            <div className="mt-8">
              <Card className="border-2 border-green-500">
                <CardHeader className="bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-green-700">
                        Generated Financial Statements
                      </CardTitle>
                      <CardDescription>
                        Generated on: {generatedDate}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGeneratedStatements(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {/* Income Statement */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">
                        Income Statement
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[300px]">Item</TableHead>
                              <TableHead className="text-right">
                                Amount ($)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                Revenue
                              </TableCell>
                              <TableCell className="text-right">
                                1,250,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Cost of Goods Sold
                              </TableCell>
                              <TableCell className="text-right">
                                750,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Gross Profit
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                500,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Operating Expenses
                              </TableCell>
                              <TableCell className="text-right">
                                200,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Administrative Expenses
                              </TableCell>
                              <TableCell className="text-right">
                                100,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Operating Income
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                200,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Taxes (25%)
                              </TableCell>
                              <TableCell className="text-right">
                                50,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-green-50">
                              <TableCell className="font-bold">
                                Net Income
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                150,000.00
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Balance Sheet */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Balance Sheet</h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[300px]">Item</TableHead>
                              <TableHead className="text-right">
                                Amount ($)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Assets
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Cash and Equivalents
                              </TableCell>
                              <TableCell className="text-right">
                                350,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Accounts Receivable
                              </TableCell>
                              <TableCell className="text-right">
                                425,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Property and Equipment
                              </TableCell>
                              <TableCell className="text-right">
                                875,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Total Assets
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                1,650,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Liabilities
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Accounts Payable
                              </TableCell>
                              <TableCell className="text-right">
                                275,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Long-term Debt
                              </TableCell>
                              <TableCell className="text-right">
                                525,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Total Liabilities
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                800,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Equity
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Common Stock
                              </TableCell>
                              <TableCell className="text-right">
                                500,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Retained Earnings
                              </TableCell>
                              <TableCell className="text-right">
                                350,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Total Equity
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                850,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-green-50">
                              <TableCell className="font-bold">
                                Total Liabilities and Equity
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                1,650,000.00
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Cash Flow Statement */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">
                        Cash Flow Statement
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[300px]">Item</TableHead>
                              <TableHead className="text-right">
                                Amount ($)
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Operating Activities
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Net Income
                              </TableCell>
                              <TableCell className="text-right">
                                150,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Depreciation
                              </TableCell>
                              <TableCell className="text-right">
                                45,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Changes in Working Capital
                              </TableCell>
                              <TableCell className="text-right">
                                -25,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Net Cash from Operating Activities
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                170,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Investing Activities
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Purchase of Equipment
                              </TableCell>
                              <TableCell className="text-right">
                                -120,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Net Cash from Investing Activities
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                -120,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-muted/30">
                              <TableCell className="font-bold" colSpan={2}>
                                Financing Activities
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Debt Repayment
                              </TableCell>
                              <TableCell className="text-right">
                                -50,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium pl-6">
                                Dividends Paid
                              </TableCell>
                              <TableCell className="text-right">
                                -30,000.00
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/50">
                              <TableCell className="font-bold">
                                Net Cash from Financing Activities
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                -80,000.00
                              </TableCell>
                            </TableRow>

                            <TableRow className="bg-green-50">
                              <TableCell className="font-bold">
                                Net Change in Cash
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                -30,000.00
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowGeneratedStatements(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // Simulate file download with a data URL for a blank PDF
                      const link = document.createElement("a");
                      // Create a simple data URL that will trigger a download
                      link.href =
                        "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
                      link.setAttribute("download", "financial_statements.pdf");
                      document.body.appendChild(link);

                      toast({
                        title: "Download started",
                        description:
                          "Your financial statements are being downloaded.",
                        variant: "default",
                      });

                      // Simulate click after a short delay
                      setTimeout(() => {
                        try {
                          link.click();
                          document.body.removeChild(link);
                        } catch (err) {
                          console.error("Download simulation error:", err);
                        }
                      }, 500);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download All Statements
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Save View Dialog */}
      <Dialog
        open={isSaveViewDialogOpen}
        onOpenChange={setIsSaveViewDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save your current filters, sorting, and configuration as a custom
              view.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="view-name">View Name</Label>
            <Input
              id="view-name"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="My Custom View"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveViewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveCurrentView}
              disabled={!newViewName.trim() || isSavingView}
            >
              {isSavingView ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save View"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Views Dialog */}
      {savedViews.length > 0 && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Saved Views</DialogTitle>
              <DialogDescription>
                Select a saved view to load its configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                {savedViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleLoadView(view)}
                  >
                    <span className="font-medium">{view.name}</span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Invoice View Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedEntry && `Work Order: ${selectedEntry.workOrderNumber}`}
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">
                      Command X Construction
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      123 Builder Street
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Construction City, CC 12345
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Phone: (555) 123-4567
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold">INVOICE</h3>
                    <p className="text-sm text-muted-foreground">
                      Invoice #: INV-{selectedEntry.id}-2023
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due Date:{" "}
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client & Project Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Bill To:</h4>
                  <p className="text-sm">{selectedEntry.subcontractor}</p>
                  <p className="text-sm text-muted-foreground">
                    123 Contractor Lane
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Construction City, CC 12345
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Project:</h4>
                  <p className="text-sm">{selectedEntry.project}</p>
                  <p className="text-sm text-muted-foreground">
                    Work Order: {selectedEntry.workOrderNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedEntry.status}
                  </p>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h4 className="font-medium mb-2">Invoice Items:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        Construction Services - {selectedEntry.workOrderNumber}
                      </TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell className="text-right">
                        ${selectedEntry.swoTotal.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${selectedEntry.swoTotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {selectedEntry.completed < 100 && (
                      <TableRow>
                        <TableCell>
                          Partial Completion Adjustment (
                          {selectedEntry.completed}%)
                        </TableCell>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell className="text-right">
                          -$
                          {(
                            selectedEntry.swoTotal *
                            (1 - selectedEntry.completed / 100)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          -$
                          {(
                            selectedEntry.swoTotal *
                            (1 - selectedEntry.completed / 100)
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
                        Retainage ({selectedEntry.retainage}%)
                      </TableCell>
                      <TableCell className="text-right">1</TableCell>
                      <TableCell className="text-right">
                        -${selectedEntry.retainageAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        -${selectedEntry.retainageAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Subtotal:</span>
                      <span>${selectedEntry.swoTotal.toFixed(2)}</span>
                    </div>
                    {selectedEntry.completed < 100 && (
                      <div className="flex justify-between py-1">
                        <span className="font-medium">Partial Completion:</span>
                        <span>
                          -$
                          {(
                            selectedEntry.swoTotal *
                            (1 - selectedEntry.completed / 100)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="font-medium">Retainage:</span>
                      <span>-${selectedEntry.retainageAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-dashed mt-2 pt-2">
                      <span className="font-bold">Total Due:</span>
                      <span className="font-bold">
                        ${selectedEntry.paidAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 mt-2">
                      <span className="font-medium">Amount Paid:</span>
                      <span>
                        $
                        {selectedEntry.status === "Approved"
                          ? selectedEntry.paidAmount.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-t mt-2 pt-2">
                      <span className="font-bold">Balance Due:</span>
                      <span className="font-bold">
                        $
                        {selectedEntry.status === "Approved"
                          ? "0.00"
                          : selectedEntry.paidAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Notes:</h4>
                <p className="text-sm text-muted-foreground">
                  Payment is due within 30 days. Please make checks payable to
                  Command X Construction or pay online at commandx.com/pay.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Thank you for your business!
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center border-t pt-4 mt-4">
            <div className="flex gap-2">
              <Badge
                variant={
                  selectedEntry?.status === "Approved"
                    ? "success"
                    : selectedEntry?.status === "Pending"
                    ? "outline"
                    : "destructive"
                }
              >
                {selectedEntry?.status}
              </Badge>
              <Badge variant="outline">
                Completion: {selectedEntry?.completed}%
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsInvoiceDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Invoice downloaded",
                    description:
                      "The invoice has been downloaded successfully.",
                  });

                  // Simulate download
                  setTimeout(() => {
                    const link = document.createElement("a");
                    link.href =
                      "data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PAovRmlsdGVyIC9GbGF0ZURlY29kZQovTGVuZ3RoIDM4Cj4+CnN0cmVhbQp4nCvkMlAwUDC1NNUzMVGwMDHUszRSKErMKwktStVLLCjISQUAXX8HCWVUC3RzdHJ1Y3R1cmUgdHJlZQo1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNiAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDcgMCBSCj4+Cj4+Ci9Db250ZW50cyA4IDAgUgovUGFyZW50IDUgMCBSCj4+CmVuZG9iago4IDAgb2JqCjw8Ci9GaWx0ZXIgL0ZsYXRlRGVjb2RlCi9MZW5ndGggMTI5Cj4+CnN0cmVhbQp4nDPQM1QwUDAzNVEwMDRRMAdiCwVDCwUjPQMzE4WiRCCXK5zzUCGXS8FYz8xEwdxAz9JIwdLI0FDBxNTM0kjBzMzC0NTSQMHMwMjA0MhIwcDcwMDY0sJYwdDC0NjC0AQAKXgTnAplbmRzdHJlYW0KZW5kb2JqCjcgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iagozIDAgb2JqCjw8Cj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9DYXRhbG9nCi9QYWdlcyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvZHVjZXIgKGlUZXh0IDIuMS43IGJ5IDFUM1hUKQovTW9kRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKL0NyZWF0aW9uRGF0ZSAoRDoyMDIzMDUyNjEyMzQ1NikKPj4KZW5kb2JqCnhyZWYKMCA5CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNTc1IDAwMDAwIG4gCjAwMDAwMDA1NDYgMDAwMDAgbiAKMDAwMDAwMDYyNCAwMDAwMCBuIAowMDAwMDAwMDkzIDAwMDAwIG4gCjAwMDAwMDAxNDkgMDAwMDAgbiAKMDAwMDAwMDQ2NyAwMDAwMCBuIAowMDAwMDAwMjc5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgOQovUm9vdCAyIDAgUgovSW5mbyA0IDAgUgovSUQgWzw2YWJhMzBhZGY3YTRmMzc1YmFkMWJmMTk4ZWNjMGIyZD4gPDZhYmEzMGFkZjdhNGYzNzViYWQxYmYxOThlY2MwYjJkPl0KPj4Kc3RhcnR4cmVmCjczNAolJUVPRgo=";
                    link.setAttribute(
                      "download",
                      `invoice-${selectedEntry?.workOrderNumber}.pdf`
                    );
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }, 500);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => {
                  toast({
                    title: "Invoice printed",
                    description: "The invoice has been sent to the printer.",
                  });

                  // In a real app, this would trigger a print dialog
                  setTimeout(() => {
                    window.print();
                  }, 500);
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;
