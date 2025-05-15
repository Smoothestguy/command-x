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
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the type for payment status data
interface PaymentStatusData {
  id: string;
  projectName: string;
  subcontractorsCompany: string;
  subWorkOrderNumber: string;
  inspectionStatus: string;
  paymentStatus: string;
  qcNotApproved: number;
  workOrderId: string;
  fullName: string;
  fullAddress: string;
  itemCount: number;
  pendingCount: number;
  startedCount: number;
  completeCount: number;
  qcTotalCount: number;
  percentApproved: number;
  percentWaitingApproval: number;
  percentComplete: number;
  amountWaitingApproval: number;
}

// Sample data for the payment status table
const paymentStatusData: PaymentStatusData[] = [
  {
    id: "1",
    projectName: "C-145-HRP-Workforce",
    subcontractorsCompany: "Fairfield",
    subWorkOrderNumber: "Completed",
    inspectionStatus: "Pending QC",
    paymentStatus: "Eligible for Payment",
    qcNotApproved: 0,
    workOrderId: "16043",
    fullName: "Mattie Allen",
    fullAddress: "118 Tom Hall St America GA 31719",
    itemCount: 239,
    pendingCount: 0,
    startedCount: 0,
    completeCount: 239,
    qcTotalCount: 239,
    percentApproved: 0,
    percentWaitingApproval: 0,
    percentComplete: 100,
    amountWaitingApproval: 0,
  },
  {
    id: "2",
    projectName: "C-145-HRP-Workforce",
    subcontractorsCompany: "Fairfield",
    subWorkOrderNumber: "Completed",
    inspectionStatus: "Pending QC",
    paymentStatus: "Eligible for Payment",
    qcNotApproved: 0,
    workOrderId: "18005",
    fullName: "Alice Boone",
    fullAddress: "101 Linnie St America GA 31719",
    itemCount: 219,
    pendingCount: 0,
    startedCount: 0,
    completeCount: 219,
    qcTotalCount: 219,
    percentApproved: 0,
    percentWaitingApproval: 0,
    percentComplete: 100,
    amountWaitingApproval: 0,
  },
  {
    id: "3",
    projectName: "C-075-LA-RELA-Lemoine",
    subcontractorsCompany: "Fairfield",
    subWorkOrderNumber: "Completed",
    inspectionStatus: "Pending QC",
    paymentStatus: "Eligible for Payment",
    qcNotApproved: 0,
    workOrderId: "240799",
    fullName: "Lydia Jones",
    fullAddress: "1215 General Nicholls Street Thibodaux LA 70301",
    itemCount: 1,
    pendingCount: 0,
    startedCount: 0,
    completeCount: 1,
    qcTotalCount: 1,
    percentApproved: 0,
    percentWaitingApproval: 0,
    percentComplete: 100,
    amountWaitingApproval: 0,
  },
  {
    id: "4",
    projectName: "C-075-LA-RELA-Lemoine",
    subcontractorsCompany: "Fairfield",
    subWorkOrderNumber: "Completed",
    inspectionStatus: "Pending QC",
    paymentStatus: "Eligible for Payment",
    qcNotApproved: 0,
    workOrderId: "217929",
    fullName: "Barbara Sills",
    fullAddress: "421 West McClellan Street Ponchatoula LA 70454",
    itemCount: 1,
    pendingCount: 0,
    startedCount: 0,
    completeCount: 1,
    qcTotalCount: 1,
    percentApproved: 0,
    percentWaitingApproval: 0,
    percentComplete: 100,
    amountWaitingApproval: 0,
  },
];

// Helper function to render status badges
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = "";

  if (status === "Completed") {
    bgColor = "bg-green-500";
  } else if (status === "Pending QC") {
    bgColor = "bg-yellow-500";
  } else if (status === "Eligible for Payment") {
    bgColor = "bg-orange-500";
  } else {
    bgColor = "bg-blue-500";
  }

  return <Badge className={`${bgColor} text-white`}>{status}</Badge>;
};

// Helper function to render percentage cells with color coding
const PercentageCell: React.FC<{ value: number }> = ({ value }) => {
  let bgColor = "";

  if (value === 0) {
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
    ? "$0.00"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
};

const PaymentStatusTable: React.FC = () => {
  const { toast } = useToast();
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="text-center">Action</TableHead>
            <TableHead className="text-center">Project Name</TableHead>
            <TableHead className="text-center">
              Subcontractors Company
            </TableHead>
            <TableHead className="text-center">Sub Work Order Status</TableHead>
            <TableHead className="text-center">Inspection Status</TableHead>
            <TableHead className="text-center">Payment Status</TableHead>
            <TableHead className="text-center">QC Not Approved</TableHead>
            <TableHead className="text-center">Work Order ID Number</TableHead>
            <TableHead className="text-center">Full Name</TableHead>
            <TableHead className="text-center">Full Address</TableHead>
            <TableHead className="text-center">Item Count</TableHead>
            <TableHead className="text-center">Pending Count</TableHead>
            <TableHead className="text-center">Started Count</TableHead>
            <TableHead className="text-center">Complete Count</TableHead>
            <TableHead className="text-center">QC Total Count</TableHead>
            <TableHead className="text-center">% QC Approved</TableHead>
            <TableHead className="text-center">
              % Value Waiting Approval
            </TableHead>
            <TableHead className="text-center">% Value Complete</TableHead>
            <TableHead className="text-center">
              Amount Waiting Approval
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentStatusData.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/50">
              <TableCell className="text-center">
                <div className="flex space-x-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      // Show payment details
                      toast({
                        title: "Viewing Payment Details",
                        description: `Payment details for ${row.fullName} - Work Order ID: ${row.workOrderId}`,
                      });
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      // Edit payment details
                      toast({
                        title: "Editing Payment Details",
                        description: `Now editing payment details for ${row.fullName} - Work Order ID: ${row.workOrderId}`,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{row.projectName}</TableCell>
              <TableCell>{row.subcontractorsCompany}</TableCell>
              <TableCell className="text-center">
                <StatusBadge status={row.subWorkOrderNumber} />
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={row.inspectionStatus} />
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={row.paymentStatus} />
              </TableCell>
              <TableCell className="text-center">{row.qcNotApproved}</TableCell>
              <TableCell className="text-center">{row.workOrderId}</TableCell>
              <TableCell>{row.fullName}</TableCell>
              <TableCell>{row.fullAddress}</TableCell>
              <TableCell className="text-center">{row.itemCount}</TableCell>
              <TableCell className="text-center">{row.pendingCount}</TableCell>
              <TableCell className="text-center">{row.startedCount}</TableCell>
              <TableCell className="text-center">{row.completeCount}</TableCell>
              <TableCell className="text-center">{row.qcTotalCount}</TableCell>
              <PercentageCell value={row.percentApproved} />
              <PercentageCell value={row.percentWaitingApproval} />
              <PercentageCell value={row.percentComplete} />
              <TableCell className="text-center">
                {formatCurrency(row.amountWaitingApproval)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentStatusTable;
