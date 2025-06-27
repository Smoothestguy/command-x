import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPaymentItem, getPaymentItems } from "@/services/paymentItemsApi";
import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const FinalPaymentItemTest: React.FC = () => {
  const [testData, setTestData] = useState({
    description: "Final Test Payment Item",
    unit_price: 99.99,
    original_quantity: 2,
    unit_of_measure: "each",
  });

  const queryClient = useQueryClient();

  // Test project ID
  const testProjectId = "880e8400-e29b-41d4-a716-446655440001";

  // Fetch existing payment items
  const { data: paymentItems, isLoading, refetch } = useQuery({
    queryKey: ["paymentItems", testProjectId],
    queryFn: () => getPaymentItems({ projectId: testProjectId }),
  });

  // Create mutation using the actual API function
  const createMutation = useMutation({
    mutationFn: createPaymentItem,
    onSuccess: (data) => {
      console.log("✅ Payment item created successfully:", data);
      toast.success("Payment item created successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentItems", testProjectId] });
      refetch();
    },
    onError: (error) => {
      console.error("❌ Failed to create payment item:", error);
      toast.error(`Failed to create payment item: ${error.message}`);
    },
  });

  const handleCreatePaymentItem = () => {
    console.log("Creating payment item with data:", testData);
    
    createMutation.mutate({
      project_id: testProjectId,
      description: testData.description,
      unit_of_measure: testData.unit_of_measure,
      unit_price: testData.unit_price,
      original_quantity: testData.original_quantity,
      status: "pending",
    });
  };

  const testDirectSupabaseConnection = async () => {
    try {
      console.log("Testing direct Supabase connection...");
      
      const { data, error } = await supabase
        .from("payment_items")
        .select("count")
        .limit(1);

      if (error) {
        throw error;
      }

      console.log("✅ Supabase connection successful");
      toast.success("Supabase connection successful!");
    } catch (error) {
      console.error("❌ Supabase connection failed:", error);
      toast.error(`Supabase connection failed: ${error.message}`);
    }
  };

  const testDirectInsert = async () => {
    try {
      console.log("Testing direct Supabase insert...");
      
      const insertData = {
        project_id: testProjectId,
        description: "Direct Insert Test Item",
        unit_of_measure: "each",
        unit_price: 50.00,
        original_quantity: 1,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("payment_items")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("✅ Direct insert successful:", data);
      toast.success("Direct insert successful!");
      refetch();
    } catch (error) {
      console.error("❌ Direct insert failed:", error);
      toast.error(`Direct insert failed: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Final Payment Item Test
        </h1>
        <p className="text-muted-foreground">
          Complete end-to-end test of the "Add Custom Item" functionality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={testData.description}
                onChange={(e) => setTestData({ ...testData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={testData.unit_price}
                  onChange={(e) => setTestData({ ...testData, unit_price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={testData.original_quantity}
                  onChange={(e) => setTestData({ ...testData, original_quantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Input
                id="unit_of_measure"
                value={testData.unit_of_measure}
                onChange={(e) => setTestData({ ...testData, unit_of_measure: e.target.value })}
              />
            </div>
            <Button 
              onClick={handleCreatePaymentItem} 
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? "Creating..." : "Create Payment Item"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDirectSupabaseConnection} variant="outline" className="w-full">
              Test Supabase Connection
            </Button>
            <Button onClick={testDirectInsert} variant="outline" className="w-full">
              Test Direct Insert
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              Refresh Payment Items
            </Button>
            <div className="text-sm text-muted-foreground">
              Project ID: {testProjectId}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Payment Items ({paymentItems?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {paymentItems && paymentItems.length > 0 ? (
                paymentItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="p-3 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.original_quantity} {item.unit_of_measure} × $
                        {item.unit_price} = ${item.total_price}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment items found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Function:</strong> {createMutation.isPending ? "Running..." : "Ready"}
            </div>
            <div>
              <strong>Last Result:</strong> {createMutation.isSuccess ? "Success" : createMutation.isError ? "Error" : "None"}
            </div>
            <div>
              <strong>Items Count:</strong> {paymentItems?.length || 0}
            </div>
            <div>
              <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalPaymentItemTest;
