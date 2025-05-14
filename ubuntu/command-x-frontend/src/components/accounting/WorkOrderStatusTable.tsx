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

// Define the type for work order data
interface WorkOrderData {
  id: string;
  completed: number;
  notStarted: number;
  swoTotal: number;
  subMaterialAmount: number;
  woAmount: number;
  unbillableAmount: number;
  unbillableHeld: number;
  retainageHeld: number;
  retainageAmount: number;
  woDueAmount: number;
  pendingCOs: number;
  changeOrderNotes: string;
  percentComplete: number;
  percentOfPass: number;
  percentAssigned: number;
  percentCompleted: number;
  percentPending: number;
  percentStarted: number;
  dueDate: string;
  crewName: string;
}

// Sample data for the work order status table
export const workOrderData: WorkOrderData[] = [
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
const PercentageCell: React.FC<{ value: number; color?: string }> = ({
  value,
  color,
}) => {
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
    <TableCell className="text-center">
      <Badge className={`${bgColor} text-white w-14`}>{value}%</Badge>
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
const MobileWorkOrderCard: React.FC<{ data: WorkOrderData }> = ({ data }) => {
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
const MobileFinancialSummary: React.FC = () => {
  // Calculate totals from workOrderData
  const totalSWO = workOrderData.reduce((sum, item) => sum + item.swoTotal, 0);
  const totalRetainage = workOrderData.reduce(
    (sum, item) => sum + item.retainageAmount,
    0
  );
  const totalWOAmount = workOrderData.reduce(
    (sum, item) => sum + item.woAmount,
    0
  );
  const totalDue = workOrderData.reduce(
    (sum, item) => sum + item.woDueAmount,
    0
  );

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total SWO Amount:</span>
          <span className="font-semibold">${totalSWO.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Paid:</span>
          <span className="font-semibold">
            ${(totalWOAmount - totalDue).toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Outstanding Balance:</span>
          <span className="font-semibold">${totalDue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Retainage:</span>
          <span className="font-semibold">${totalRetainage.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Status Breakdown Card for mobile view
const MobileStatusBreakdown: React.FC = () => {
  // Calculate status counts
  const approved = workOrderData.filter(
    (item) => item.percentCompleted === 100
  ).length;
  const pending = workOrderData.filter(
    (item) => item.percentPending > 0
  ).length;
  const inProgress = workOrderData.filter(
    (item) => item.percentStarted > 0 && item.percentCompleted < 100
  ).length;
  const notStarted = workOrderData.filter(
    (item) => item.percentStarted === 0 && item.percentPending === 0
  ).length;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approved:</span>
            <span className="font-semibold">{approved}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending:</span>
            <span className="font-semibold">{pending}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">In Progress:</span>
            <span className="font-semibold">{inProgress}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Not Started:</span>
            <span className="font-semibold">{notStarted}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkOrderStatusTable: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Add resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobileView) {
    return (
      <div className="space-y-4">
        <MobileFinancialSummary />
        <MobileStatusBreakdown />
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-center">% Completed</TableHead>
            <TableHead className="text-center">% Work Not Started</TableHead>
            <TableHead className="text-center">SWO Total</TableHead>
            <TableHead className="text-center">Sub W.O. Material</TableHead>
            <TableHead className="text-center">W.O. Amount</TableHead>
            <TableHead className="text-center">Unbillable Amount</TableHead>
            <TableHead className="text-center">Unbillable Held</TableHead>
            <TableHead className="text-center">Retainage Held</TableHead>
            <TableHead className="text-center">Retainage Amount</TableHead>
            <TableHead className="text-center">W.O. Amount Due</TableHead>
            <TableHead className="text-center">Pending COs</TableHead>
            <TableHead className="text-center">Change Order Notes</TableHead>
            <TableHead className="text-center">Due Date</TableHead>
            <TableHead className="text-center">% Percent Failures</TableHead>
            <TableHead className="text-center">% of Pass</TableHead>
            <TableHead className="text-center">% Assigned</TableHead>
            <TableHead className="text-center">% Completed</TableHead>
            <TableHead className="text-center">% Pending</TableHead>
            <TableHead className="text-center">% Started</TableHead>
            <TableHead className="text-center">Crew Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrderData.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/50">
              <PercentageCell value={row.percentComplete} />
              <TableCell className="text-center">
                ${row.notStarted.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.swoTotal)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.subMaterialAmount)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.woAmount)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.unbillableAmount)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.unbillableHeld)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.retainageHeld)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.retainageAmount)}
              </TableCell>
              <TableCell className="text-center">
                {formatCurrency(row.woDueAmount)}
              </TableCell>
              <TableCell className="text-center">{row.pendingCOs}</TableCell>
              <TableCell className="text-center">
                {row.changeOrderNotes}
              </TableCell>
              <TableCell className="text-center">{row.dueDate}</TableCell>
              <PercentageCell value={0} color="bg-green-500" />
              <PercentageCell value={row.percentOfPass} />
              <PercentageCell value={row.percentAssigned} />
              <PercentageCell value={row.percentCompleted} />
              <PercentageCell value={row.percentPending} />
              <PercentageCell value={row.percentStarted} color="bg-red-500" />
              <TableCell>{row.crewName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrderStatusTable;
