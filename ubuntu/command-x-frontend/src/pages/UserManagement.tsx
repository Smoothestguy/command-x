import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserPassword,
  UserData,
} from "../services/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MobileTable } from "@/components/ui/mobile-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Eye,
  EyeOff,
  UserPlus,
  Users,
  Shield,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCheck } from "../hooks/useAdminCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(/[_\s]/)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

// Helper function to get role icon
const getRoleIcon = (role: string) => {
  switch (role) {
    case "Admin":
      return <Shield className="h-4 w-4" />;
    case "ProjectManager":
      return <UserCog className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

// Helper function to get status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case "Inactive":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAdmin, currentUser } = useAdminCheck();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [userPassword, setUserPassword] = useState<string | null>(null);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Add resize listener for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserData[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Create User
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateDialogOpen(false);
      toast.success("User created successfully!");
    },
    onError: (err: any) => {
      console.error("Error creating user:", err);
      toast.error(
        `Failed to create user: ${err.response?.data?.message || err.message}`
      );
    },
  });

  // Update User
  const updateMutation = useMutation({
    mutationFn: (
      userData: Partial<Omit<UserData, "user_id" | "created_at">>
    ) => {
      if (!selectedUser?.user_id)
        throw new Error("No user selected for update");
      return updateUser(selectedUser.user_id, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully!");
    },
    onError: (err: any) => {
      console.error("Error updating user:", err);
      toast.error(
        `Failed to update user: ${err.response?.data?.message || err.message}`
      );
    },
  });

  // Delete User
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (err: any) => {
      console.error("Error deleting user:", err);
      toast.error(
        `Failed to delete user: ${err.response?.data?.message || err.message}`
      );
    },
  });

  // Form Handling (using Formik)
  const formik = useFormik<Partial<UserData> & { password?: string }>({
    initialValues: {
      username: "",
      email: "",
      role: "FieldStaff", // Default role
      status: "Active", // Default status
      password: "",
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      role: Yup.string().required("Role is required"),
      status: Yup.string().required("Status is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .test(
          "password-required",
          "Password is required for new users",
          function (value) {
            // Only require password for new users
            return selectedUser ? true : Boolean(value);
          }
        ),
    }),
    onSubmit: (values) => {
      const { password, ...userData } = values;
      const dataToSend: any = { ...userData };

      // Only include password if it's provided (for create or update)
      if (password) {
        dataToSend.password = password;
      }

      if (selectedUser) {
        updateMutation.mutate(dataToSend);
      } else {
        // Ensure password is included for creation
        if (!dataToSend.password) {
          toast.error("Password is required for new users.");
          return;
        }
        createMutation.mutate(dataToSend);
      }
    },
    enableReinitialize: true, // Reinitialize form when selectedUser changes
  });

  // Effect to set form values when editing
  useEffect(() => {
    if (selectedUser) {
      formik.setValues({
        username: selectedUser.username || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "FieldStaff",
        status: selectedUser.status || "Active",
        password: "", // Clear password field when editing
      });
    } else {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const handleEditClick = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedUser(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleViewPasswordClick = async (user: UserData) => {
    if (!isAdmin) return;

    setSelectedUser(user);
    setIsLoadingPassword(true);
    setUserPassword(null);
    setIsPasswordDialogOpen(true);

    try {
      const password = await getUserPassword(user.user_id);
      setUserPassword(password);
    } catch (error) {
      console.error("Error fetching password:", error);
      toast.error("Failed to retrieve password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Mobile-optimized header with centered title */}
      <div className="flex flex-col mb-6">
        <h1 className="text-3xl font-bold text-center mb-4">User Management</h1>
        <div className="flex flex-wrap justify-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    queryClient.invalidateQueries({ queryKey: ["users"] })
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh user list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAdmin && (
            <Button onClick={handleCreateClick}>
              <UserPlus className="mr-2 h-4 w-4" /> Create User
            </Button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restricted Access</AlertTitle>
          <AlertDescription>
            Only administrators can create, edit, or delete users. You are
            currently logged in as {currentUser?.username} with{" "}
            {currentUser?.role} role.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold">Error loading users</h3>
          <p>{error.message}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["users"] })
            }
          >
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !error && users && users.length === 0 && (
        <div className="text-center py-10 bg-muted/50 rounded-lg">
          <Users className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground mt-2">
            Create a user to get started
          </p>
        </div>
      )}

      {!isLoading && !error && users && users.length > 0 && (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="rounded-md border hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TooltipTrigger>
                          <TooltipContent>
                            {new Date(user.created_at).toLocaleString()}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin ? (
                          <>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleViewPasswordClick(user)
                                    }
                                  >
                                    <Eye className="h-4 w-4 text-amber-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Password</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditClick(user)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteClick(user.user_id)
                                    }
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-muted-foreground">
                                  <Lock className="h-4 w-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Admin access required</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Table View - Only visible on mobile */}
          <div className="md:hidden">
            <MobileTable
              data={users}
              keyExtractor={(user) => user.user_id || 0}
              columns={[
                {
                  id: "user",
                  header: "User",
                  cell: (user) => (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  ),
                },
                {
                  id: "email",
                  header: "Email",
                  cell: (user) => (
                    <span className="text-sm truncate max-w-[180px] block">
                      {user.email}
                    </span>
                  ),
                },
                {
                  id: "role",
                  header: "Role",
                  cell: (user) => (
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className="text-sm">{user.role}</span>
                    </div>
                  ),
                },
                {
                  id: "status",
                  header: "Status",
                  cell: (user) => getStatusBadge(user.status),
                },
                {
                  id: "created",
                  header: "Created",
                  cell: (user) => (
                    <span className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  ),
                },
              ]}
              renderActions={
                isAdmin
                  ? (user) => (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPasswordClick(user)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-amber-500" />
                          Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(user.user_id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )
                  : undefined
              }
              emptyMessage="No users found"
            />
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            formik.resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser ? (
                <>
                  <Pencil className="h-5 w-5" />
                  Edit User
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create User
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update the user details below."
                : "Enter the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="username">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter username"
                  className={
                    formik.touched.username && formik.errors.username
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.username && formik.errors.username ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.username}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter email address"
                  className={
                    formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : ""
                  }
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.role || ""}
                    onValueChange={(value) =>
                      formik.setFieldValue("role", value)
                    }
                  >
                    <SelectTrigger
                      id="role"
                      className={
                        formik.touched.role && formik.errors.role
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ProjectManager">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4" />
                          <span>Project Manager</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="FieldStaff">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Field Staff</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Finance">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Finance</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.role && formik.errors.role ? (
                    <div className="text-red-500 text-sm">
                      {formik.errors.role}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.status || ""}
                    onValueChange={(value) =>
                      formik.setFieldValue("status", value)
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className={
                        formik.touched.status && formik.errors.status
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Pending">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status ? (
                    <div className="text-red-500 text-sm">
                      {formik.errors.status}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="password">
                  Password{" "}
                  {!selectedUser && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`pr-10 ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder={
                      selectedUser
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.password}
                  </div>
                ) : null}
                {selectedUser && (
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep the current password unchanged.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                  formik.resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  formik.isSubmitting ||
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {formik.isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : selectedUser ? (
                  <span>Update User</span>
                ) : (
                  <span>Create User</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password View Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsPasswordDialogOpen(false);
            setUserPassword(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              User Password
            </DialogTitle>
            <DialogDescription>
              {selectedUser && `Viewing password for ${selectedUser.username}`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Warning</AlertTitle>
              <AlertDescription>
                Viewing passwords is a sensitive operation. Make sure no
                unauthorized personnel can see your screen.
              </AlertDescription>
            </Alert>

            {isLoadingPassword ? (
              <div className="flex justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : userPassword ? (
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    value={userPassword}
                    readOnly
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground">
                No password found for this user.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setUserPassword(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
