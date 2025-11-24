// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPaymentItem } from "@/services/paymentItemsApi";
import { supabase } from "@/lib/supabase";

const PaymentItemCreateTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [description, setDescription] = useState("Test Payment Item");
  const [unitPrice, setUnitPrice] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [unitOfMeasure, setUnitOfMeasure] = useState("each");

  const testDirectSupabaseInsert = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing direct Supabase insert...");
      
      // First, let's get a valid project ID
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("project_id, project_name")
        .limit(1);

      if (projectError) {
        throw new Error(`Failed to get project: ${projectError.message}`);
      }

      if (!projects || projects.length === 0) {
        throw new Error("No projects found in database");
      }

      const projectId = projects[0].project_id;
      console.log("Using project:", projects[0]);

      // Now try to insert a payment item directly
      const insertData = {
        project_id: projectId,
        description: description,
        unit_of_measure: unitOfMeasure,
        unit_price: unitPrice,
        original_quantity: quantity,
        status: "pending" as const,
      };

      console.log("Inserting payment item:", insertData);

      const { data, error } = await supabase
        .from("payment_items")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase insert failed: ${error.message}`);
      }

      console.log("Direct insert successful:", data);
      setResult({
        type: "direct_supabase",
        data: data,
        project: projects[0],
      });
    } catch (err) {
      console.error("Direct Supabase test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const testApiFunction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing API function...");
      
      // Use a known project ID for testing
      const testProjectId = "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96";

      const paymentItemData = {
        project_id: testProjectId,
        description: description,
        unit_of_measure: unitOfMeasure,
        unit_price: unitPrice,
        original_quantity: quantity,
        status: "pending" as const,
      };

      console.log("Creating payment item via API:", paymentItemData);

      const result = await createPaymentItem(paymentItemData);
      console.log("API function successful:", result);
      
      setResult({
        type: "api_function",
        data: result,
      });
    } catch (err) {
      console.error("API function test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing database connection...");
      
      const { data, error } = await supabase
        .from("payment_items")
        .select("count")
        .limit(1);

      if (error) {
        throw new Error(`Connection failed: ${error.message}`);
      }

      console.log("Connection successful");
      setResult({
        type: "connection_test",
        data: "Database connection successful",
      });
    } catch (err) {
      console.error("Connection test failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Payment Item Creation Test
        </h1>
        <p className="text-muted-foreground">
          Test creating payment items with Supabase
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Form Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price</label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit of Measure</label>
              <Input
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                placeholder="each"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={testDatabaseConnection}
              disabled={isLoading}
              variant="outline"
            >
              Test Connection
            </Button>
            <Button
              onClick={testDirectSupabaseInsert}
              disabled={isLoading}
              variant="outline"
            >
              Direct Supabase Insert
            </Button>
            <Button
              onClick={testApiFunction}
              disabled={isLoading}
            >
              Test API Function
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Running test...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-sm font-medium text-green-800 mb-2">
                Test Type: {result.type}
              </div>
              <pre className="text-sm text-green-700 whitespace-pre-wrap">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentItemCreateTest;
