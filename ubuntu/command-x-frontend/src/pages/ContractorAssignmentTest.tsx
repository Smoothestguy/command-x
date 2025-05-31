import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

// Simple test schema
const testSchema = z.object({
  contractor_assignments: z
    .array(
      z.object({
        subcontractor_id: z.number().min(0),
        allocation_percentage: z.number().min(0).max(100),
        role_description: z.string().optional(),
      })
    )
    .default([]),
});

type TestFormValues = z.infer<typeof testSchema>;

const ContractorAssignmentTest: React.FC = () => {
  const [submittedData, setSubmittedData] = useState<any>(null);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      contractor_assignments: [],
    },
  });

  const {
    fields: contractorFields,
    append: appendContractor,
    remove: removeContractor,
  } = useFieldArray({
    control: form.control,
    name: "contractor_assignments",
  });

  // Mock subcontractors
  const mockSubcontractors = [
    { subcontractor_id: 1, company_name: "ABC Construction" },
    { subcontractor_id: 2, company_name: "XYZ Electrical" },
    { subcontractor_id: 3, company_name: "123 Plumbing" },
  ];

  const addContractorAssignment = () => {
    console.log("🔧 Adding contractor assignment");
    appendContractor({
      subcontractor_id: 0,
      allocation_percentage: 0,
      role_description: "",
    });
  };

  const onSubmit = (data: TestFormValues) => {
    console.log("📋 Form submitted with data:", data);
    setSubmittedData(data);
  };

  // Watch contractor assignments
  const watchedAssignments = form.watch("contractor_assignments");
  const totalPercentage = watchedAssignments.reduce(
    (sum, assignment) => sum + (assignment.allocation_percentage || 0),
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔧 Contractor Assignment Test</h1>
        <p className="text-gray-600">
          Simple test to debug contractor assignment form functionality
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Test Form</CardTitle>
            <CardDescription>
              Add contractor assignments and test form submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Contractor Assignments */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Contractor Assignments</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addContractorAssignment}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contractor
                    </Button>
                  </div>

                  {contractorFields.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No contractors added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contractorFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Assignment {index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeContractor(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`contractor_assignments.${index}.subcontractor_id`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Subcontractor</FormLabel>
                                  <Select
                                    onValueChange={(value) => {
                                      console.log(`Subcontractor changed for ${index}:`, value);
                                      field.onChange(Number(value));
                                    }}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {mockSubcontractors.map((sub) => (
                                        <SelectItem
                                          key={sub.subcontractor_id}
                                          value={sub.subcontractor_id.toString()}
                                        >
                                          {sub.company_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`contractor_assignments.${index}.allocation_percentage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Percentage</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      placeholder="0.00"
                                      {...field}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        console.log(`Percentage changed for ${index}:`, value);
                                        field.onChange(value);
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name={`contractor_assignments.${index}.role_description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role Description</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Electrical work"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total Percentage */}
                  {contractorFields.length > 0 && (
                    <div className={`p-3 rounded ${
                      Math.abs(totalPercentage - 100) < 0.01
                        ? "bg-green-50 text-green-900"
                        : "bg-amber-50 text-amber-900"
                    }`}>
                      <div className="text-sm font-medium">
                        Total Allocation: {totalPercentage.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Submit Test Form
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Watched Form Values:</h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(watchedAssignments, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Field Array Length:</h4>
              <p>{contractorFields.length}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Total Percentage:</h4>
              <p>{totalPercentage.toFixed(2)}%</p>
            </div>

            {submittedData && (
              <div>
                <h4 className="font-medium mb-2">Last Submitted Data:</h4>
                <pre className="text-xs bg-green-50 p-2 rounded overflow-auto">
                  {JSON.stringify(submittedData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorAssignmentTest;
