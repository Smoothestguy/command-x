import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjectBudgetSummary, ProjectBudgetSummary as BudgetSummaryType } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Briefcase,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ProjectBudgetSummaryProps {
  projectId: number;
  className?: string;
}

const ProjectBudgetSummary: React.FC<ProjectBudgetSummaryProps> = ({
  projectId,
  className = "",
}) => {
  const { data: budgetSummary, isLoading, error } = useQuery({
    queryKey: ["projectBudgetSummary", projectId],
    queryFn: () => getProjectBudgetSummary(projectId),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !budgetSummary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load budget summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    total_budget,
    assigned_amount,
    unassigned_amount,
    assigned_percentage,
    work_orders_count,
    payment_items_count,
    unassigned_items_count,
  } = budgetSummary;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAssignmentStatus = () => {
    if (assigned_percentage >= 90) {
      return { color: "text-green-600", icon: CheckCircle, label: "Fully Assigned" };
    } else if (assigned_percentage >= 70) {
      return { color: "text-yellow-600", icon: TrendingUp, label: "Well Assigned" };
    } else if (assigned_percentage >= 40) {
      return { color: "text-orange-600", icon: TrendingDown, label: "Partially Assigned" };
    } else {
      return { color: "text-red-600", icon: AlertTriangle, label: "Needs Assignment" };
    }
  };

  const status = getAssignmentStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Project Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(total_budget)}
            </div>
            <div className="text-sm text-blue-600">Total Budget</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(assigned_amount)}
            </div>
            <div className="text-sm text-green-600">Assigned</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(unassigned_amount)}
            </div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </div>
        </div>

        {/* Assignment Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Assignment Progress</span>
            <Badge variant="outline" className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          <Progress value={assigned_percentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="font-medium">{assigned_percentage.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Work Orders and Items Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-lg font-semibold">{work_orders_count}</div>
              <div className="text-sm text-gray-600">Work Orders</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-lg font-semibold">{payment_items_count}</div>
              <div className="text-sm text-gray-600">Payment Items</div>
            </div>
          </div>
        </div>

        {/* Unassigned Items Alert */}
        {unassigned_items_count > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="text-sm">
                <span className="font-medium text-yellow-800">
                  {unassigned_items_count} payment items
                </span>
                <span className="text-yellow-700"> are not assigned to any work order</span>
              </div>
            </div>
          </div>
        )}

        {/* Budget Health Indicator */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2">Budget Health</div>
          <div className="flex items-center gap-2">
            {assigned_percentage >= 80 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Budget is well-allocated across work orders
                </span>
              </>
            ) : assigned_percentage >= 50 ? (
              <>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  Consider assigning more items to work orders
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Most budget items need to be assigned to work orders
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectBudgetSummary;
