import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  WorkOrderFinancialData,
  getWorkOrderFinancialData,
  getWorkOrderFinancialSummary,
} from "@/services/accountingApi";
import { Skeleton } from "@/components/ui/skeleton";

// Use the WorkOrderFinancialData type from accountingApi.ts

// Sample data for the work order status table (used as fallback)
const fallbackWorkOrderData: WorkOrderFinancialData[] = [
  {
    id: "1",
    completed: 0,
    notStarted: 0,
    swoTotal: 33755.36,
    subMaterialAmount: 20432.27,
    woAmount: 14202.61,
    unbillableAmount: 0,
    unbillableHeld: 0,
    retainageHeld: 0,
    retainageAmount: 878.92,
    woDueAmount: 0,
    pendingCOs: 0,
    changeOrderNotes: "",
    percentComplete: 0,
    percentOfPass: 100,
    percentAssigned: 82.01,
    percentCompleted: 100,
    percentPending: 0,
    percentStarted: 0,
    dueDate: "4/4/2025",
    crewName: "Abel Duran",
  },
  {
    id: "2",
    completed: 0,
    notStarted: 0,
    swoTotal: 23500.76,
    subMaterialAmount: 11339.33,
    woAmount: 12053.27,
    unbillableAmount: 0,
    unbillableHeld: 0,
    retainageHeld: 0,
    retainageAmount: 108.16,
    woDueAmount: 0,
    pendingCOs: 0,
    changeOrderNotes: "",
    percentComplete: 0,
    percentOfPass: 100,
    percentAssigned: 100,
    percentCompleted: 100,
    percentPending: 0,
    percentStarted: 0,
    dueDate: "4/4/2025",
    crewName: "",
  },
  {
    id: "3",
    completed: 0,
    notStarted: 0,
    swoTotal: 6644.95,
    subMaterialAmount: 0,
    woAmount: 6644.95,
    unbillableAmount: 0,
    unbillableHeld: 0,
    retainageHeld: 0,
    retainageAmount: 0,
    woDueAmount: 0,
    pendingCOs: 0,
    changeOrderNotes: "",
    percentComplete: 0,
    percentOfPass: 100,
    percentAssigned: 0,
    percentCompleted: 100,
    percentPending: 0,
    percentStarted: 0,
    dueDate: "3/24/2025",
    crewName: "",
  },
  {
    id: "4",
    completed: 0,
    notStarted: 0,
    swoTotal: 5769.18,
    subMaterialAmount: 0,
    woAmount: 5769.18,
    unbillableAmount: 0,
    unbillableHeld: 0,
    retainageHeld: 0,
    retainageAmount: 0,
    woDueAmount: 0,
    pendingCOs: 0,
    changeOrderNotes: "",
    percentComplete: 0,
    percentOfPass: 100,
    percentAssigned: 0,
    percentCompleted: 100,
    percentPending: 0,
    percentStarted: 0,
    dueDate: "3/7/2025",
    crewName: "",
  },
];

// Helper function to render percentage cells with color coding
const PercentageCell: React.FC<{
  value: number;
  color?: string;
  className?: string;
}> = ({ value, color, className = "" }) => {
  let bgColor = "";

  if (color) {
    bgColor = color;
  } else if (value === 0) {
    bgColor = "bg-red-500";
  } else if (value === 100) {
    bgColor = "bg-green-500";
  } else if (value > 80) {
    bgColor = "bg-green-500";
  } else if (value > 50) {
    bgColor = "bg-yellow-500";
  } else {
    bgColor = "bg-red-500";
  }

  return (
    <TableCell className={`text-center ${className}`}>
      <Badge
        className={`${bgColor} text-white w-20 font-medium text-sm px-3 py-1`}
      >
        {value}%
      </Badge>
    </TableCell>
  );
};

// Format currency values
const formatCurrency = (value: number) => {
  return value === 0
    ? "$0"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
};

// Mobile card view for work order status
const MobileWorkOrderCard: React.FC<{ data: WorkOrderFinancialData }> = ({
  data,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span>Work Order #{data.id}</span>
          <span>{data.dueDate}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">SWO Total</span>
            <span className="font-medium">{formatCurrency(data.swoTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">W.O. Amount</span>
            <span className="font-medium">{formatCurrency(data.woAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              Retainage Amount
            </span>
            <span className="font-medium">
              {formatCurrency(data.retainageAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              W.O. Amount Due
            </span>
            <span className="font-medium">
              {formatCurrency(data.woDueAmount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 mt-3">
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs">% Complete</span>
            <Badge
              className={`${
                data.percentComplete === 0
                  ? "bg-red-500"
                  : data.percentComplete === 100
                  ? "bg-green-500"
                  : "bg-yellow-500"
              } text-white mt-1`}
            >
              {data.percentComplete}%
            </Badge>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs">% Assigned</span>
            <Badge
              className={`${
                data.percentAssigned === 0
                  ? "bg-red-500"
                  : data.percentAssigned === 100
                  ? "bg-green-500"
                  : "bg-yellow-500"
              } text-white mt-1`}
            >
              {data.percentAssigned}%
            </Badge>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs">% Pass</span>
            <Badge
              className={`${
                data.percentOfPass === 0
                  ? "bg-red-500"
                  : data.percentOfPass === 100
                  ? "bg-green-500"
                  : "bg-yellow-500"
              } text-white mt-1`}
            >
              {data.percentOfPass}%
            </Badge>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-muted-foreground text-xs">% Started</span>
            <Badge className="bg-red-500 text-white mt-1">
              {data.percentStarted}%
            </Badge>
          </div>
        </div>

        {data.crewName && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-muted-foreground text-xs">Crew: </span>
            <span>{data.crewName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Financial Summary Card for mobile view
const MobileFinancialSummary: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total SWO Amount:</span>
          <span className="font-semibold">${summary.totalSWO.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Paid:</span>
          <span className="font-semibold">
            ${(summary.totalWOAmount - summary.totalDue).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Outstanding Balance:</span>
          <span className="font-semibold">${summary.totalDue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Retainage:</span>
          <span className="font-semibold">
            ${summary.totalRetainage.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Status Breakdown Card for mobile view
const MobileStatusBreakdown: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed:</span>
            <span className="font-semibold">{summary.completed}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">In Progress:</span>
            <span className="font-semibold">{summary.inProgress}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Not Started:</span>
            <span className="font-semibold">{summary.notStarted}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{summary.totalCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface WorkOrderStatusTableProps {
  projectId?: number;
}

const WorkOrderStatusTable: React.FC<WorkOrderStatusTableProps> = ({
  projectId,
}) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Fetch work order financial data
  const {
    data: workOrderData,
    isLoading: isLoadingData,
    error: dataError,
  } = useQuery({
    queryKey: ["workOrderFinancialData", projectId],
    queryFn: () => getWorkOrderFinancialData(projectId),
  });

  // Fetch financial summary
  const {
    data: financialSummary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({
    queryKey: ["workOrderFinancialSummary", projectId],
    queryFn: () => getWorkOrderFinancialSummary(projectId),
  });

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (isLoadingData || isLoadingSummary) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  // Error state
  if (dataError || summaryError || !workOrderData || !financialSummary) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        Error loading work order financial data. Please try again later.
      </div>
    );
  }

  if (isMobileView) {
    return (
      <div className="space-y-4">
        <MobileFinancialSummary summary={financialSummary} />
        <MobileStatusBreakdown summary={financialSummary} />
        <h3 className="text-lg font-medium mt-6 mb-2">
          Work Order Status Overview
        </h3>
        {workOrderData.map((row) => (
          <MobileWorkOrderCard key={row.id} data={row} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="rounded-md border overflow-x-auto max-w-full"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <Table className="accounting-table w-full min-w-max" responsive={true}>
        <TableHeader className="bg-muted/50 sticky top-0 z-10">
          <TableRow>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Completed
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Not Started
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              SWO Total
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Sub W.O. Material
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              W.O. Amount
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Unbillable Amount
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Unbillable Held
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Retainage Held
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Retainage Amount
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              W.O. Amount Due
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Pending COs
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Due Date
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % of Pass
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Assigned
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Completed
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Pending
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              % Started
            </TableHead>
            <TableHead className="text-center font-semibold whitespace-nowrap px-2 py-2">
              Crew Name
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrderData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={18} className="text-center py-8">
                No work order data available
              </TableCell>
            </TableRow>
          ) : (
            workOrderData.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                <PercentageCell
                  value={row.percentComplete}
                  className="whitespace-nowrap px-2 py-2"
                />
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  ${row.notStarted.toFixed(2)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.swoTotal)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.subMaterialAmount)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.woAmount)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.unbillableAmount)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.unbillableHeld)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.retainageHeld)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.retainageAmount)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {formatCurrency(row.woDueAmount)}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {row.pendingCOs}
                </TableCell>
                <TableCell className="text-center whitespace-nowrap px-2 py-2">
                  {row.dueDate}
                </TableCell>
                <PercentageCell
                  value={row.percentOfPass}
                  className="whitespace-nowrap px-2 py-2"
                />
                <PercentageCell
                  value={row.percentAssigned}
                  className="whitespace-nowrap px-2 py-2"
                />
                <PercentageCell
                  value={row.percentCompleted}
                  className="whitespace-nowrap px-2 py-2"
                />
                <PercentageCell
                  value={row.percentPending}
                  className="whitespace-nowrap px-2 py-2"
                />
                <PercentageCell
                  value={row.percentStarted}
                  color="bg-red-500"
                  className="whitespace-nowrap px-2 py-2"
                />
                <TableCell className="whitespace-nowrap px-2 py-2">
                  {row.crewName}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrderStatusTable;
