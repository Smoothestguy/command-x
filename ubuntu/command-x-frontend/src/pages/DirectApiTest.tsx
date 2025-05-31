import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getProjectById, getProjects } from "../services/api";
import { AlertCircle, CheckCircle, Play } from "lucide-react";

const DirectApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading((prev) => ({ ...prev, [testName]: true }));
    try {
      console.log(`🧪 Starting test: ${testName}`);
      const result = await testFn();
      console.log(`✅ Test ${testName} succeeded:`, result);
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result, error: null },
      }));
    } catch (error) {
      console.error(`❌ Test ${testName} failed:`, error);
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: false, data: null, error: error.message },
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  const tests = [
    {
      name: "getProjects",
      description: "Test getting all projects",
      fn: () => getProjects(),
    },
    {
      name: "getProjectById-smith",
      description: "Test getting Smith Residence project",
      fn: () => getProjectById("5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96"),
    },
    {
      name: "getProjectById-downtown",
      description: "Test getting Downtown Office project",
      fn: () => getProjectById("880e8400-e29b-41d4-a716-446655440001"),
    },
    {
      name: "getProjectById-old-uuid",
      description: "Test the old UUID that was failing",
      fn: () => getProjectById("5de5a9c4-1ce8-46a0-9f8f-e03b35cf649c"),
    },
    {
      name: "getProjectById-invalid",
      description: "Test getting non-existent project ID",
      fn: () => getProjectById("invalid-uuid-12345"),
    },
  ];

  const TestCard = ({ test }: { test: any }) => {
    const result = testResults[test.name];
    const loading = isLoading[test.name];

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : result ? (
                result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )
              ) : (
                <Play className="h-4 w-4 text-gray-400" />
              )}
              {test.name}
            </span>
            <Button
              size="sm"
              onClick={() => runTest(test.name, test.fn)}
              disabled={loading}
            >
              {loading ? "Running..." : "Run Test"}
            </Button>
          </CardTitle>
          <CardDescription>{test.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <div
              className={`p-3 rounded ${
                result.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {result.success ? (
                <div>
                  <p className="text-green-800 font-medium">✅ Success</p>
                  <pre className="mt-2 text-xs text-green-700 overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <p className="text-red-800 font-medium">❌ Error</p>
                  <p className="mt-1 text-red-700 text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Direct API Test</h1>
        <p className="text-gray-600">
          Test API functions directly without React Query to isolate issues
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => {
            tests.forEach((test) => runTest(test.name, test.fn));
          }}
          className="mr-2"
        >
          Run All Tests
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            console.log("🔍 Fetching all projects to show available IDs...");
            try {
              const projects = await getProjects();
              console.log(
                "🔍 Available Project IDs:",
                projects.map((p) => ({
                  id: p.project_id,
                  name: p.project_name,
                }))
              );
              alert(
                `Found ${projects.length} projects. Check console for details.`
              );
            } catch (error) {
              console.error("🔍 Error fetching projects:", error);
            }
          }}
          className="mr-2"
        >
          Show Available Project IDs
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setTestResults({});
            console.clear();
          }}
        >
          Clear Results
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <TestCard key={test.name} test={test} />
        ))}
      </div>

      {/* Console Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Console Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Open browser console (F12)</p>
            <p>2. Run the tests above</p>
            <p>3. Look for logs that start with "🔍" for detailed debugging</p>
            <p>4. ✅ getProjects should pass (shows all 5 projects)</p>
            <p>5. ✅ Smith Residence and Downtown Office should pass</p>
            <p>6. ❌ Invalid UUID should fail (expected)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectApiTest;
