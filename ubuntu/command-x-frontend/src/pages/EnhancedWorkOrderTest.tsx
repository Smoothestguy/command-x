// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import EnhancedWorkOrderDialog from '../components/work-orders/EnhancedWorkOrderDialog';
import { getWorkOrders, getProjects } from '../services/api';
import { Briefcase, Users, DollarSign, Calendar } from 'lucide-react';

const EnhancedWorkOrderTest: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data
  const { data: workOrders, isLoading: workOrdersLoading } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => getWorkOrders(),
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const getProjectName = (projectId: number) => {
    return projects?.find(p => p.project_id === projectId)?.project_name || 'Unknown Project';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🚀 Enhanced Work Order Test</h1>
        <p className="text-gray-600">
          Test the enhanced work order functionality with multi-contractor assignments and editable payment items
        </p>
      </div>

      {/* Create Work Order Button */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Enhanced Work Order</CardTitle>
          <CardDescription>
            Test creating work orders with multiple contractors and payment item editing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full md:w-auto"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Create Enhanced Work Order
          </Button>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
          <CardDescription>
            View work orders with contractor assignments and payment items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workOrdersLoading ? (
            <div className="text-center py-8">Loading work orders...</div>
          ) : workOrders && workOrders.length > 0 ? (
            <div className="space-y-4">
              {workOrders.slice(0, 5).map((workOrder) => (
                <div key={workOrder.work_order_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{workOrder.description}</h3>
                      <p className="text-sm text-gray-600">
                        Project: {getProjectName(workOrder.project_id)}
                      </p>
                    </div>
                    <Badge variant={
                      workOrder.status === 'Completed' ? 'default' :
                      workOrder.status === 'In Progress' ? 'secondary' :
                      'outline'
                    }>
                      {workOrder.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span>
                        {workOrder.contractor_assignments?.length > 0 
                          ? `${workOrder.contractor_assignments.length} contractors assigned`
                          : workOrder.assigned_subcontractor_id 
                            ? '1 contractor assigned'
                            : 'No contractors assigned'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      <span>
                        ${workOrder.estimated_cost?.toFixed(2) || '0.00'} estimated
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      <span>
                        {workOrder.scheduled_date 
                          ? new Date(workOrder.scheduled_date).toLocaleDateString()
                          : 'No date scheduled'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Show contractor assignments if available */}
                  {workOrder.contractor_assignments && workOrder.contractor_assignments.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium text-sm mb-2">Contractor Assignments:</h4>
                      <div className="space-y-1">
                        {workOrder.contractor_assignments.map((assignment, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <span className="font-medium">{assignment.company_name}</span>
                            <span className="ml-2 text-gray-600">
                              {assignment.allocation_percentage}%
                            </span>
                            {assignment.role_description && (
                              <span className="ml-2 text-gray-500">
                                - {assignment.role_description}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show payment items if available */}
                  {workOrder.selectedPaymentItems && workOrder.selectedPaymentItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium text-sm mb-2">
                        Payment Items: {workOrder.selectedPaymentItems.length} assigned
                      </h4>
                    </div>
                  )}

                  {/* Show line items if available */}
                  {workOrder.newLineItems && workOrder.newLineItems.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <h4 className="font-medium text-sm mb-2">
                        Line Items: {workOrder.newLineItems.length} created
                      </h4>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No work orders found. Create your first enhanced work order!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Work Order Dialog */}
      <EnhancedWorkOrderDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

export default EnhancedWorkOrderTest;
