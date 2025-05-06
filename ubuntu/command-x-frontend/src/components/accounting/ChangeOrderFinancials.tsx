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
import { format } from "date-fns";
import {
  Search,
  ArrowUpDown,
  FileText,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Mock change order data (in a real app, this would come from the API)
interface ChangeOrderData {
  id: number;
  project_id: number;
  work_order_id?: number;
  description: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  created_at: string;
  approved_at?: string;
  completed_at?: string;
}

interface ChangeOrderFinancialsProps {
  projects: ProjectData[];
  workOrders: WorkOrderData[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const ChangeOrderFinancials: React.FC<ChangeOrderFinancialsProps> = ({
  projects,
  workOrders,
  dateRange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mock change order data
  const mockChangeOrders: ChangeOrderData[] = useMemo(() => {
    // Generate some mock change orders based on existing projects and work orders
    const changeOrders: ChangeOrderData[] = [];

    projects.forEach((project) => {
      // Add 1-3 change orders per project
      const numChangeOrders = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numChangeOrders; i++) {
        const projectWorkOrders = workOrders.filter(
          (wo) => wo.project_id === project.project_id
        );
        const workOrderId =
          projectWorkOrders.length > 0
            ? projectWorkOrders[
                Math.floor(Math.random() * projectWorkOrders.length)
              ].work_order_id
            : undefined;

        const amount = Math.floor(Math.random() * 50000) + 1000;
        const status = ["Pending", "Approved", "Rejected", "Completed"][
          Math.floor(Math.random() * 4)
        ] as ChangeOrderData["status"];

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 60));

        let approvedAt;
        let completedAt;

        if (status === "Approved" || status === "Completed") {
          approvedAt = new Date(createdAt);
          approvedAt.setDate(
            approvedAt.getDate() + Math.floor(Math.random() * 10) + 1
          );
        }

        if (status === "Completed") {
          completedAt = new Date(approvedAt!);
          completedAt.setDate(
            completedAt.getDate() + Math.floor(Math.random() * 20) + 5
          );
        }

        changeOrders.push({
          id: changeOrders.length + 1,
          project_id: project.project_id!,
          work_order_id: workOrderId,
          description: `Change Order ${i + 1} for ${project.project_name}`,
          amount,
          status,
          created_at: createdAt.toISOString(),
          approved_at: approvedAt?.toISOString(),
          completed_at: completedAt?.toISOString(),
        });
      }
    });

    return changeOrders;
  }, [projects, workOrders]);

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.project_id === projectId);
    return project ? project.project_name : "Unknown Project";
  };

  // Get work order description by ID (commented out as currently unused)
  /*
  const getWorkOrderDescription = (workOrderId: number | undefined) => {
    if (!workOrderId) return "N/A";
    const workOrder = workOrders.find((wo) => wo.work_order_id === workOrderId);
    return workOrder ? workOrder.description : "Unknown Work Order";
  };
  */

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter and sort change orders
  const filteredChangeOrders = useMemo(() => {
    return mockChangeOrders
      .filter((co) => {
        // Search filter
        const searchMatch =
          co.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getProjectName(co.project_id)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        // Status filter
        const statusMatch =
          statusFilter === "all" || co.status === statusFilter;

        // Project filter
        const projectMatch =
          projectFilter === "all" || co.project_id.toString() === projectFilter;

        // Date range filter
        let dateMatch = true;
        if (dateRange.from) {
          const createdDate = new Date(co.created_at);
          dateMatch = createdDate >= dateRange.from;
        }
        if (dateRange.to && dateMatch) {
          const createdDate = new Date(co.created_at);
          dateMatch = createdDate <= dateRange.to;
        }

        return searchMatch && statusMatch && projectMatch && dateMatch;
      })
      .sort((a, b) => {
        // Sort by selected field
        let comparison = 0;

        switch (sortField) {
          case "created_at":
            comparison =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
            break;
          case "amount":
            comparison = a.amount - b.amount;
            break;
          case "project":
            comparison = getProjectName(a.project_id).localeCompare(
              getProjectName(b.project_id)
            );
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          default:
            comparison = 0;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    mockChangeOrders,
    searchTerm,
    statusFilter,
    projectFilter,
    dateRange,
    sortField,
    sortDirection,
    projects,
  ]);

  // Calculate totals
  const totals = useMemo(() => {
    const approved = filteredChangeOrders
      .filter((co) => co.status === "Approved" || co.status === "Completed")
      .reduce((sum, co) => sum + co.amount, 0);

    const pending = filteredChangeOrders
      .filter((co) => co.status === "Pending")
      .reduce((sum, co) => sum + co.amount, 0);

    const rejected = filteredChangeOrders
      .filter((co) => co.status === "Rejected")
      .reduce((sum, co) => sum + co.amount, 0);

    return { approved, pending, rejected, total: approved + pending };
  }, [filteredChangeOrders]);

  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
                  placeholder="Search change orders..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
            <CardTitle className="text-sm">Total Change Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredChangeOrders.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.approved.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.pending.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change Order Financials</CardTitle>
          <CardDescription>
            Showing {filteredChangeOrders.length} change orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("project")}
                >
                  <div className="flex items-center">
                    Project
                    {sortField === "project" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Description</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center">
                    Amount
                    {sortField === "amount" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === "created_at" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChangeOrders.map((changeOrder) => {
                const statusColor = getStatusColor(changeOrder.status);

                return (
                  <TableRow key={changeOrder.id}>
                    <TableCell className="font-medium">
                      CO-{changeOrder.id}
                    </TableCell>
                    <TableCell>
                      {getProjectName(changeOrder.project_id)}
                    </TableCell>
                    <TableCell>
                      {changeOrder.work_order_id
                        ? `WO-${changeOrder.work_order_id}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>{changeOrder.description}</TableCell>
                    <TableCell>
                      ${changeOrder.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>
                        {changeOrder.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(changeOrder.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {changeOrder.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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

export default ChangeOrderFinancials;
