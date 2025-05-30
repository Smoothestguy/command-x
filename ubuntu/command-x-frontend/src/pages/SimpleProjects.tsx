import React from "react";
import { useQuery } from "@tanstack/react-query";

// Simple API call function
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

const SimpleProjects: React.FC = () => {
  // Fetch real data from backend
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Projects (Loading...)</h1>
        <p>Loading real data from backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Projects (Error)</h1>
        <p className="text-red-500">Error: {error.message}</p>
        <p className="text-sm text-gray-600 mt-2">
          Check if backend is running on port 3002
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Projects (Real Data)</h1>
      <p className="mb-4 text-gray-600">
        Now showing real data from PostgreSQL backend!
      </p>
      <div className="grid gap-4">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.project_id} className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold">{project.project_name}</h3>
              <p className="text-gray-600">
                {project.location || "No location specified"}
              </p>
              <p className="text-sm">
                Client: {project.client_name || "No client specified"}
              </p>
              <p className="text-sm">Status: {project.status || "No status"}</p>
              <p className="text-sm">
                Budget: $
                {project.budget
                  ? project.budget.toLocaleString()
                  : "Not specified"}
              </p>
              {project.start_date && (
                <p className="text-sm">
                  Start Date:{" "}
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              )}
              {project.end_date && (
                <p className="text-sm">
                  End Date: {new Date(project.end_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No projects found in database.</p>
        )}
      </div>
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ✅ Real data integration working!
          <br />✅ Backend connection successful!
          <br />
          📊 Showing {projects?.length || 0} projects from PostgreSQL
        </p>
      </div>
    </div>
  );
};

export default SimpleProjects;
