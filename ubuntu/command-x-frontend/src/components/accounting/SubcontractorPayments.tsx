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
import { WorkOrderData, SubcontractorData } from "@/services/api";
import { Search, ArrowUpDown, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SubcontractorPaymentsProps {
  subcontractors: SubcontractorData[];
  workOrders: WorkOrderData[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

const SubcontractorPayments: React.FC<SubcontractorPaymentsProps> = ({
  subcontractors,
  workOrders,
  // dateRange is currently unused
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("company_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Get subcontractor name by ID
  const getSubcontractorName = (subcontractorId: number | undefined | null) => {
    if (!subcontractorId) return "Unassigned";
    const subcontractor = subcontractors.find(
      (s) => s.subcontractor_id === subcontractorId
    );
    return subcontractor ? subcontractor.company_name : "Unknown";
  };

  // Calculate payment metrics for each subcontractor
  const subcontractorPaymentData = useMemo(() => {
    const data: Record<
      string,
      {
        subcontractorId: number;
        name: string;
        totalBilled: number;
        totalPaid: number;
        outstandingAmount: number;
        workOrderCount: number;
        completedCount: number;
        trade: string;
      }
    > = {};

    // Group work orders by subcontractor
    workOrders.forEach((wo) => {
      if (!wo.assigned_subcontractor_id) return;

      const subId = wo.assigned_subcontractor_id;
      const subName = getSubcontractorName(subId);
      const subcontractor = subcontractors.find(
        (s) => s.subcontractor_id === subId
      );

      if (!data[subId]) {
        data[subId] = {
          subcontractorId: subId,
          name: subName,
          totalBilled: 0,
          totalPaid: 0,
          outstandingAmount: 0,
          workOrderCount: 0,
          completedCount: 0,
          trade: subcontractor?.trade || "Unknown",
        };
      }

      data[subId].totalBilled += wo.amount_billed || 0;
      data[subId].totalPaid += wo.amount_paid || 0;
      data[subId].outstandingAmount =
        data[subId].totalBilled - data[subId].totalPaid;
      data[subId].workOrderCount += 1;
      if (wo.status === "Completed") {
        data[subId].completedCount += 1;
      }
    });

    return Object.values(data);
  }, [workOrders, subcontractors]);

  // Get payment status
  const getPaymentStatus = (billed: number, paid: number) => {
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

  // Filter and sort subcontractor data
  const filteredSubcontractors = useMemo(() => {
    return subcontractorPaymentData
      .filter((sub) => {
        // Search filter
        const searchMatch =
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.trade.toLowerCase().includes(searchTerm.toLowerCase());

        // Status filter
        const status = getPaymentStatus(sub.totalBilled, sub.totalPaid);
        const statusMatch = statusFilter === "all" || status === statusFilter;

        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        // Sort by selected field
        let comparison = 0;

        switch (sortField) {
          case "company_name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "trade":
            comparison = a.trade.localeCompare(b.trade);
            break;
          case "billed":
            comparison = a.totalBilled - b.totalBilled;
            break;
          case "paid":
            comparison = a.totalPaid - b.totalPaid;
            break;
          case "outstanding":
            comparison = a.outstandingAmount - b.outstandingAmount;
            break;
          default:
            comparison = 0;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    subcontractorPaymentData,
    searchTerm,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredSubcontractors.reduce(
      (acc, sub) => {
        return {
          billed: acc.billed + sub.totalBilled,
          paid: acc.paid + sub.totalPaid,
          outstanding: acc.outstanding + sub.outstandingAmount,
        };
      },
      { billed: 0, paid: 0, outstanding: 0 }
    );
  }, [filteredSubcontractors]);

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
                  placeholder="Search subcontractors..."
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Billed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.billed.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.paid.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Outstanding Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totals.outstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subcontractors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subcontractor Payments</CardTitle>
          <CardDescription>
            Showing {filteredSubcontractors.length} subcontractors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("company_name")}
                >
                  <div className="flex items-center">
                    Subcontractor
                    {sortField === "company_name" && (
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
                  onClick={() => handleSort("trade")}
                >
                  <div className="flex items-center">
                    Trade
                    {sortField === "trade" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Work Orders</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("billed")}
                >
                  <div className="flex items-center">
                    Total Billed
                    {sortField === "billed" && (
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
                  onClick={() => handleSort("paid")}
                >
                  <div className="flex items-center">
                    Total Paid
                    {sortField === "paid" && (
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
                  onClick={() => handleSort("outstanding")}
                >
                  <div className="flex items-center">
                    Outstanding
                    {sortField === "outstanding" && (
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortDirection === "desc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                </TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Payment Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubcontractors.map((sub) => {
                const paymentStatus = getPaymentStatus(
                  sub.totalBilled,
                  sub.totalPaid
                );
                const statusColor = getStatusColor(paymentStatus);
                const paymentProgress =
                  sub.totalBilled > 0
                    ? (sub.totalPaid / sub.totalBilled) * 100
                    : 0;

                return (
                  <TableRow key={sub.subcontractorId}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.trade}</TableCell>
                    <TableCell>
                      {sub.workOrderCount} ({sub.completedCount} completed)
                    </TableCell>
                    <TableCell>${sub.totalBilled.toLocaleString()}</TableCell>
                    <TableCell>${sub.totalPaid.toLocaleString()}</TableCell>
                    <TableCell>
                      ${sub.outstandingAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor}>{paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-[100px]">
                        <Progress value={paymentProgress} className="h-2" />
                        <div className="text-xs text-right mt-1">
                          {paymentProgress.toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
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

export default SubcontractorPayments;
