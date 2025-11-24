// @ts-nocheck
import React from "react";
import { useQuery } from "@tanstack/react-query";

// Simple API call functions
const fetchWorkOrders = async () => {
  try {
    const response = await fetch("/api/workorders");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }
};

const fetchProjects = async () => {
  try {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

const SimpleWorkOrders: React.FC = () => {
  // Fetch real data from backend
  const {
    data: workOrders,
    isLoading: loadingWorkOrders,
    error: workOrdersError,
  } = useQuery({
    queryKey: ["workOrders"],
    queryFn: fetchWorkOrders,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Helper function to get project name
  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.project_id === projectId);
    return project?.project_name || `Project ID: ${projectId}`;
  };

  if (loadingWorkOrders) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Work Orders (Loading...)</h1>
        <p>Loading real data from backend...</p>
      </div>
    );
  }

  if (workOrdersError) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Work Orders (Error)</h1>
        <p className="text-red-500">Error: {workOrdersError.message}</p>
        <p className="text-sm text-gray-600 mt-2">
          Check if backend is running on port 3003
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Work Orders (Real Data)</h1>
      <p className="mb-4 text-gray-600">
        Now showing real data from PostgreSQL backend!
      </p>
      <div className="grid gap-4">
        {workOrders && workOrders.length > 0 ? (
          workOrders.map((workOrder) => (
            <div
              key={workOrder.work_order_id}
              className="border p-4 rounded-lg"
            >
              <h3 className="text-xl font-semibold">
                {workOrder.description || "No description"}
              </h3>
              <p className="text-gray-600">
                Project: {getProjectName(workOrder.project_id)}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className="font-medium">
                  {workOrder.status || "No status"}
                </span>
              </p>
              <p className="text-sm">
                Estimated Cost: $
                {workOrder.estimated_cost
                  ? workOrder.estimated_cost.toLocaleString()
                  : "Not specified"}
              </p>
              {workOrder.scheduled_date && (
                <p className="text-sm">
                  Scheduled:{" "}
                  {new Date(workOrder.scheduled_date).toLocaleDateString()}
                </p>
              )}
              {workOrder.completion_date && (
                <p className="text-sm">
                  Completed:{" "}
                  {new Date(workOrder.completion_date).toLocaleDateString()}
                </p>
              )}
              {workOrder.assigned_subcontractor_id && (
                <p className="text-sm">
                  Subcontractor ID: {workOrder.assigned_subcontractor_id}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No work orders found in database.</p>
        )}
      </div>
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Real data integration working!
          <br />✅ Backend connection successful!
          <br />
          📊 Showing {workOrders?.length || 0} work orders from PostgreSQL
        </p>
      </div>
    </div>
  );
};

export default SimpleWorkOrders;
