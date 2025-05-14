import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

const WorkOrderStatusTable: React.FC = () => {
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
