import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder, WorkOrderData, getProjects, ProjectData } from '../services/api'; // Assuming getProjects is available
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming Select is available
import { Textarea } from '@/components/ui/textarea'; // Assuming Textarea is available
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const WorkOrderSchema = Yup.object().shape({
  project_id: Yup.number().required('Project is required'),
  description: Yup.string().required('Description is required'),
  assigned_subcontractor_id: Yup.number().nullable(),
  status: Yup.string(),
  scheduled_date: Yup.date().nullable(),
  completion_date: Yup.date().nullable(),
  estimated_cost: Yup.number().nullable().positive('Estimated cost must be positive'),
  // Add other validations as needed
});

const WorkOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData | null>(null);

  // Fetch Projects for dropdown
  const { data: projects } = useQuery<ProjectData[], Error>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Fetch Work Orders
  // TODO: Add filtering by project if needed
  const { data: workOrders, isLoading, error } = useQuery<WorkOrderData[], Error>({
    queryKey: ['workOrders'],
    queryFn: () => getWorkOrders(), // Fetch all for now
  });

  // --- Mutations --- 

  // Create Work Order
  const createMutation = useMutation({
    mutationFn: createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      setIsCreateDialogOpen(false);
      toast.success('Work Order created successfully!');
    },
    onError: (err) => {
      console.error('Error creating work order:', err);
      toast.error('Failed to create work order.');
    },
  });

  // Update Work Order
  const updateMutation = useMutation({
    mutationFn: (workOrderData: Partial<WorkOrderData>) => {
        if (!selectedWorkOrder?.work_order_id) throw new Error('No work order selected for update');
        return updateWorkOrder(selectedWorkOrder.work_order_id, workOrderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      setIsEditDialogOpen(false);
      setSelectedWorkOrder(null);
      toast.success('Work Order updated successfully!');
    },
    onError: (err) => {
      console.error('Error updating work order:', err);
      toast.error('Failed to update work order.');
    },
  });

  // Delete Work Order
  const deleteMutation = useMutation({
    mutationFn: deleteWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      toast.success('Work Order deleted successfully!');
    },
    onError: (err) => {
      console.error('Error deleting work order:', err);
      toast.error('Failed to delete work order.');
    },
  });

  // --- Form Handling (using Formik) --- 

  const formik = useFormik<Partial<WorkOrderData>>({
    initialValues: {
      project_id: undefined,
      description: '',
      assigned_subcontractor_id: null,
      status: 'Pending',
      scheduled_date: null,
      completion_date: null,
      estimated_cost: null,
    },
    validationSchema: WorkOrderSchema,
    onSubmit: (values) => {
      // Ensure project_id is a number before submitting
      const submissionData = {
          ...values,
          project_id: Number(values.project_id),
          estimated_cost: values.estimated_cost ? Number(values.estimated_cost) : null,
          assigned_subcontractor_id: values.assigned_subcontractor_id ? Number(values.assigned_subcontractor_id) : null,
      };

      if (selectedWorkOrder) {
        updateMutation.mutate(submissionData);
      } else {
        // Cast to WorkOrderData for create, assuming required fields are met by validation
        createMutation.mutate(submissionData as WorkOrderData);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedWorkOrder changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedWorkOrder) {
      formik.setValues({
        project_id: selectedWorkOrder.project_id,
        description: selectedWorkOrder.description || '',
        assigned_subcontractor_id: selectedWorkOrder.assigned_subcontractor_id || null,
        status: selectedWorkOrder.status || 'Pending',
        scheduled_date: selectedWorkOrder.scheduled_date ? new Date(selectedWorkOrder.scheduled_date).toISOString().split('T')[0] : null,
        completion_date: selectedWorkOrder.completion_date ? new Date(selectedWorkOrder.completion_date).toISOString().split('T')[0] : null,
        estimated_cost: selectedWorkOrder.estimated_cost || null,
        // Set other fields as needed
      });
    } else {
      formik.resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkOrder]);

  const handleEditClick = (workOrder: WorkOrderData) => {
    setSelectedWorkOrder(workOrder);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (workOrderId: number) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      deleteMutation.mutate(workOrderId);
    }
  };

  const handleCreateClick = () => {
    setSelectedWorkOrder(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Helper to get project name
  const getProjectName = (projectId: number | undefined) => {
      if (!projectId) return 'N/A';
      return projects?.find(p => p.project_id === projectId)?.project_name || `Project ID: ${projectId}`;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button onClick={handleCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Work Order
        </Button>
      </div>

      {/* TODO: Add filtering options here (e.g., by project) */}

      {isLoading && <p>Loading work orders...</p>}
      {error && <p className="text-red-500">Error loading work orders: {error.message}</p>}

      {!isLoading && !error && workOrders && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Estimated Cost</TableHead>
              {/* Add other relevant columns */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((wo) => (
              <TableRow key={wo.work_order_id}>
                <TableCell className="font-medium">{wo.description}</TableCell>
                <TableCell>{getProjectName(wo.project_id)}</TableCell>
                <TableCell>{wo.status}</TableCell>
                <TableCell>{wo.scheduled_date ? new Date(wo.scheduled_date).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{wo.estimated_cost ? `$${wo.estimated_cost.toLocaleString()}` : '-'}</TableCell>
                {/* Render other cells */}
                <TableCell className="text-right space-x-2">
                  {/* TODO: Add View Details button? */}
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(wo)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(wo.work_order_id!)} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={selectedWorkOrder ? setIsEditDialogOpen : setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedWorkOrder ? 'Edit Work Order' : 'Create Work Order'}</DialogTitle>
            <DialogDescription>
              {selectedWorkOrder ? 'Update the work order details below.' : 'Enter the details for the new work order.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project_id" className="text-right">Project</Label>
                <Select 
                    value={formik.values.project_id?.toString() || ''}
                    onValueChange={(value) => formik.setFieldValue('project_id', value ? Number(value) : undefined)}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects?.map(p => (
                            <SelectItem key={p.project_id} value={p.project_id!.toString()}>{p.project_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {formik.touched.project_id && formik.errors.project_id ? <div className="col-span-4 text-red-500 text-sm text-right">{formik.errors.project_id}</div> : null}
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" value={formik.values.description || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
                {formik.touched.description && formik.errors.description ? <div className="col-span-4 text-red-500 text-sm text-right">{formik.errors.description}</div> : null}
              </div>
              
              {/* Add other fields like Status (Select), Subcontractor (Select), Dates (Input type=date), Costs (Input type=number) */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select 
                    value={formik.values.status || ''}
                    onValueChange={(value) => formik.setFieldValue('status', value)}
                >
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
              </div>

               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduled_date" className="text-right">Scheduled</Label>
                <Input id="scheduled_date" name="scheduled_date" type="date" value={formik.values.scheduled_date || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimated_cost" className="text-right">Est. Cost ($)</Label>
                <Input id="estimated_cost" name="estimated_cost" type="number" value={formik.values.estimated_cost || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
                 {formik.touched.estimated_cost && formik.errors.estimated_cost ? <div className="col-span-4 text-red-500 text-sm text-right">{formik.errors.estimated_cost}</div> : null}
              </div>

              {/* TODO: Add Subcontractor Select field */} 

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => selectedWorkOrder ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Work Order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;

