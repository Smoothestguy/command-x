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
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  Briefcase,
  Construction,
  AlertCircle,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

// Mock data for activity entries
const activityEntries = [
  {
    id: "1",
    date: "6-21-2023",
    project: "6-21-M4 Mira Loma",
    subcontractor: "Best Contractors",
    workOrderNumber: "WO-2023-010",
    type: "accounting",
    action: "payment_processed",
    user: "admin",
    timestamp: "2023-06-21T14:30:00Z",
    status: "Approved",
  },
  {
    id: "2",
    date: "5-21-2023",
    project: "5-21-M4 Mira Loma",
    subcontractor: "Acme Builders",
    workOrderNumber: "WO-2023-009",
    type: "accounting",
    action: "invoice_created",
    user: "finance_manager",
    timestamp: "2023-05-21T10:15:00Z",
    status: "Pending",
  },
  {
    id: "3",
    date: "5-21-2023",
    project: "5-21-M4 Mira Loma",
    subcontractor: "Acme Builders",
    workOrderNumber: "WO-2023-008",
    type: "accounting",
    action: "payment_processed",
    user: "admin",
    timestamp: "2023-05-21T16:45:00Z",
    status: "Approved",
  },
  {
    id: "4",
    date: "4-15-2023",
    project: "4-15-M4 Mira Loma",
    subcontractor: "Delta Engineering",
    workOrderNumber: "WO-2023-007",
    type: "project",
    action: "work_order_created",
    user: "project_manager",
    timestamp: "2023-04-15T09:30:00Z",
    status: "Approved",
  },
  {
    id: "5",
    date: "4-10-2023",
    project: "4-10-M4 Mira Loma",
    subcontractor: "XYZ Services",
    workOrderNumber: "WO-2023-006",
    type: "accounting",
    action: "invoice_created",
    user: "finance_manager",
    timestamp: "2023-04-10T11:20:00Z",
    status: "Rejected",
  },
  {
    id: "6",
    date: "3-28-2023",
    project: "3-28-M4 Mira Loma",
    subcontractor: "Omega Construction",
    workOrderNumber: "WO-2023-005",
    type: "document",
    action: "document_uploaded",
    user: "field_staff",
    timestamp: "2023-03-28T14:10:00Z",
    status: "Approved",
  },
  {
    id: "7",
    date: "3-15-2023",
    project: "3-15-M4 Mira Loma",
    subcontractor: "ABC Contractors",
    workOrderNumber: "WO-2023-004",
    type: "issue",
    action: "issue_reported",
    user: "field_staff",
    timestamp: "2023-03-15T08:45:00Z",
    status: "Pending",
  },
  {
    id: "8",
    date: "3-10-2023",
    project: "3-10-M4 Mira Loma",
    subcontractor: "Best Contractors",
    workOrderNumber: "WO-2023-003",
    type: "accounting",
    action: "payment_processed",
    user: "admin",
    timestamp: "2023-03-10T15:30:00Z",
    status: "Approved",
  },
  {
    id: "9",
    date: "2-28-2023",
    project: "2-28-M4 Mira Loma",
    subcontractor: "Acme Builders",
    workOrderNumber: "WO-2023-002",
    type: "project",
    action: "work_order_updated",
    user: "project_manager",
    timestamp: "2023-02-28T13:20:00Z",
    status: "Approved",
  },
  {
    id: "10",
    date: "2-15-2023",
    project: "2-15-M4 Mira Loma",
    subcontractor: "Delta Engineering",
    workOrderNumber: "WO-2023-001",
    type: "accounting",
    action: "invoice_created",
    user: "finance_manager",
    timestamp: "2023-02-15T10:45:00Z",
    status: "Approved",
  },
];

const AllActivity: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Simulate loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    toast.info("Refreshing activity data...");
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Activity data refreshed successfully");
    }, 1000);
  };

  const handleExport = () => {
    toast.info("Exporting activity data...");
    
    // Simulate export process
    setTimeout(() => {
      toast.success("Activity data exported successfully");
    }, 1000);
  };

  // Filter and sort activity entries
  const filteredActivities = activityEntries
    .filter((activity) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        activity.project.toLowerCase().includes(searchLower) ||
        activity.subcontractor.toLowerCase().includes(searchLower) ||
        activity.workOrderNumber.toLowerCase().includes(searchLower);

      // Type filter
      const matchesType = typeFilter === "all" || activity.type === typeFilter;

      // Status filter
      const matchesStatus = statusFilter === "all" || activity.status === statusFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange && dateRange.from) {
        const activityDate = new Date(activity.timestamp);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = activityDate >= fromDate && activityDate <= toDate;
        } else {
          matchesDateRange = activityDate >= fromDate;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDateRange;
    })
    .sort((a, b) => {
      if (sortField === "date") {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      // For other fields
      const valueA = a[sortField as keyof typeof a];
      const valueB = b[sortField as keyof typeof b];
      
      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Helper function to render activity type icon
  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "accounting":
        return <FileText className="h-4 w-4" />;
      case "project":
        return <Briefcase className="h-4 w-4" />;
      case "document":
        return <Calendar className="h-4 w-4" />;
      case "issue":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge variant="success">{status}</Badge>;
      case "Pending":
        return <Badge variant="outline">{status}</Badge>;
      case "Rejected":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Activity</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter activity by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                prefix={<Search className="h-4 w-4 mr-2 text-muted-foreground" />}
              />
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="accounting">Accounting</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("project")}
                  >
                    Project
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Subcontractor</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No activity found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{activity.project}</TableCell>
                    <TableCell>{activity.subcontractor}</TableCell>
                    <TableCell>{activity.workOrderNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityTypeIcon(activity.type)}
                        <span className="capitalize">{activity.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{activity.user.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllActivity;
