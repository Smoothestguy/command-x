// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { getPaymentItems, getLocations } from '../services/paymentItemsApi';
import { getProjects } from '../services/api';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const PaymentItemsDebug: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Test queries
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const { data: allPaymentItems, isLoading: allItemsLoading, error: allItemsError } = useQuery({
    queryKey: ['paymentItems-all'],
    queryFn: () => getPaymentItems(),
  });

  const { data: filteredPaymentItems, isLoading: filteredLoading, error: filteredError } = useQuery({
    queryKey: ['paymentItems-filtered', selectedProjectId],
    queryFn: () => getPaymentItems({ 
      projectId: selectedProjectId!, 
      status: 'pending' 
    }),
    enabled: !!selectedProjectId,
  });

  const { data: locations, isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations', selectedProjectId],
    queryFn: () => getLocations({ projectId: selectedProjectId! }),
    enabled: !!selectedProjectId,
  });

  const TestResult = ({ title, isLoading, error, data, dataKey }: any) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : error ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading...</p>}
        {error && (
          <div className="text-red-600">
            <p><strong>Error:</strong> {error.message}</p>
            <pre className="mt-2 text-xs bg-red-50 p-2 rounded">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
        {data && (
          <div>
            <p><strong>Count:</strong> {Array.isArray(data) ? data.length : 1}</p>
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔍 Payment Items Debug</h1>
        <p className="text-gray-600">
          Debug payment items API and contractor assignments
        </p>
      </div>

      {/* Project Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Project for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projects?.map((project) => (
              <Button
                key={project.project_id}
                variant={selectedProjectId === project.project_id ? "default" : "outline"}
                onClick={() => setSelectedProjectId(project.project_id)}
              >
                {project.project_name}
              </Button>
            ))}
          </div>
          {selectedProjectId && (
            <p className="mt-2 text-sm text-gray-600">
              Selected Project ID: {selectedProjectId}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <TestResult
        title="Projects API"
        isLoading={projectsLoading}
        error={projectsError}
        data={projects}
      />

      <TestResult
        title="All Payment Items (No Filter)"
        isLoading={allItemsLoading}
        error={allItemsError}
        data={allPaymentItems}
      />

      {selectedProjectId && (
        <>
          <TestResult
            title={`Payment Items for Project ${selectedProjectId} (Status: pending)`}
            isLoading={filteredLoading}
            error={filteredError}
            data={filteredPaymentItems}
          />

          <TestResult
            title={`Locations for Project ${selectedProjectId}`}
            isLoading={locationsLoading}
            error={locationsError}
            data={locations}
          />
        </>
      )}

      {/* Manual API Test */}
      <Card>
        <CardHeader>
          <CardTitle>Manual API Test</CardTitle>
          <CardDescription>
            Test the payment items API directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              try {
                console.log('Testing payment items API...');
                const result = await getPaymentItems();
                console.log('API Result:', result);
                alert(`Success! Found ${result.length} payment items. Check console for details.`);
              } catch (error) {
                console.error('API Error:', error);
                alert(`Error: ${error.message}`);
              }
            }}
          >
            Test Payment Items API
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentItemsDebug;
