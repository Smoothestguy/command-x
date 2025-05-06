import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Pencil, Trash2, PlusCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

// UserSchema removed as it's not used

const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch Users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserData[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // --- Mutations ---

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
      // Pass the received userData directly, password handling will be done in onSubmit
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

  // --- Form Handling (using Formik) ---

  const formik = useFormik<Partial<UserData> & { password?: string }>({
    initialValues: {
      username: "",
      email: "",
      role: "FieldStaff", // Default role
      status: "Active", // Default status
      password: "",
    },
    validateOnChange: true,
    validateOnBlur: true,
    // Simplified validation schema to avoid context issues
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
    onSubmit: (values: Partial<UserData> & { password?: string }) => {
      console.log("Form submitted with values:", values);

      const { password, ...userData } = values;
      const dataToSend: any = { ...userData };

      // Only include password if it's provided (for create or update)
      if (password) {
        dataToSend.password = password;
      }

      if (selectedUser) {
        updateMutation.mutate(dataToSend);
      } else {
        // Ensure password is included for creation if required
        if (!dataToSend.password) {
          toast.error("Password is required for new users.");
          return;
        }
        createMutation.mutate(
          dataToSend as Omit<UserData, "user_id" | "created_at"> & {
            password?: string;
          }
        );
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
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(userId);
    }
  };

  const handleCreateClick = () => {
    setSelectedUser(null); // Ensure form is for creation
    formik.resetForm();
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleCreateClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      {isLoading && <p>Loading users...</p>}
      {error && (
        <p className="text-red-500">Error loading users: {error.message}</p>
      )}

      {!isLoading && !error && users && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
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
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteClick(user.user_id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={
          selectedUser ? setIsEditDialogOpen : setIsCreateDialogOpen
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? "Edit User" : "Create User"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Update the user details below."
                : "Enter the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Form Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.username && formik.errors.username ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.username}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="col-span-3"
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={formik.values.role || ""}
                  onValueChange={(value) => formik.setFieldValue("role", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* These roles should ideally come from a config or API */}
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="ProjectManager">
                      Project Manager
                    </SelectItem>
                    <SelectItem value="FieldStaff">Field Staff</SelectItem>
                    <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.role && formik.errors.role ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.role}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={formik.values.status || ""}
                  onValueChange={(value) =>
                    formik.setFieldValue("status", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.status && formik.errors.status ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.status}
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pr-10"
                    placeholder={
                      selectedUser
                        ? "Leave blank to keep current"
                        : "Required for new user"
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="col-span-4 text-red-500 text-sm text-right">
                    {formik.errors.password}
                  </div>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  selectedUser
                    ? setIsEditDialogOpen(false)
                    : setIsCreateDialogOpen(false)
                }
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  console.log("Save button clicked, submitting form");
                  // Force form validation and submission
                  formik.handleSubmit();
                }}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
