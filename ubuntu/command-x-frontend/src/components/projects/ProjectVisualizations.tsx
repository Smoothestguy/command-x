import React from "react";
import { ProjectData } from "@/services/api";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  // Legend - Uncomment if needed later
} from "recharts";

interface ProjectVisualizationsProps {
  projects: ProjectData[];
}

const ProjectVisualizations: React.FC<ProjectVisualizationsProps> = ({
  projects,
}) => {
  // Calculate budget utilization data
  const budgetData = projects.map((project) => {
    const budgetUtilization =
      project.actual_cost && project.budget
        ? (project.actual_cost / project.budget) * 100
        : 0;

    return {
      name: project.project_name,
      budget: project.budget || 0,
      actual: project.actual_cost || 0,
      utilization: budgetUtilization,
    };
  });

  // Calculate status distribution
  const statusCounts: Record<string, number> = {};
  projects.forEach((project) => {
    if (project.status) {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
    }
  });

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate category distribution
  const categoryCounts: Record<string, number> = {};
  projects.forEach((project) => {
    if (project.category) {
      categoryCounts[project.category] =
        (categoryCounts[project.category] || 0) + 1;
    }
  });

  // We'll use categoryCounts directly instead of categoryData

  // Colors for pie charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Progress</CardTitle>
            <CardDescription>
              Completion percentage of active projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .filter((p) => p.status === "In Progress")
                .map((project) => (
                  <div key={project.project_id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{project.project_name}</span>
                      <span>{project.progress_percentage || 0}%</span>
                    </div>
                    <Progress
                      value={project.progress_percentage || 0}
                      className="h-2"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Budget Utilization</CardTitle>
            <CardDescription>Actual vs. budgeted costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={false} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "",
                    ]}
                    labelFormatter={(label) =>
                      budgetData.find((d) => d.name === label)?.name || ""
                    }
                  />
                  <Bar dataKey="budget" name="Budget" fill="#8884d8" />
                  <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Distribution Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Project Status</CardTitle>
            <CardDescription>Distribution by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Projects"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Category Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Project Categories</CardTitle>
          <CardDescription>Distribution by project category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryCounts).map(([category, count], index) => (
              <Badge
                key={category}
                variant="outline"
                style={{
                  borderColor: COLORS[index % COLORS.length],
                  color: COLORS[index % COLORS.length],
                }}
              >
                {category}: {count} projects
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectVisualizations;
