import React, { createContext, useContext, useState, useEffect } from "react";
import { UserData } from "../services/api";

// Define the user role types
export type UserRole = "admin" | "project_manager" | "subcontractor" | "user";

// Define the auth context state
interface AuthContextState {
  isAuthenticated: boolean;
  user: UserData | null;
  userRole: UserRole;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  hasProjectAccess: (projectId: number) => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Set user role based on stored user data
        if (parsedUser.role) {
          setUserRole(parsedUser.role as UserRole);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login function - simplified to work with Redux auth
  const login = async (email: string, password: string) => {
    // This function is now primarily used to update our AuthContext state
    // The actual authentication is handled by the Redux auth system

    // For admin user
    if (email === "admin@example.com") {
      const adminUser: UserData = {
        user_id: 1,
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        status: "Active",
        created_at: new Date().toISOString(),
      };

      // Update state
      setUser(adminUser);
      setUserRole("admin");
      setIsAuthenticated(true);
      return;
    }

    // For other users (not implemented in this demo)
    // In a real app, we would get the user data from the API response
    const defaultUser: UserData = {
      user_id: 999,
      username: email.split("@")[0],
      email: email,
      role: "user",
      status: "Active",
      created_at: new Date().toISOString(),
    };

    setUser(defaultUser);
    setUserRole("user");
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    setUserRole("user");
  };

  // Function to check if user has required role
  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user) return false;

    // Admin has access to everything
    if (userRole === "admin") return true;

    // Check if user has one of the required roles
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }

    // Check if user has the specific required role
    return userRole === requiredRole;
  };

  // Function to check if user has access to a specific project
  const hasProjectAccess = (projectId: number): boolean => {
    if (!isAuthenticated || !user) return false;

    // Admin has access to all projects
    if (userRole === "admin") return true;

    // Project managers have access to their assigned projects
    if (userRole === "project_manager") {
      // In a real app, this would check if the project is assigned to this manager
      // For now, we'll assume they have access to all projects
      return true;
    }

    // Subcontractors have access only to projects they're assigned to
    if (userRole === "subcontractor" && user.subcontractor_id) {
      // In a real app, this would check if the subcontractor is assigned to this project
      // For now, we'll use a mock check
      const assignedProjects = [1, 2]; // Mock assigned project IDs
      return assignedProjects.includes(projectId);
    }

    // Regular users don't have access to projects
    return false;
  };

  const value = {
    isAuthenticated,
    user,
    userRole,
    login,
    logout,
    hasPermission,
    hasProjectAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
