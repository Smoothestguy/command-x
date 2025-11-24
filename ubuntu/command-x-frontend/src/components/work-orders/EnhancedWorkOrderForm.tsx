import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  WorkOrderData,
  LineItemData,
  getProjects,
  getSubcontractors,
  ProjectData,
  SubcontractorData,
} from "@/services/api";
import { PaymentItemData, LocationData } from "@/types/paymentItem";
import { getPaymentItems, getLocations } from "@/services/paymentItemsApi";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Search, MapPin, Tag } from "lucide-react";
import EditablePaymentItemRow from "./EditablePaymentItemRow";

// Form schema
const workOrderFormSchema = z.object({
  project_id: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== 0, "Project is required"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  assigned_subcontractor_id: z.number().optional(),
  contractor_assignments: z
    .array(
      z.object({
        subcontractor_id: z.number().min(0, "Subcontractor is required"), // Allow 0 for initial state
        allocation_percentage: z
          .number()
          .min(0, "Percentage must be non-negative") // Allow 0 for initial state
          .max(100, "Percentage must be between 0 and 100"),
        allocation_amount: z.number().min(0).optional(),
        role_description: z.string().optional(),
      })
    )
    .default([]),
  status: z.string().default("Pending"),
  scheduled_date: z.string().optional(),
  retainage_percentage: z.number().min(0).max(100).default(0),
  selectedPaymentItems: z.array(z.number()).default([]),
  newLineItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0.01, "Quantity must be positive"),
        unit_cost: z.number().min(0, "Unit cost must be non-negative"),
        unit_of_measure: z.string().min(1, "Unit of measure is required"),
        location_id: z.number().optional(),
        category: z.string().optional(),
      })
    )
    .default([]),
});

type FormValues = z.infer<typeof workOrderFormSchema>;

interface EnhancedWorkOrderFormProps {
  projectId?: string | number; // Support both UUID strings and legacy numbers
  initialData?: Partial<WorkOrderData>;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

const EnhancedWorkOrderForm: React.FC<EnhancedWorkOrderFormProps> = ({
  projectId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<number | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      project_id: projectId || initialData?.project_id || "",
      description: initialData?.description || "",
      assigned_subcontractor_id:
        initialData?.assigned_subcontractor_id !== undefined &&
        initialData?.assigned_subcontractor_id !== null
          ? Number(initialData.assigned_subcontractor_id)
          : undefined,
      contractor_assignments: initialData?.contractor_assignments || [],
      status: initialData?.status || "Pending",
      scheduled_date: initialData?.scheduled_date || "",
      retainage_percentage: initialData?.retainage_percentage || 0,
      selectedPaymentItems: [],
      newLineItems: [],
    },
  });

  // Field array for new line items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "newLineItems",
  });

  // Field array for contractor assignments
  const {
    fields: contractorFields,
    append: appendContractor,
    remove: removeContractor,
  } = useFieldArray({
    control: form.control,
    name: "contractor_assignments",
  });

  // Fetch data
  const { data: projects = [] } = useQuery<ProjectData[]>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const { data: subcontractors = [] } = useQuery<SubcontractorData[]>({
    queryKey: ["subcontractors"],
    queryFn: getSubcontractors,
  });

  const selectedProjectId = form.watch("project_id");

  const { data: locations = [] } = useQuery<LocationData[]>({
    queryKey: ["locations", selectedProjectId],
    queryFn: ({ queryKey }) =>
      getLocations({ projectId: queryKey[1] as string | number | undefined }),
  });

  const { data: availablePaymentItems = [] } = useQuery<PaymentItemData[]>({
    queryKey: ["paymentItems", selectedProjectId],
    queryFn: () =>
      getPaymentItems({
        projectId: selectedProjectId,
        status: "pending", // Only show unassigned items
      }),
    enabled: !!selectedProjectId,
  });

  // Add new line item
  const addNewLineItem = () => {
    append({
      description: "",
      quantity: 1,
      unit_cost: 0,
      unit_of_measure: "",
      location_id: undefined,
      category: "",
    });
  };

  // Add new contractor assignment
  const addContractorAssignment = () => {
    console.log("🔧 Adding new contractor assignment");
    console.log("🔧 Current contractor fields before add:", contractorFields);

    appendContractor({
      subcontractor_id: 0,
      allocation_percentage: 0,
      allocation_amount: 0,
      role_description: "",
    });

    // Log after a short delay to see the updated state
    setTimeout(() => {
      console.log("🔧 Contractor fields after add:", contractorFields);
      console.log(
        "🔧 Form values after add:",
        form.getValues("contractor_assignments")
      );
    }, 100);
  };

  // Calculate total allocation percentage
  const contractorAssignments = form.watch("contractor_assignments");

  // Debug contractor assignments
  console.log("📊 Watched contractor assignments:", contractorAssignments);
  console.log("📊 Contractor fields length:", contractorFields.length);

  const totalAllocationPercentage = contractorAssignments.reduce(
    (sum, assignment) => {
      console.log("📊 Processing assignment for total:", assignment);
      return sum + (assignment.allocation_percentage || 0);
    },
    0
  );

  console.log("📊 Total allocation percentage:", totalAllocationPercentage);

  // Filter available payment items
  const filteredPaymentItems =
    availablePaymentItems?.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        locationFilter === "all" || item.location_id === locationFilter;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesLocation && matchesCategory;
    }) || [];

  // Calculate totals
  const selectedItems = form.watch("selectedPaymentItems");
  const newItems = form.watch("newLineItems");

  const selectedItemsTotal = filteredPaymentItems
    .filter((item) => selectedItems.includes(item.item_id))
    .reduce((sum, item) => sum + (item.total_price || 0), 0);

  const newItemsTotal = newItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );
  const totalEstimatedCost = selectedItemsTotal + newItemsTotal;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Work Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`grid ${
                isMobile ? "grid-cols-1" : "grid-cols-2"
              } gap-4`}
            >
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        // Keep as string if it's a UUID, convert to number if it's numeric
                        const isUUID = value.includes("-");
                        field.onChange(isUUID ? value : Number(value));
                      }}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={isMobile ? "h-12" : ""}>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => {
                          const idValue = project.project_id ?? "";
                          return (
                            <SelectItem
                              key={idValue?.toString()}
                              value={idValue?.toString()}
                            >
                              {project.project_name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_subcontractor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Subcontractor</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? Number(value) : undefined)
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className={isMobile ? "h-12" : ""}>
                          <SelectValue placeholder="Select a subcontractor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {subcontractors?.map((subcontractor) => {
                          const idValue = subcontractor.subcontractor_id ?? "";
                          return (
                            <SelectItem
                              key={idValue?.toString()}
                              value={idValue?.toString()}
                            >
                              {subcontractor.company_name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter work order description"
                      className={`resize-none ${
                        isMobile ? "min-h-[100px]" : ""
                      }`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={`grid ${
                isMobile ? "grid-cols-1" : "grid-cols-3"
              } gap-4`}
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={isMobile ? "h-12" : ""}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={isMobile ? "h-12" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retainage_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retainage %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className={isMobile ? "h-12" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multi-Contractor Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Contractor Assignments</CardTitle>
            <div className="text-sm text-gray-600">
              Assign multiple contractors to this work order with allocation
              percentages
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {contractorFields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No contractor assignments added yet. Use single contractor
                assignment above or add multiple contractors below.
              </div>
            ) : (
              <div className="space-y-4">
                {contractorFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">
                        Contractor Assignment {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContractor(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      } gap-4`}
                    >
                      <FormField
                        control={form.control}
                        name={`contractor_assignments.${index}.subcontractor_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcontractor *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                console.log(
                                  `🔧 Subcontractor changed for index ${index}:`,
                                  value
                                );
                                field.onChange(Number(value));
                                console.log(
                                  `🔧 Form values after subcontractor change:`,
                                  form.getValues("contractor_assignments")
                                );
                              }}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={isMobile ? "h-12" : ""}
                                >
                                  <SelectValue placeholder="Select subcontractor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subcontractors?.map((subcontractor) => {
                                  const idValue = subcontractor.subcontractor_id ?? "";
                                  return (
                                    <SelectItem
                                      key={idValue?.toString()}
                                      value={idValue?.toString()}
                                    >
                                      {subcontractor.company_name}
                                    </SelectItem>
                                  );
                                })}
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
                            <FormLabel>Allocation Percentage *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max="100"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  console.log(
                                    `🔧 Allocation percentage changed for index ${index}:`,
                                    value
                                  );
                                  field.onChange(value);
                                  console.log(
                                    `🔧 Form values after percentage change:`,
                                    form.getValues("contractor_assignments")
                                  );
                                }}
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`contractor_assignments.${index}.role_description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Electrical work, Plumbing"
                                {...field}
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={addContractorAssignment}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contractor Assignment
              </Button>

              {contractorFields.length > 0 && (
                <div
                  className={`p-3 rounded ${
                    Math.abs(totalAllocationPercentage - 100) < 0.01
                      ? "bg-green-50 text-green-900"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >
                  <div className="text-sm font-medium">
                    Total Allocation: {totalAllocationPercentage.toFixed(2)}%
                  </div>
                  {Math.abs(totalAllocationPercentage - 100) > 0.01 && (
                    <div className="text-xs">Must total 100% to proceed</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Payment Items Selection */}
        {selectedProjectId && (
          <Card>
            <CardHeader>
              <CardTitle>Assign Existing Payment Items</CardTitle>
              <div className="text-sm text-gray-600">
                Select payment items from the project to assign to this work
                order
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payment items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div
                  className={`grid ${
                    isMobile ? "grid-cols-1" : "grid-cols-2"
                  } gap-4`}
                >
                  <Select
                    value={locationFilter.toString()}
                    onValueChange={(value) =>
                      setLocationFilter(value === "all" ? "all" : Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem
                          key={location.location_id}
                          value={location.location_id.toString()}
                        >
                          <MapPin className="h-4 w-4 inline mr-1" />
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                      <SelectItem value="PLUMBING">Plumbing</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="INSULATION">Insulation</SelectItem>
                      <SelectItem value="WALLS & CEILINGS">
                        Walls & Ceilings
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payment Items Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaymentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No available payment items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPaymentItems.map((item) => (
                        <EditablePaymentItemRow
                          key={item.item_id}
                          item={item}
                          locations={locations}
                          isSelected={selectedItems.includes(item.item_id)}
                          onSelectionChange={(checked) => {
                            const currentValue = selectedItems || [];
                            if (checked) {
                              form.setValue("selectedPaymentItems", [
                                ...currentValue,
                                item.item_id,
                              ]);
                            } else {
                              form.setValue(
                                "selectedPaymentItems",
                                currentValue.filter((id) => id !== item.item_id)
                              );
                            }
                          }}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedItems.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    Selected Items: {selectedItems.length}
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    Total: ${selectedItemsTotal.toFixed(2)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* New Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Line Items</CardTitle>
            <div className="text-sm text-gray-600">
              Create new line items for this work order
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No new line items added yet
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Line Item {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      } gap-4`}
                    >
                      <FormField
                        control={form.control}
                        name={`newLineItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter description"
                                {...field}
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newLineItems.${index}.unit_of_measure`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit of Measure *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., sq ft, each, hours"
                                {...field}
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newLineItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newLineItems.${index}.unit_cost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit Cost</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className={isMobile ? "h-12" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newLineItems.${index}.location_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(
                                  value ? Number(value) : undefined
                                )
                              }
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={isMobile ? "h-12" : ""}
                                >
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {locations?.map((location) => (
                                  <SelectItem
                                    key={location.location_id}
                                    value={location.location_id.toString()}
                                  >
                                    {location.name}
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
                        name={`newLineItems.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={isMobile ? "h-12" : ""}
                                >
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                <SelectItem value="GENERAL">General</SelectItem>
                                <SelectItem value="ELECTRICAL">
                                  Electrical
                                </SelectItem>
                                <SelectItem value="PLUMBING">
                                  Plumbing
                                </SelectItem>
                                <SelectItem value="HVAC">HVAC</SelectItem>
                                <SelectItem value="INSULATION">
                                  Insulation
                                </SelectItem>
                                <SelectItem value="WALLS & CEILINGS">
                                  Walls & Ceilings
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium">
                        Total: $
                        {(
                          (newItems[index]?.quantity || 0) *
                          (newItems[index]?.unit_cost || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={addNewLineItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Line Item
            </Button>

            {newItems.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-900">
                  New Items: {newItems.length}
                </div>
                <div className="text-lg font-bold text-green-900">
                  Total: ${newItemsTotal.toFixed(2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Selected Items Total:</div>
                    <div className="text-lg">
                      ${selectedItemsTotal.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">New Items Total:</div>
                    <div className="text-lg">${newItemsTotal.toFixed(2)}</div>
                  </div>
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="font-bold text-lg">
                    Total Estimated Cost: ${totalEstimatedCost.toFixed(2)}
                  </div>
                </div>
              </div>

              <div
                className={`flex ${
                  isMobile ? "flex-col space-y-2" : "justify-end space-x-2"
                }`}
              >
                {isMobile ? (
                  <>
                    <Button type="submit" className="h-12">
                      Create Work Order
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="h-12"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Work Order</Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default EnhancedWorkOrderForm;
