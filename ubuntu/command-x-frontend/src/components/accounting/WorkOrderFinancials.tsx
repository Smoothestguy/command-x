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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectData, WorkOrderData } from "@/services/api";
import { format } from "date-fns";
import { Search, Eye, FileText } from "lucide-react";

interface WorkOrderFinancialsProps {
  workOrders: WorkOrderData[];
  projects: ProjectData[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const WorkOrderFinancials: React.FC<WorkOrderFinancialsProps> = ({
  workOrders,
  projects,
  dateRange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  // const [selectedWorkOrder, setSelectedWorkOrder] =
  //   useState<WorkOrderData | null>(null);

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.project_id === projectId);
    return project ? project.project_name : "Unknown Project";
  };

  // Calculate payment status
  const getPaymentStatus = (workOrder: WorkOrderData) => {
    const billed = workOrder.amount_billed || 0;
    const paid = workOrder.amount_paid || 0;

    if (billed === 0) return "Not Billed";
    if (paid === 0) return "Unpaid";
    if (paid < billed) return "Partially Paid";
    return "Paid";
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      case "Not Billed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      // Search filter
      const searchMatch =
        wo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProjectName(wo.project_id)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch =
        statusFilter === "all" || getPaymentStatus(wo) === statusFilter;

      // Project filter
      const projectMatch =
        projectFilter === "all" || wo.project_id.toString() === projectFilter;

      // Date range filter
      let dateMatch = true;
      if (dateRange.from && wo.scheduled_date) {
        const scheduledDate = new Date(wo.scheduled_date);
        dateMatch = scheduledDate >= dateRange.from;
      }
      if (dateRange.to && wo.scheduled_date && dateMatch) {
        const scheduledDate = new Date(wo.scheduled_date);
        dateMatch = scheduledDate <= dateRange.to;
      }

      return searchMatch && statusMatch && projectMatch && dateMatch;
    });
  }, [
    workOrders,
    searchTerm,
    statusFilter,
    projectFilter,
    dateRange,
    projects,
  ]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredWorkOrders.reduce(
      (acc, wo) => {
        return {
          estimated: acc.estimated + (wo.estimated_cost || 0),
          actual: acc.actual + (wo.actual_cost || 0),
          billed: acc.billed + (wo.amount_billed || 0),
          paid: acc.paid + (wo.amount_paid || 0),
        };
      },
      { estimated: 0, actual: 0, billed: 0, paid: 0 }
    );
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
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Not Billed">Not Billed</SelectItem>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Estimated Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.estimated.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Actual Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.actual.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Amount Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.billed.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.paid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Financials</CardTitle>
          <CardDescription>
            Showing {filteredWorkOrders.length} of {workOrders.length} work
            orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Estimated Cost</TableHead>
                <TableHead>Actual Cost</TableHead>
                <TableHead>Billed</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkOrders.map((workOrder) => {
                const paymentStatus = getPaymentStatus(workOrder);
                const statusColor = getStatusColor(paymentStatus);

                return (
                  <TableRow key={workOrder.work_order_id}>
                    <TableCell className="font-medium">
                      {workOrder.work_order_id}
                    </TableCell>
                    <TableCell>
                      {getProjectName(workOrder.project_id)}
                    </TableCell>
                    <TableCell>
                      {workOrder.scheduled_date
                        ? format(
                            new Date(workOrder.scheduled_date),
                            "MMM d, yyyy"
                          )
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      ${workOrder.estimated_cost?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      ${workOrder.actual_cost?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      ${workOrder.amount_billed?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      ${workOrder.amount_paid?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            alert(
                              `Viewing details for Work Order #${workOrder.work_order_id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
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

export default WorkOrderFinancials;
