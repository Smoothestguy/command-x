import React, { useState } from "react";
import { ProjectData } from "@/services/api";
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
} from "lucide-react";

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
            <div className="flex items-center">
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
          <TableCell>{project.location || "-"}</TableCell>
        )}

        {columns.includes("client") && (
          <TableCell>{project.client_name || "-"}</TableCell>
        )}

        {columns.includes("status") && (
          <TableCell>
            <Badge className={getStatusColor(project.status)}>
              {project.status || "Unknown"}
            </Badge>
          </TableCell>
        )}

        {columns.includes("priority") && (
          <TableCell>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority || "None"}
            </Badge>
          </TableCell>
        )}

        {columns.includes("category") && (
          <TableCell>{project.category || "-"}</TableCell>
        )}

        {columns.includes("progress") && (
          <TableCell>
            <div className="flex items-center gap-2">
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
          <TableCell>{formatDate(project.start_date)}</TableCell>
        )}

        {columns.includes("end_date") && (
          <TableCell>{formatDate(project.end_date)}</TableCell>
        )}

        {columns.includes("budget") && (
          <TableCell>
            {project.budget ? `$${project.budget.toLocaleString()}` : "-"}
          </TableCell>
        )}

        {columns.includes("manager") && (
          <TableCell>{project.manager_name || "-"}</TableCell>
        )}

        {columns.includes("tags") && (
          <TableCell>
            <div className="flex flex-wrap gap-1">
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
            className="flex justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(project)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => project.project_id && onDelete(project.project_id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded details */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={columns.length + 1} className="p-0">
            <div className="p-4 bg-gray-50">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="team">
                    <Users className="h-4 w-4 mr-2" />
                    Team
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="issues">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Issues
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">
                          Project Description
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.description || "No description available."}
                        </p>

                        <h3 className="font-medium mt-4 mb-2">
                          Project Details
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Category:</div>
                          <div>{project.category || "-"}</div>

                          <div className="text-gray-500">Risk Level:</div>
                          <div>{project.risk_level || "-"}</div>

                          <div className="text-gray-500">Created:</div>
                          <div>{formatDate(project.created_at)}</div>

                          <div className="text-gray-500">Last Updated:</div>
                          <div>{formatDate(project.updated_at)}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-2">Budget & Time</h3>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Budget Utilization
                              </span>
                              <span>
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
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Time Utilization
                              </span>
                              <span>
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

                      <div className="mt-4">
                        <Button variant="outline" size="sm">
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
    </>
  );
};

export default ExpandableProjectRow;
