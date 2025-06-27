import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface SimplePaymentItemFormProps {
  projectId: string | number;
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
}

const SimplePaymentItemForm: React.FC<SimplePaymentItemFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
}) => {
  const isMobile = useIsMobile();
  console.log("SimplePaymentItemForm rendered with projectId:", projectId);

  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      item_code: "",
      unit_of_measure: "each",
      unit_price: 0,
      original_quantity: 1,
      category: "GENERAL",
      status: "pending",
      notes: "",
    },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    console.log("SimplePaymentItemForm handleSubmit called with values:", values);
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

        <FormField
          control={form.control}
          name="item_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Code (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter item code" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="each">Each</SelectItem>
                  <SelectItem value="sq ft">Square Feet</SelectItem>
                  <SelectItem value="linear ft">Linear Feet</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="lbs">Pounds</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
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

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "h-12" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ELECTRICAL">Electrical</SelectItem>
                  <SelectItem value="PLUMBING">Plumbing</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="MATERIALS">Materials</SelectItem>
                  <SelectItem value="LABOR">Labor</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
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
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter any additional notes"
                  className={`resize-none ${isMobile ? "h-24" : ""}`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-3 pt-4`}>
          <Button
            type="submit"
            className={`${isMobile ? "w-full h-12" : "flex-1"}`}
          >
            Create Payment Item
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className={`${isMobile ? "w-full h-12" : "flex-1"}`}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SimplePaymentItemForm;
