import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubcontractors, createSubcontractor, updateSubcontractor, deleteSubcontractor, SubcontractorData } from '../services/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const SubcontractorSchema = Yup.object().shape({
  company_name: Yup.string().required('Company name is required'),
  contact_name: Yup.string(),
  email: Yup.string().email('Invalid email format'),
  phone: Yup.string(),
  trade: Yup.string(),
  insurance_expiry: Yup.date().nullable(),
  license_number: Yup.string(),
  status: Yup.string(),
});

const Subcontractors: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<SubcontractorData | null>(null);

  // Fetch Subcontractors
  const { data: subcontractors, isLoading, error } = useQuery<SubcontractorData[], Error>({
    queryKey: ['subcontractors'],
    queryFn: getSubcontractors,
  });

  // --- Mutations --- 

  // Create Subcontractor
  const createMutation = useMutation({
    mutationFn: createSubcontractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] });
      setIsCreateDialogOpen(false);
      toast.success('Subcontractor created successfully!');
    },
    onError: (err) => {
      console.error('Error creating subcontractor:', err);
      toast.error('Failed to create subcontractor.');
    },
  });

  // Update Subcontractor
  const updateMutation = useMutation({
    mutationFn: (subcontractorData: Partial<SubcontractorData>) => {
        if (!selectedSubcontractor?.subcontractor_id) throw new Error('No subcontractor selected for update');
        return updateSubcontractor(selectedSubcontractor.subcontractor_id, subcontractorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] });
      setIsEditDialogOpen(false);
      setSelectedSubcontractor(null);
      toast.success('Subcontractor updated successfully!');
    },
    onError: (err) => {
      console.error('Error updating subcontractor:', err);
      toast.error('Failed to update subcontractor.');
    },
  });

  // Delete Subcontractor
  const deleteMutation = useMutation({
    mutationFn: deleteSubcontractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontractors'] });
      toast.success('Subcontractor deleted successfully!');
    },
    onError: (err) => {
      console.error('Error deleting subcontractor:', err);
      toast.error('Failed to delete subcontractor.');
    },
  });

  // --- Form Handling (using Formik) --- 

  const formik = useFormik<Partial<SubcontractorData>>({
    initialValues: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      trade: '',
      insurance_expiry: null,
      license_number: '',
      status: 'Active',
    },
    validationSchema: SubcontractorSchema,
    onSubmit: (values) => {
      if (selectedSubcontractor) {
        updateMutation.mutate(values);
      } else {
        // Cast to SubcontractorData for create
        createMutation.mutate(values as SubcontractorData);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedSubcontractor changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedSubcontractor) {
      formik.setValues({
        company_name: selectedSubcontractor.company_name || '',
        contact_name: selectedSubcontractor.contact_name || '',
        email: selectedSubcontractor.email || '',
        phone: selectedSubcontractor.phone || '',
        trade: selectedSubcontractor.trade || '',
        insurance_expiry: selectedSubcontractor.insurance_expiry ? new Date(selectedSubcontractor.insurance_expiry).toISOString().split('T')[0] : null,
        license_number: selectedSubcontractor.license_number || '',
        status: selectedSubcontractor.status || 'Active',
      });
    } else {
      formik.resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubcontractor]);

  const handleEditClick = (subcontractor: SubcontractorData) => {
    setSelectedSubcontractor(subcontractor);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (subcontractorId: number) => {
    if (window.confirm('Are you sure you want to delete this subcontractor?')) {
      deleteMutation.mutate(subcontractorId);
    }
  };

  const handleCreateClick = () => {
    setSelectedSubcontractor(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subcontractors</h1>
        <Button onClick={handleCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subcontractor
        </Button>
      </div>

      {isLoading && <p>Loading subcontractors...</p>}
      {error && <p className="text-red-500">Error loading subcontractors: {error.message}</p>}

      {!isLoading && !error && subcontractors && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Insurance Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcontractors.map((sub) => (
              <TableRow key={sub.subcontractor_id}>
                <TableCell className="font-medium">{sub.company_name}</TableCell>
                <TableCell>{sub.contact_name}</TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>{sub.phone}</TableCell>
                <TableCell>{sub.trade}</TableCell>
                <TableCell>{sub.status}</TableCell>
                <TableCell>{sub.insurance_expiry ? new Date(sub.insurance_expiry).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditClick(sub)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(sub.subcontractor_id!)} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={selectedSubcontractor ? setIsEditDialogOpen : setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedSubcontractor ? 'Edit Subcontractor' : 'Add Subcontractor'}</DialogTitle>
            <DialogDescription>
              {selectedSubcontractor ? 'Update the subcontractor details below.' : 'Enter the details for the new subcontractor.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company_name" className="text-right">Company</Label>
                <Input id="company_name" name="company_name" value={formik.values.company_name || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
                {formik.touched.company_name && formik.errors.company_name ? <div className="col-span-4 text-red-500 text-sm text-right">{formik.errors.company_name}</div> : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_name" className="text-right">Contact</Label>
                <Input id="contact_name" name="contact_name" value={formik.values.contact_name || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" value={formik.values.email || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
                 {formik.touched.email && formik.errors.email ? <div className="col-span-4 text-red-500 text-sm text-right">{formik.errors.email}</div> : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" value={formik.values.phone || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trade" className="text-right">Trade</Label>
                <Input id="trade" name="trade" value={formik.values.trade || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                {/* Consider using a Select component here */}
                <Input id="status" name="status" value={formik.values.status || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="insurance_expiry" className="text-right">Insurance Expiry</Label>
                <Input id="insurance_expiry" name="insurance_expiry" type="date" value={formik.values.insurance_expiry || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license_number" className="text-right">License #</Label>
                <Input id="license_number" name="license_number" value={formik.values.license_number || ''} onChange={formik.handleChange} onBlur={formik.handleBlur} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => selectedSubcontractor ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Subcontractor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subcontractors;

