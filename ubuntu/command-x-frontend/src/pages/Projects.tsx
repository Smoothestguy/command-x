// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { projectsApi, subcontractorsApi } from "../services/supabaseApi";
import { Database } from "../lib/database.types";

type ProjectData = Database["public"]["Tables"]["projects"]["Row"];
type SubcontractorData = Database["public"]["Tables"]["subcontractors"]["Row"];
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
import {
  PlusCircle,
  LayoutDashboard,
  LayoutList,
  X,
  Plus,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  subcontractors: Yup.array().of(
    Yup.object().shape({
      subcontractor_id: Yup.number().required(),
      company_name: Yup.string().required(),
      role: Yup.string(),
    })
  ),
});

const Projects: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null
  );

  // Get auth context for role-based access control
  const { userRole, hasPermission, hasProjectAccess, user } = useAuth();

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

  // State for new subcontractor dialog
  const [isNewSubcontractorDialogOpen, setIsNewSubcontractorDialogOpen] =
    useState(false);
  const [newSubcontractorData, setNewSubcontractorData] = useState<
    Partial<SubcontractorData>
  >({
    company_name: "",
    primary_contact_name: "",
    email: "",
    phone_number: "",
  });

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
    queryFn: projectsApi.getAll,
  });

  // Fetch Subcontractors
  const {
    data: subcontractors,
    isLoading: isLoadingSubcontractors,
    error: subcontractorsError,
  } = useQuery<SubcontractorData[], Error>({
    queryKey: ["subcontractors"],
    queryFn: subcontractorsApi.getAll,
  });

  // --- Mutations ---

  // Create Project
  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateDialogOpen(false);
      toast.success("Project created successfully!");
    },
    onError: (err: any) => {
      console.error("Error creating project:", err);
      toast.error(
        `Failed to create project: ${err.message || "Unknown error"}`
      );
    },
  });

  // Update Project
  const updateMutation = useMutation({
    mutationFn: (projectData: ProjectData) => {
      if (!projectData.project_id)
        throw new Error("No project ID found for update");
      return projectsApi.update(projectData.project_id, projectData);
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
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (err) => {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project.");
    },
  });

  // Create Subcontractor
  const createSubcontractorMutation = useMutation({
    mutationFn: subcontractorsApi.create,
    onSuccess: (newSubcontractor) => {
      queryClient.invalidateQueries({ queryKey: ["subcontractors"] });
      setIsNewSubcontractorDialogOpen(false);

      // Reset the form
      setNewSubcontractorData({
        company_name: "",
        primary_contact_name: "",
        email: "",
        phone_number: "",
      });

      toast.success("Subcontractor created successfully!");
    },
    onError: (err) => {
      console.error("Error creating subcontractor:", err);
      toast.error("Failed to create subcontractor.");
    },
  });

  // --- Form Handling (using Formik) ---

  const formik = useFormik<Partial<ProjectData>>({
    initialValues: {
      project_name: "",
      location: "",
      client_name: "",
      start_date: null,
      end_date: null,
      budget: null,
      status: "Active",
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
        } as ProjectData);
      } else {
        createMutation.mutate(submissionData as any);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedProject changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedProject) {
      formik.setValues({
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
        status: selectedProject.status || "Active",
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

  const handleDeleteClick = (projectId: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleCreateClick = () => {
    setSelectedProject(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  // Handler for opening the new subcontractor dialog
  const handleNewSubcontractorClick = () => {
    setIsNewSubcontractorDialogOpen(true);
  };

  // Handler for subcontractor form input changes
  const handleSubcontractorInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewSubcontractorData({
      ...newSubcontractorData,
      [name]: value,
    });
  };

  // Handler for creating a new subcontractor
  const handleCreateSubcontractor = () => {
    // Validate required fields
    if (!newSubcontractorData.company_name) {
      toast.error("Company name is required");
      return;
    }

    // Submit the new subcontractor
    createSubcontractorMutation.mutate(
      newSubcontractorData as SubcontractorData
    );
  };

  // Filter projects based on selected filters and user role
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    // First, filter by user role
    let roleFilteredProjects = projects;

    // If user is a subcontractor, only show projects they're assigned to
    if (userRole === "subcontractor" && user?.subcontractor_id) {
      roleFilteredProjects = projects.filter((project) => {
        // Check if this subcontractor is assigned to this project
        return project.subcontractors?.some(
          (sub) => sub.subcontractor_id === user.subcontractor_id
        );
      });
    }

    // Then apply the UI filters
    return roleFilteredProjects.filter((project) => {
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
  }, [projects, filters, userRole, user]);

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
    <div className="p-4 md:p-8">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">Projects</h1>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
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
          {/* Only show Create Project button for admin and project managers */}
          {hasPermission(["admin", "project_manager"]) && (
            <Button onClick={handleCreateClick}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Project
            </Button>
          )}
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
                              ? "bg-blue-100 text-blue-800"
                              : project.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : project.status === "Planning"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
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
                <div className="text-center py-8 text-gray-500">
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
          <form onSubmit={(e) => e.preventDefault()}>
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

              {/* Subcontractors Section */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Subcontractors</Label>
                <div className="col-span-3 space-y-2">
                  {/* Display selected subcontractors */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formik.values.subcontractors &&
                      formik.values.subcontractors.map((sub, index) => (
                        <Badge
                          key={sub.subcontractor_id}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {sub.company_name}
                          {sub.role && ` (${sub.role})`}
                          <button
                            type="button"
                            onClick={() => {
                              const newSubcontractors = [
                                ...(formik.values.subcontractors || []),
                              ];
                              newSubcontractors.splice(index, 1);
                              formik.setFieldValue(
                                "subcontractors",
                                newSubcontractors
                              );
                            }}
                            className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>

                  {/* Add subcontractor dropdown */}
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (!value) return;

                        // Check if the "create_new" option was selected
                        if (value === "create_new") {
                          handleNewSubcontractorClick();
                          return;
                        }

                        const selectedSubcontractor = subcontractors?.find(
                          (sub) => sub.subcontractor_id === parseInt(value)
                        );

                        if (selectedSubcontractor) {
                          // Check if already selected
                          const isAlreadySelected =
                            formik.values.subcontractors?.some(
                              (sub) =>
                                sub.subcontractor_id ===
                                selectedSubcontractor.subcontractor_id
                            );

                          if (!isAlreadySelected) {
                            const newSubcontractor = {
                              subcontractor_id:
                                selectedSubcontractor.subcontractor_id,
                              company_name: selectedSubcontractor.company_name,
                              role: "",
                              assigned_date: new Date().toISOString(),
                            };

                            formik.setFieldValue("subcontractors", [
                              ...(formik.values.subcontractors || []),
                              newSubcontractor,
                            ]);
                          } else {
                            toast.error(
                              "This subcontractor is already assigned to the project"
                            );
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add subcontractor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Option to create a new subcontractor */}
                        <SelectItem
                          value="create_new"
                          className="text-blue-600 font-medium"
                        >
                          <div className="flex items-center">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create New Subcontractor
                          </div>
                        </SelectItem>

                        <div className="py-1">
                          <div className="px-2 text-xs text-gray-500">
                            Existing Subcontractors
                          </div>
                        </div>

                        {isLoadingSubcontractors ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : subcontractorsError ? (
                          <SelectItem value="error" disabled>
                            Error loading subcontractors
                          </SelectItem>
                        ) : subcontractors?.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No subcontractors available
                          </SelectItem>
                        ) : (
                          subcontractors?.map((sub) => (
                            <SelectItem
                              key={sub.subcontractor_id}
                              value={sub.subcontractor_id?.toString()}
                            >
                              {sub.company_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role input for the last added subcontractor */}
                  {formik.values.subcontractors &&
                    formik.values.subcontractors.length > 0 && (
                      <div className="mt-2">
                        <Label
                          htmlFor="subcontractor-role"
                          className="text-sm mb-1 block"
                        >
                          Role for{" "}
                          {
                            formik.values.subcontractors[
                              formik.values.subcontractors.length - 1
                            ].company_name
                          }
                          :
                        </Label>
                        <Input
                          id="subcontractor-role"
                          placeholder="e.g., Electrical, Plumbing, etc."
                          value={
                            formik.values.subcontractors[
                              formik.values.subcontractors.length - 1
                            ].role || ""
                          }
                          onChange={(e) => {
                            const newSubcontractors = [
                              ...(formik.values.subcontractors || []),
                            ];
                            newSubcontractors[
                              newSubcontractors.length - 1
                            ].role = e.target.value;
                            formik.setFieldValue(
                              "subcontractors",
                              newSubcontractors
                            );
                          }}
                        />
                      </div>
                    )}
                </div>
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
                type="button" // Changed from "submit" to "button" to prevent double submission
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  // Manually trigger form validation before submission
                  formik.validateForm().then((errors) => {
                    if (Object.keys(errors).length === 0) {
                      // No validation errors, proceed with submission
                      formik.handleSubmit(); // Using handleSubmit instead of submitForm
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

      {/* New Subcontractor Dialog */}
      <Dialog
        open={isNewSubcontractorDialogOpen}
        onOpenChange={setIsNewSubcontractorDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Subcontractor</DialogTitle>
            <DialogDescription>
              Enter the details for the new subcontractor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company_name" className="text-right">
                Company Name*
              </Label>
              <Input
                id="company_name"
                name="company_name"
                value={newSubcontractorData.company_name || ""}
                onChange={handleSubcontractorInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_name" className="text-right">
                Contact Name
              </Label>
              <Input
                id="contact_name"
                name="contact_name"
                value={newSubcontractorData.contact_name || ""}
                onChange={handleSubcontractorInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newSubcontractorData.email || ""}
                onChange={handleSubcontractorInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={newSubcontractorData.phone || ""}
                onChange={handleSubcontractorInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="trade" className="text-right">
                Trade
              </Label>
              <Input
                id="trade"
                name="trade"
                value={newSubcontractorData.trade || ""}
                onChange={handleSubcontractorInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewSubcontractorDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateSubcontractor}
              disabled={createSubcontractorMutation.isPending}
            >
              {createSubcontractorMutation.isPending ? (
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
                  Creating...
                </>
              ) : (
                "Create Subcontractor"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
