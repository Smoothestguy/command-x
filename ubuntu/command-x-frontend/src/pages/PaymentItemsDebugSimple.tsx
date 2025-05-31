import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { getProjectById, getProjects } from "../services/api";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

const PaymentItemsDebugSimple: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  console.log("🔍 PaymentItemsDebugSimple - URL projectId:", projectId);

  // Fetch all projects to see what's available
  const {
    data: allProjects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // Fetch specific project
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(Number(projectId)),
    enabled: !!projectId,
  });

  console.log("🔍 Project query state:", {
    projectId,
    projectIdAsNumber: Number(projectId),
    isLoading: projectLoading,
    error: projectError,
    project,
  });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Link to="/projects">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          🔍 Payment Items Debug (Simple)
        </h1>
        <p className="text-gray-600">
          Debug the payment items page loading issue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* URL Info */}
        <Card>
          <CardHeader>
            <CardTitle>URL Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Raw Project ID from URL:</strong>{" "}
                {projectId || "undefined"}
              </p>
              <p>
                <strong>Project ID as Number:</strong> {Number(projectId)}
              </p>
              <p>
                <strong>Is Valid Number:</strong>{" "}
                {!isNaN(Number(projectId)) ? "Yes" : "No"}
              </p>
              <p>
                <strong>Current URL:</strong> {window.location.pathname}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* All Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {projectsLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : projectsError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              All Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsLoading && <p>Loading projects...</p>}
            {projectsError && (
              <div className="text-red-600">
                <p>
                  <strong>Error:</strong> {projectsError.message}
                </p>
              </div>
            )}
            {allProjects && (
              <div className="space-y-2">
                <p>
                  <strong>Total Projects:</strong> {allProjects.length}
                </p>
                <div className="space-y-1">
                  {allProjects.map((proj) => (
                    <div
                      key={proj.project_id}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span>
                        <strong>ID {proj.project_id}:</strong>{" "}
                        {proj.project_name}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/payment-items-test/${proj.project_id}`}>
                          <Button size="sm" variant="outline">
                            Test This Project (Public)
                          </Button>
                        </Link>
                        <Link to={`/projects/${proj.project_id}/payment-items`}>
                          <Button size="sm" variant="secondary">
                            Test (Auth Required)
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specific Project */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {projectLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : projectError ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : project ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              Project {projectId} Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!projectId && (
              <div className="text-yellow-600">
                <p>
                  <strong>No Project ID in URL</strong>
                </p>
                <p>The URL should be: /projects/[projectId]/payment-items</p>
              </div>
            )}

            {projectId && projectLoading && (
              <div>
                <p>Loading project details for ID {projectId}...</p>
                <div className="mt-2 text-sm text-gray-600">
                  This is where the original page gets stuck.
                </div>
              </div>
            )}

            {projectId && projectError && (
              <div className="text-red-600">
                <p>
                  <strong>Error loading project {projectId}:</strong>
                </p>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto">
                  {JSON.stringify(projectError, null, 2)}
                </pre>
                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <p className="text-yellow-800">
                    <strong>Possible causes:</strong>
                  </p>
                  <ul className="list-disc list-inside text-yellow-700 text-sm mt-1">
                    <li>Project ID {projectId} doesn't exist in mock data</li>
                    <li>getProjectById function is failing</li>
                    <li>Network or API issue</li>
                  </ul>
                </div>
              </div>
            )}

            {projectId && project && (
              <div className="text-green-600">
                <p>
                  <strong>✅ Project loaded successfully!</strong>
                </p>
                <div className="mt-3 p-3 bg-green-50 rounded">
                  <p>
                    <strong>Project Name:</strong> {project.project_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {project.location}
                  </p>
                  <p>
                    <strong>Status:</strong> {project.status}
                  </p>
                  <p>
                    <strong>Client:</strong> {project.client_name}
                  </p>
                </div>
                <div className="mt-4">
                  <Link to={`/projects/${projectId}/payment-items`}>
                    <Button>Go to Payment Items Page</Button>
                  </Link>
                </div>
              </div>
            )}

            {projectId && !projectLoading && !projectError && !project && (
              <div className="text-yellow-600">
                <p>
                  <strong>No project data returned</strong>
                </p>
                <p>The query completed but returned no data.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Test Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Test Links</CardTitle>
          <CardDescription>
            Test payment items page with different project IDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: "5ec5a5c4-1cc8-4ea8-9f8f-e683b5c1fe96",
                name: "Smith Residence",
              },
              {
                id: "880e8400-e29b-41d4-a716-446655440001",
                name: "Downtown Office",
              },
              { id: "880e8400-e29b-41d4-a716-446655440002", name: "City Park" },
              {
                id: "880e8400-e29b-41d4-a716-446655440003",
                name: "Riverside Apts",
              },
              {
                id: "880e8400-e29b-41d4-a716-446655440004",
                name: "Highway Bridge",
              },
            ].map((project) => (
              <div key={project.id} className="flex gap-1">
                <Link to={`/payment-items-test/${project.id}`}>
                  <Button variant="outline" size="sm">
                    {project.name} (Public)
                  </Button>
                </Link>
                <Link to={`/projects/${project.id}/payment-items`}>
                  <Button variant="secondary" size="sm">
                    {project.name} (Auth)
                  </Button>
                </Link>
              </div>
            ))}
            <Link to="/payment-items-debug">
              <Button variant="outline" size="sm">
                Full Debug Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentItemsDebugSimple;
