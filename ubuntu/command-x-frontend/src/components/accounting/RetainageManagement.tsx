import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectData, WorkOrderData } from "@/services/api";
import { format, addMonths } from "date-fns";
import { Search, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

interface RetainageManagementProps {
  workOrders: WorkOrderData[];
  projects: ProjectData[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const RetainageManagement: React.FC<RetainageManagementProps> = ({
  workOrders,
  projects,
  dateRange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get project name by ID
  const getProjectName = (projectId: string | number) => {
    const project = projects.find(
      (p) => String(p.project_id) === String(projectId)
    );
    return project ? project.project_name : "Unknown Project";
  };

  // Calculate retainage amount
  const calculateRetainage = (workOrder: WorkOrderData) => {
    const billed = workOrder.amount_billed || 0;
    const percentage = workOrder.retainage_percentage || 0;
    return (billed * percentage) / 100;
  };

  // Simulate retainage release date (in a real app, this would come from the database)
  const getRetainageReleaseDate = (workOrder: WorkOrderData) => {
    if (!workOrder.completion_date) return null;

    // Simulate: Retainage is typically released 30-90 days after completion
    return addMonths(new Date(workOrder.completion_date), 3);
  };

  // Determine retainage status
  const getRetainageStatus = (workOrder: WorkOrderData) => {
    if (!workOrder.completion_date) return "Not Applicable";

    const retainageAmount = calculateRetainage(workOrder);
    if (retainageAmount <= 0) return "No Retainage";

    const releaseDate = getRetainageReleaseDate(workOrder);
    if (!releaseDate) return "Pending";

    const today = new Date();
    if (today > releaseDate) return "Ready for Release";

    return "Holding";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready for Release":
        return "bg-green-100 text-green-800";
      case "Holding":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "No Retainage":
        return "bg-gray-100 text-gray-800";
      case "Not Applicable":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter work orders with retainage
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      // Only include work orders with retainage
      const hasRetainage =
        (wo.retainage_percentage || 0) > 0 && (wo.amount_billed || 0) > 0;
      if (!hasRetainage && statusFilter !== "all") return false;

      // Search filter
        const searchMatch =
          wo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getProjectName(wo.project_id)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

      // Project filter
      const projectMatch =
        projectFilter === "all" || wo.project_id.toString() === projectFilter;

      // Status filter
      const retainageStatus = getRetainageStatus(wo);
      const statusMatch =
        statusFilter === "all" || retainageStatus === statusFilter;

      // Date range filter
      let dateMatch = true;
      if (dateRange.from && wo.completion_date) {
        const completionDate = new Date(wo.completion_date);
        dateMatch = completionDate >= dateRange.from;
      }
      if (dateRange.to && wo.completion_date && dateMatch) {
        const completionDate = new Date(wo.completion_date);
        dateMatch = completionDate <= dateRange.to;
      }

      return searchMatch && projectMatch && statusMatch && dateMatch;
    });
  }, [
    workOrders,
    searchTerm,
    projectFilter,
    statusFilter,
    dateRange,
    projects,
  ]);

  // Calculate total retainage
  const totalRetainage = useMemo(() => {
    return filteredWorkOrders.reduce(
      (sum, wo) => sum + calculateRetainage(wo),
      0
    );
  }, [filteredWorkOrders]);

  // Calculate retainage by status
  const retainageByStatus = useMemo(() => {
    return filteredWorkOrders.reduce((acc, wo) => {
      const status = getRetainageStatus(wo);
      const amount = calculateRetainage(wo);
      acc[status] = (acc[status] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredWorkOrders]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Retainage Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Ready for Release">
                    Ready for Release
                  </SelectItem>
                  <SelectItem value="Holding">Holding</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="No Retainage">No Retainage</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.project_id}
                      value={project.project_id?.toString() || ""}
                    >
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Retainage Held
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRetainage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {filteredWorkOrders.length} work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ready for Release
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(retainageByStatus["Ready for Release"] || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                filteredWorkOrders.filter(
                  (wo) => getRetainageStatus(wo) === "Ready for Release"
                ).length
              }{" "}
              work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Holding
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(retainageByStatus["Holding"] || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                filteredWorkOrders.filter(
                  (wo) => getRetainageStatus(wo) === "Holding"
                ).length
              }{" "}
              work orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Retainage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retainage Management</CardTitle>
          <CardDescription>
            Showing {filteredWorkOrders.length} work orders with retainage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Amount Billed</TableHead>
                <TableHead>Retainage %</TableHead>
                <TableHead>Retainage Amount</TableHead>
                <TableHead>Est. Release Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((workOrder) => {
                const retainageAmount = calculateRetainage(workOrder);
                const releaseDate = getRetainageReleaseDate(workOrder);
                const status = getRetainageStatus(workOrder);
                const statusColor = getStatusColor(status);

                return (
                  <TableRow key={workOrder.work_order_id}>
                    <TableCell className="font-medium">
                      {workOrder.work_order_id}
                    </TableCell>
                    <TableCell>
                      {getProjectName(workOrder.project_id)}
                    </TableCell>
                    <TableCell>
                      {workOrder.completion_date
                        ? format(
                            new Date(workOrder.completion_date),
                            "MMM d, yyyy"
                          )
                        : "Not completed"}
                    </TableCell>
                    <TableCell>
                      ${workOrder.amount_billed?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      {workOrder.retainage_percentage || 0}%
                    </TableCell>
                    <TableCell>${retainageAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      {releaseDate ? format(releaseDate, "MMM d, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={status !== "Ready for Release"}
                      >
                        Release
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetainageManagement;
