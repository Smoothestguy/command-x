import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Database,
  Users,
  Briefcase,
  DollarSign,
} from "lucide-react";
import {
  projectsApi,
  workOrdersApi,
  paymentItemsApi,
  subcontractorsApi,
} from "../services/supabaseApi";
import { supabase } from "../lib/supabase";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  data?: any;
  error?: string;
  count?: number;
}

const SupabaseTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Database Connection", status: "pending" },
    { name: "Projects API", status: "pending" },
    { name: "Work Orders API", status: "pending" },
    { name: "Payment Items API", status: "pending" },
    { name: "Subcontractors API", status: "pending" },
    { name: "Real-time Connection", status: "pending" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, ...updates } : test))
    );
  };

  const runTests = async () => {
    setIsRunning(true);
    setCurrentTest(0);

    try {
      // Test 1: Database Connection
      setCurrentTest(0);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("count")
          .limit(1);
        if (error) throw error;
        updateTest(0, { status: "success", data: "Connected successfully" });
      } catch (error) {
        updateTest(0, { status: "error", error: error.message });
      }

      // Test 2: Projects API
      setCurrentTest(1);
      try {
        const projects = await projectsApi.getAll();
        updateTest(1, {
          status: "success",
          count: projects.length,
          data: projects.map((p) => p.project_name),
        });
      } catch (error) {
        updateTest(1, { status: "error", error: error.message });
      }

      // Test 3: Work Orders API
      setCurrentTest(2);
      try {
        const workOrders = await workOrdersApi.getAll();
        updateTest(2, {
          status: "success",
          count: workOrders.length,
          data: workOrders.map((wo) => wo.description),
        });
      } catch (error) {
        updateTest(2, { status: "error", error: error.message });
      }

      // Test 4: Payment Items API
      setCurrentTest(3);
      try {
        const paymentItems = await paymentItemsApi.getAll();
        updateTest(3, {
          status: "success",
          count: paymentItems.length,
          data: paymentItems.map((pi) => pi.description),
        });
      } catch (error) {
        updateTest(3, { status: "error", error: error.message });
      }

      // Test 5: Subcontractors API
      setCurrentTest(4);
      try {
        // Step 1: Try direct Supabase query first
        const { data: directData, error: directError } = await supabase
          .from("subcontractors")
          .select("*")
          .limit(10);

        if (directError) {
          throw new Error(
            `Direct query failed: ${directError.message}. Code: ${
              directError.code || "unknown"
            }`
          );
        }

        // Step 2: Try the API function
        const subcontractors = await subcontractorsApi.getAll();
        updateTest(4, {
          status: "success",
          count: subcontractors.length,
          data: subcontractors.map(
            (s) => s.company_name || s.name || "Unnamed"
          ),
        });
      } catch (error) {
        updateTest(4, { status: "error", error: error.message });
      }

      // Test 6: Real-time Connection
      setCurrentTest(5);
      try {
        const channel = supabase.channel("test-channel");
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

          channel
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "projects" },
              () => {}
            )
            .subscribe((status) => {
              if (status === "SUBSCRIBED") {
                clearTimeout(timeout);
                resolve(true);
              } else if (status === "CHANNEL_ERROR") {
                clearTimeout(timeout);
                reject(new Error("Channel error"));
              }
            });
        });

        updateTest(5, {
          status: "success",
          data: "Real-time subscriptions working",
        });
        supabase.removeChannel(channel);
      } catch (error) {
        updateTest(5, { status: "error", error: error.message });
      }
    } finally {
      setIsRunning(false);
      setCurrentTest(-1);
    }
  };

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (isActive && status === "pending") {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }

    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getTestIcon = (index: number) => {
    const icons = [Database, Database, Briefcase, DollarSign, Users, Database];
    const Icon = icons[index];
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          🚀 Supabase Integration Test
        </h1>
        <p className="text-gray-600">
          Testing the Command-X Construction Management System with Supabase
          backend
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Tests
            </CardTitle>
            <CardDescription>
              Verify all Supabase services are working correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="w-full mb-4"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                "Run All Tests"
              )}
            </Button>

            <div className="space-y-3">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTestIcon(index)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      {test.count !== undefined && (
                        <div className="text-sm text-gray-500">
                          Found {test.count} records
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.status === "success" && test.count !== undefined && (
                      <Badge variant="secondary">{test.count}</Badge>
                    )}
                    {getStatusIcon(test.status, currentTest === index)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed information about each test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div key={index}>
                  {test.status === "success" && test.data && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-800 mb-1">
                        ✅ {test.name}
                      </div>
                      {Array.isArray(test.data) ? (
                        <ul className="text-sm text-green-700 list-disc list-inside">
                          {test.data.slice(0, 3).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                          {test.data.length > 3 && (
                            <li>... and {test.data.length - 3} more</li>
                          )}
                        </ul>
                      ) : (
                        <div className="text-sm text-green-700">
                          {test.data}
                        </div>
                      )}
                    </div>
                  )}

                  {test.status === "error" && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-1">
                        ❌ {test.name}
                      </div>
                      <div className="text-sm text-red-700">{test.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🎉 Migration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-medium">Database Schema</div>
              <div className="text-sm text-gray-500">15+ tables migrated</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-medium">API Services</div>
              <div className="text-sm text-gray-500">All endpoints ready</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="font-medium">Real-time</div>
              <div className="text-sm text-gray-500">Live updates enabled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseTest;
