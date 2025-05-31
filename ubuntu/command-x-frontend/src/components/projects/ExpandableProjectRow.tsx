import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ProjectData } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import ReportIssueDialog from "./ReportIssueDialog";

interface ExpandableProjectRowProps {
  project: ProjectData;
  onEdit: (project: ProjectData) => void;
  onDelete: (projectId: number) => void;
  columns: string[];
}

const ExpandableProjectRow: React.FC<ExpandableProjectRowProps> = ({
  project,
  onEdit,
  onDelete,
  columns,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReportIssueDialogOpen, setIsReportIssueDialogOpen] = useState(false);

  // Get auth context for role-based access control
  const { hasPermission } = useAuth();

  // Get mobile state for responsive design
  const isMobile = useIsMobile();

  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Planning":
        return "bg-purple-100 text-purple-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate budget utilization
  const budgetUtilization =
    project.actual_cost && project.budget
      ? (project.actual_cost / project.budget) * 100
      : 0;

  // Calculate time utilization
  const timeUtilization =
    project.actual_hours && project.estimated_hours
      ? (project.actual_hours / project.estimated_hours) * 100
      : 0;

  return (
    <>
      {/* Main row */}
      <TableRow
        className={`cursor-pointer ${isExpanded ? "bg-gray-50" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {columns.includes("name") && (
          <TableCell className="font-medium">
            <div className="flex items-center table-cell-content">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {project.project_name}
            </div>
          </TableCell>
        )}

        {columns.includes("location") && (
          <TableCell>
            <span className="table-cell-content">
              {project.location || "-"}
            </span>
          </TableCell>
        )}

        {columns.includes("client") && (
          <TableCell>
            <span className="table-cell-content">
              {project.client_name || "-"}
            </span>
          </TableCell>
        )}

        {columns.includes("status") && (
          <TableCell>
            <span className="table-cell-content">
              <Badge className={getStatusColor(project.status)}>
                {project.status || "Unknown"}
              </Badge>
            </span>
          </TableCell>
        )}

        {columns.includes("priority") && (
          <TableCell>
            <span className="table-cell-content">
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority || "None"}
              </Badge>
            </span>
          </TableCell>
        )}

        {columns.includes("category") && (
          <TableCell>
            <span className="table-cell-content">
              {project.category || "-"}
            </span>
          </TableCell>
        )}

        {columns.includes("progress") && (
          <TableCell>
            <div className="flex items-center gap-2 table-cell-content">
              <Progress
                value={project.progress_percentage || 0}
                className="h-2 w-24"
              />
              <span className="text-xs">
                {project.progress_percentage || 0}%
              </span>
            </div>
          </TableCell>
        )}

        {columns.includes("start_date") && (
          <TableCell>
            <span className="table-cell-content">
              {formatDate(project.start_date)}
            </span>
          </TableCell>
        )}

        {columns.includes("end_date") && (
          <TableCell>
            <span className="table-cell-content">
              {formatDate(project.end_date)}
            </span>
          </TableCell>
        )}

        {columns.includes("budget") && (
          <TableCell>
            <span className="table-cell-content">
              {project.budget ? `$${project.budget.toLocaleString()}` : "-"}
            </span>
          </TableCell>
        )}

        {columns.includes("manager") && (
          <TableCell>
            <span className="table-cell-content">
              {project.manager_name || "-"}
            </span>
          </TableCell>
        )}

        {columns.includes("tags") && (
          <TableCell>
            <div className="flex flex-wrap gap-1 table-cell-content">
              {project.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </TableCell>
        )}

        <TableCell className="text-right">
          <div
            className="flex justify-end gap-2 table-cell-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Only show edit button for admin and project managers */}
            {hasPermission(["admin", "project_manager"]) && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(project)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}

            {/* Only show delete button for admin */}
            {hasPermission("admin") && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() =>
                  project.project_id && onDelete(project.project_id)
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Show view-only indicator for subcontractors and regular users */}
            {!hasPermission(["admin", "project_manager"]) && (
              <Badge variant="outline" className="text-xs">
                View Only
              </Badge>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded details */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="p-0">
            <div className={`p-4 bg-gray-50 ${isMobile ? "px-2" : ""}`}>
              <Tabs defaultValue="details">
                <TabsList
                  className={`mb-4 ${
                    isMobile ? "grid grid-cols-2 w-full h-auto" : ""
                  }`}
                >
                  <TabsTrigger
                    value="details"
                    className={isMobile ? "text-xs p-2" : ""}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {isMobile ? "Details" : "Details"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="team"
                    className={isMobile ? "text-xs p-2" : ""}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    {isMobile ? "Team" : "Team"}
                  </TabsTrigger>
                  {!isMobile && (
                    <>
                      <TabsTrigger value="timeline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Timeline
                      </TabsTrigger>
                      <TabsTrigger value="issues">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Issues
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Mobile: Additional tabs in second row */}
                {isMobile && (
                  <TabsList className="mb-4 grid grid-cols-2 w-full h-auto">
                    <TabsTrigger value="timeline" className="text-xs p-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="text-xs p-2">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Issues
                    </TabsTrigger>
                  </TabsList>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2 mb-4">
                  {project.project_id && (
                    <Link
                      to={`/projects/${project.project_id}/payment-item-selection`}
                    >
                      <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payment Items
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Details Tab */}
                <TabsContent value="details">
                  <div
                    className={`grid gap-4 ${
                      isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                    }`}
                  >
                    <Card className="overflow-visible">
                      <CardContent
                        className={`overflow-visible ${
                          isMobile ? "p-3" : "p-4"
                        }`}
                      >
                        <h3
                          className={`font-medium mb-2 ${
                            isMobile ? "text-sm" : ""
                          }`}
                        >
                          Project Description
                        </h3>
                        <div className="w-full overflow-visible">
                          <p
                            className={`text-gray-600 project-description ${
                              isMobile ? "text-xs" : "text-sm"
                            }`}
                          >
                            {project.description || "No description available."}
                          </p>
                        </div>

                        <h3
                          className={`font-medium mt-4 mb-2 ${
                            isMobile ? "text-sm" : ""
                          }`}
                        >
                          Project Details
                        </h3>
                        <div
                          className={`grid gap-2 ${
                            isMobile
                              ? "grid-cols-1 text-xs"
                              : "grid-cols-2 text-sm"
                          }`}
                        >
                          {isMobile ? (
                            <>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-500">Category:</span>
                                <span>{project.category || "-"}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-500">
                                  Risk Level:
                                </span>
                                <span>{project.risk_level || "-"}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-gray-500">Created:</span>
                                <span>{formatDate(project.created_at)}</span>
                              </div>
                              <div className="flex justify-between py-1">
                                <span className="text-gray-500">
                                  Last Updated:
                                </span>
                                <span>{formatDate(project.updated_at)}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-gray-500">Category:</div>
                              <div>{project.category || "-"}</div>
                              <div className="text-gray-500">Risk Level:</div>
                              <div>{project.risk_level || "-"}</div>
                              <div className="text-gray-500">Created:</div>
                              <div>{formatDate(project.created_at)}</div>
                              <div className="text-gray-500">Last Updated:</div>
                              <div>{formatDate(project.updated_at)}</div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className={isMobile ? "p-3" : "p-4"}>
                        <h3
                          className={`font-medium mb-2 ${
                            isMobile ? "text-sm" : ""
                          }`}
                        >
                          Budget & Time
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <div
                              className={`flex justify-between mb-1 ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Budget Utilization
                              </span>
                              <span className={isMobile ? "text-xs" : ""}>
                                ${project.actual_cost?.toLocaleString() || 0} /
                                ${project.budget?.toLocaleString() || 0}
                              </span>
                            </div>
                            <Progress
                              value={budgetUtilization}
                              className="h-2"
                              // Use className for styling instead of indicatorClassName
                              // The indicator will be styled with CSS
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                              {budgetUtilization.toFixed(1)}%
                            </div>
                          </div>

                          <div>
                            <div
                              className={`flex justify-between mb-1 ${
                                isMobile ? "text-xs" : "text-sm"
                              }`}
                            >
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Time Utilization
                              </span>
                              <span className={isMobile ? "text-xs" : ""}>
                                {project.actual_hours || 0} /{" "}
                                {project.estimated_hours || 0} hours
                              </span>
                            </div>
                            <Progress
                              value={timeUtilization}
                              className="h-2"
                              // Use className for styling instead of indicatorClassName
                            />
                            <div className="text-right text-xs text-gray-500 mt-1">
                              {timeUtilization.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Project Team</h3>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-md">
                          <div className="bg-blue-100 text-blue-800 p-2 rounded-full">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {project.manager_name || "Unassigned"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Project Manager
                            </div>
                          </div>
                        </div>

                        {/* Team Members */}
                        {project.team_members &&
                        project.team_members.length > 0 ? (
                          project.team_members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                            >
                              <div className="bg-gray-200 text-gray-800 p-2 rounded-full">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-gray-500">
                                  {member.role}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No team members assigned to this project.
                          </p>
                        )}

                        {/* Subcontractors Section */}
                        {project.subcontractors &&
                          project.subcontractors.length > 0 && (
                            <>
                              <h3 className="font-medium mt-6 mb-2">
                                Assigned Subcontractors
                              </h3>
                              {project.subcontractors.map((sub) => (
                                <div
                                  key={sub.subcontractor_id}
                                  className="flex items-center gap-3 p-2 bg-yellow-50 rounded-md"
                                >
                                  <div className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
                                    <Users className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {sub.company_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {sub.role || "Subcontractor"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Project Timeline</h3>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Start Date:
                          </span>
                          <span className="font-medium">
                            {formatDate(project.start_date)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            End Date:
                          </span>
                          <span className="font-medium">
                            {formatDate(project.end_date)}
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="text-sm text-gray-500 mb-1">
                            Overall Progress:
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={project.progress_percentage || 0}
                              className="h-2 flex-1"
                            />
                            <span className="text-sm font-medium">
                              {project.progress_percentage || 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-sm text-gray-500">
                          Timeline visualization would be displayed here,
                          showing project phases, milestones, and critical path.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Issues Tab */}
                <TabsContent value="issues">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Project Issues</h3>

                      <p className="text-sm text-gray-500">
                        No issues reported for this project.
                      </p>

                      {/* Allow all authenticated users to report issues */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsReportIssueDialogOpen(true);
                          }}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Report Issue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TableCell>
        </TableRow>
      )}
      {/* Report Issue Dialog */}
      <ReportIssueDialog
        open={isReportIssueDialogOpen}
        onOpenChange={setIsReportIssueDialogOpen}
        project={project}
      />
    </>
  );
};

export default ExpandableProjectRow;
