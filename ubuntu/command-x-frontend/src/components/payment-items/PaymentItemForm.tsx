import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PaymentItemData, LocationData } from "@/types/paymentItem";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/services/paymentItemsApi";
import { getWorkOrders } from "@/services/api";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Define the form schema with Zod
const formSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  item_code: z.string().optional(),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  unit_price: z.coerce.number().positive("Unit price must be positive"),
  original_quantity: z.coerce.number().positive("Quantity must be positive"),
  actual_quantity: z.coerce
    .number()
    .positive("Actual quantity must be positive")
    .optional(),
  location_id: z.coerce.number().optional(),
  work_order_id: z.coerce.number().optional(),
  category: z.string().optional(),
  status: z.enum([
    "pending",
    "approved",
    "rejected",
    "completed",
    "in_progress",
  ]),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentItemFormProps {
  projectId: number;
  initialData?: PaymentItemData;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

const PaymentItemForm: React.FC<PaymentItemFormProps> = ({
  projectId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const isMobile = useIsMobile();
  console.log("PaymentItemForm rendered with:", { projectId, initialData });
  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          description: initialData.description,
          item_code: initialData.item_code || "",
          unit_of_measure: initialData.unit_of_measure,
          unit_price: initialData.unit_price,
          original_quantity: initialData.original_quantity,
          actual_quantity: initialData.actual_quantity,
          location_id: initialData.location_id,
          work_order_id: initialData.work_order_id,
          category: initialData.category || "",
          status: initialData.status,
          notes: initialData.notes || "",
        }
      : {
          description: "",
          item_code: "",
          unit_of_measure: "",
          unit_price: 0,
          original_quantity: 0,
          category: "GENERAL",
          status: "pending",
          notes: "",
        },
  });

  // Fetch locations for the project
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["locations", projectId],
    queryFn: () => {
      console.log("Fetching locations for project ID:", projectId);
      return getLocations({ projectId });
    },
  });

  // Fetch work orders for the project
  const { data: workOrders, isLoading: isLoadingWorkOrders } = useQuery({
    queryKey: ["workOrders", projectId],
    queryFn: () => {
      console.log("Fetching work orders for project ID:", projectId);
      return getWorkOrders(projectId);
    },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    console.log("PaymentItemForm handleSubmit called with values:", values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
        >
          <FormField
            control={form.control}
            name="item_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter item code (optional)"
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
            name="unit_of_measure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., sq ft, linear ft, each"
                    {...field}
                    className={isMobile ? "h-12" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
        >
          <FormField
            control={form.control}
            name="unit_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
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
            name="original_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    className={isMobile ? "h-12" : ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {initialData && (
          <FormField
            control={form.control}
            name="actual_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Leave blank if same as original quantity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div
          className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}
        >
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue placeholder="Select a location" />
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="work_order_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Order</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className={isMobile ? "h-12" : ""}>
                      <SelectValue placeholder="Select a work order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {workOrders?.map((workOrder) => (
                      <SelectItem
                        key={workOrder.work_order_id}
                        value={workOrder.work_order_id.toString()}
                      >
                        {workOrder.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes"
                  className={`resize-none ${isMobile ? "min-h-[100px]" : ""}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={`flex ${isMobile ? "flex-col" : "justify-end space-x-2"} ${
            isMobile ? "space-y-2" : ""
          }`}
        >
          {isMobile ? (
            <>
              <Button type="submit" className="h-12">
                {initialData ? "Update Payment Item" : "Add Payment Item"}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                className="h-12"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Payment Item" : "Add Payment Item"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default PaymentItemForm;
