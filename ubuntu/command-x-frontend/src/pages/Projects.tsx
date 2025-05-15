import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  ProjectData,
} from "../services/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MobileTable from "@/components/ui/mobile-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PlusCircle, LayoutDashboard, LayoutList } from "lucide-react";
import { toast } from "sonner";

// Import our new components
import ProjectFilters, {
  ProjectFilters as ProjectFiltersType,
  SavedFilter,
} from "@/components/projects/ProjectFilters";
import ProjectVisualizations from "@/components/projects/ProjectVisualizations";
import ExpandableProjectRow from "@/components/projects/ExpandableProjectRow";
import ProjectTableControls, {
  availableColumns,
  ViewConfig,
} from "@/components/projects/ProjectTableControls";

const ProjectSchema = Yup.object().shape({
  project_name: Yup.string().required("Project name is required"),
  location: Yup.string(),
  client_name: Yup.string(),
  start_date: Yup.date().nullable(),
  end_date: Yup.date().nullable(),
  budget: Yup.number().nullable().positive("Budget must be positive"),
  status: Yup.string(),
});

const Projects: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );

  // New state variables for enhanced features
  const [viewMode, setViewMode] = useState<"table" | "dashboard">("table");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [filters, setFilters] = useState<ProjectFiltersType>({
    search: "",
    status: [],
    priority: [],
    category: [],
    dateRange: { from: undefined, to: undefined },
    budgetRange: { min: undefined, max: undefined },
    client: [],
    tags: [],
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeColumns, setActiveColumns] = useState<string[]>(
    availableColumns.filter((col) => col.default).map((col) => col.id)
  );
  const [savedViews, setSavedViews] = useState<ViewConfig[]>([]);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Projects
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery<ProjectData[], Error>({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  // --- Mutations ---

  // Create Project
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateDialogOpen(false);
      toast.success("Project created successfully!");
    },
    onError: (err: any) => {
      console.error("Error creating project:", err);
      // Provide more specific error messages based on the error
      if (err.response) {
        // Server responded with an error status
        const errorMessage =
          err.response.data?.message || "Server error occurred";
        toast.error(`Failed to create project: ${errorMessage}`);
      } else if (err.request) {
        // Request was made but no response received
        toast.error(
          "Failed to create project: No response from server. Check your connection."
        );
      } else {
        // Something else went wrong
        toast.error(
          `Failed to create project: ${err.message || "Unknown error"}`
        );
      }
    },
  });

  // Update Project
  const updateMutation = useMutation({
    mutationFn: (projectData: ProjectData) => {
      if (!projectData.project_id)
        throw new Error("No project ID found for update");
      return updateProject(projectData.project_id, projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      toast.success("Project updated successfully!");
    },
    onError: (err) => {
      console.error("Error updating project:", err);
      toast.error("Failed to update project.");
    },
  });

  // Delete Project
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (err) => {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project.");
    },
  });

  // --- Form Handling (using Formik) ---

  const formik = useFormik<ProjectData>({
    initialValues: {
      project_name: "",
      location: "",
      client_name: "",
      start_date: null,
      end_date: null,
      budget: null,
      status: "Planning",
    },
    validationSchema: ProjectSchema,
    onSubmit: (values) => {
      // Ensure proper data formatting before submission
      const submissionData = {
        ...values,
        // Convert budget string to number if present
        budget: values.budget ? Number(values.budget) : null,
      };

      if (selectedProject) {
        updateMutation.mutate({
          ...submissionData,
          project_id: selectedProject.project_id,
        });
      } else {
        createMutation.mutate(submissionData);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedProject changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedProject) {
      formik.setValues({
        project_id: selectedProject.project_id, // Preserve the project_id
        project_name: selectedProject.project_name || "",
        location: selectedProject.location || "",
        client_name: selectedProject.client_name || "",
        // Format dates for input type='date' if necessary, or use a date picker component
        start_date: selectedProject.start_date
          ? new Date(selectedProject.start_date).toISOString().split("T")[0]
          : null,
        end_date: selectedProject.end_date
          ? new Date(selectedProject.end_date).toISOString().split("T")[0]
          : null,
        budget: selectedProject.budget || null,
        status: selectedProject.status || "Planning",
      });
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  const handleEditClick = (project: ProjectData) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (projectId: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleCreateClick = () => {
    setSelectedProject(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Filter projects based on selected filters
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((project) => {
      // Search filter
      if (
        filters.search &&
        !project.project_name
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        project.status &&
        !filters.status.includes(project.status)
      ) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        project.priority &&
        !filters.priority.includes(project.priority)
      ) {
        return false;
      }

      // Category filter
      if (
        filters.category.length > 0 &&
        project.category &&
        !filters.category.includes(project.category)
      ) {
        return false;
      }

      // Client filter
      if (
        filters.client.length > 0 &&
        project.client_name &&
        !filters.client.includes(project.client_name)
      ) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0 && project.tags) {
        const hasMatchingTag = project.tags.some((tag) =>
          filters.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Date range filter - start date
      if (filters.dateRange.from && project.start_date) {
        const projectStartDate = new Date(project.start_date);
        if (projectStartDate < filters.dateRange.from) return false;
      }

      // Date range filter - end date
      if (filters.dateRange.to && project.end_date) {
        const projectEndDate = new Date(project.end_date);
        if (projectEndDate > filters.dateRange.to) return false;
      }

      // Budget range filter - min
      if (
        filters.budgetRange.min !== undefined &&
        project.budget !== undefined &&
        project.budget !== null
      ) {
        if (project.budget < filters.budgetRange.min) return false;
      }

      // Budget range filter - max
      if (
        filters.budgetRange.max !== undefined &&
        project.budget !== undefined &&
        project.budget !== null
      ) {
        if (project.budget > filters.budgetRange.max) return false;
      }

      return true;
    });
  }, [projects, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: ProjectFiltersType) => {
    setFilters(newFilters);
  };

  // Save filter
  const handleSaveFilter = (filter: SavedFilter) => {
    setSavedFilters([...savedFilters, filter]);
  };

  // Handle column changes
  const handleColumnsChange = (columns: string[]) => {
    setActiveColumns(columns);
  };

  // Save view
  const handleSaveView = (view: ViewConfig) => {
    setSavedViews([...savedViews, view]);
  };

  // Load view
  const handleLoadView = (view: ViewConfig) => {
    setActiveColumns(view.columns);
  };

  return (
    <div className="p-4 md:p-8 bg-white dark:bg-gray-900 rounded-lg shadow">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4 dark:text-white">
          Projects
        </h1>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex border dark:border-gray-700 rounded-md overflow-hidden">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-none"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("dashboard")}
              className="rounded-none"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
          <Button onClick={handleCreateClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      </div>

      {isLoading && <p>Loading projects...</p>}
      {error && (
        <p className="text-red-500">Error loading projects: {error.message}</p>
      )}

      {!isLoading && !error && projects && (
        <>
          {/* Project Filters */}
          <ProjectFilters
            onFilterChange={handleFilterChange}
            projects={projects}
            savedFilters={savedFilters}
            onSaveFilter={handleSaveFilter}
          />

          {/* Dashboard View */}
          {viewMode === "dashboard" && (
            <ProjectVisualizations projects={filteredProjects} />
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <>
              {/* Table Controls */}
              <ProjectTableControls
                projects={filteredProjects}
                activeColumns={activeColumns}
                onColumnsChange={handleColumnsChange}
                savedViews={savedViews}
                onSaveView={handleSaveView}
                onLoadView={handleLoadView}
              />

              {/* Desktop Table View */}
              {!isMobileView && (
                <Table responsive={true}>
                  <TableHeader>
                    <TableRow>
                      {activeColumns.includes("name") && (
                        <TableHead>Name</TableHead>
                      )}
                      {activeColumns.includes("location") && (
                        <TableHead>Location</TableHead>
                      )}
                      {activeColumns.includes("client") && (
                        <TableHead>Client</TableHead>
                      )}
                      {activeColumns.includes("status") && (
                        <TableHead>Status</TableHead>
                      )}
                      {activeColumns.includes("priority") && (
                        <TableHead>Priority</TableHead>
                      )}
                      {activeColumns.includes("category") && (
                        <TableHead>Category</TableHead>
                      )}
                      {activeColumns.includes("progress") && (
                        <TableHead>Progress</TableHead>
                      )}
                      {activeColumns.includes("start_date") && (
                        <TableHead>Start Date</TableHead>
                      )}
                      {activeColumns.includes("end_date") && (
                        <TableHead>End Date</TableHead>
                      )}
                      {activeColumns.includes("budget") && (
                        <TableHead>Budget</TableHead>
                      )}
                      {activeColumns.includes("manager") && (
                        <TableHead>Manager</TableHead>
                      )}
                      {activeColumns.includes("tags") && (
                        <TableHead>Tags</TableHead>
                      )}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <ExpandableProjectRow
                        key={project.project_id}
                        project={project}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        columns={activeColumns}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Mobile Table View */}
              {isMobileView && (
                <MobileTable
                  data={filteredProjects}
                  keyExtractor={(project) => project.project_id || 0}
                  onRowClick={(project) => handleEditClick(project)}
                  columns={[
                    {
                      id: "name",
                      header: "Project Name",
                      cell: (project) => project.project_name || "-",
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (project) => (
                        <div
                          className={`px-2 py-1 rounded-full text-xs text-center ${
                            project.status === "In Progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                              : project.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : project.status === "Planning"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          {project.status || "Unknown"}
                        </div>
                      ),
                    },
                    {
                      id: "client",
                      header: "Client",
                      cell: (project) => project.client_name || "-",
                    },
                    {
                      id: "start_date",
                      header: "Start Date",
                      cell: (project) =>
                        project.start_date
                          ? new Date(project.start_date).toLocaleDateString()
                          : "-",
                    },
                  ]}
                  renderActions={(project) => (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(project);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          project.project_id &&
                            handleDeleteClick(project.project_id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                />
              )}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No projects match your current filters.
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={
          selectedProject ? setIsEditDialogOpen : setIsCreateDialogOpen
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Project" : "Create Project"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject
                ? "Update the project details below."
                : "Enter the details for the new project."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="project_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formik.values.project_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.project_name && formik.errors.project_name ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.project_name}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formik.values.location || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_name" className="text-right">
                  Client
                </Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={formik.values.client_name || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                {/* Consider using a Select component here */}
                <Input
                  id="status"
                  name="status"
                  value={formik.values.status || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formik.values.start_date || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formik.values.end_date || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formik.values.budget || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.budget && formik.errors.budget ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.budget}
                  </div>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  selectedProject
                    ? setIsEditDialogOpen(false)
                    : setIsCreateDialogOpen(false)
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  // Manually trigger form validation before submission
                  formik.validateForm().then((errors) => {
                    if (Object.keys(errors).length === 0) {
                      // No validation errors, proceed with submission
                      formik.submitForm();
                    } else {
                      // Show validation errors
                      formik.setTouched(
                        Object.keys(errors).reduce((acc, key) => {
                          acc[key] = true;
                          return acc;
                        }, {} as any)
                      );
                      toast.error("Please fix the form errors before saving");
                    }
                  });
                }}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
