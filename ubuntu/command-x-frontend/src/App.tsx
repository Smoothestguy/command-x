import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store/store";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import WorkOrders from "./pages/WorkOrders";
import PurchaseOrders from "./pages/PurchaseOrders";
import Vendors from "./pages/Vendors";
import Subcontractors from "./pages/Subcontractors";
import DocumentsPage from "./pages/DocumentsPage";
import Accounting from "./pages/Accounting";
import ReportsPage from "./pages/ReportsPage";
import UserManagement from "./pages/UserManagement";
import AllActivity from "./pages/AllActivity";
import PaymentItemsPage from "./pages/PaymentItemsPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage"; // Import LoginPage
import TestDialog from "./pages/TestDialog"; // Import TestDialog
import { useEffect } from "react";
import { setUser } from "./features/auth/authSlice";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import ErrorBoundary from "./components/ErrorBoundary";

// Role-based Protected Route Component
const ProtectedRoute = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, hasPermission, hasProjectAccess } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!token || !isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Role-based access control for specific routes
  const path = location.pathname;

  // Admin has access to everything
  if (hasPermission("admin")) {
    // If authenticated and has admin role, render the requested component within the Layout
    return (
      <Layout>
        <Outlet /> {/* This renders the nested child route component */}
      </Layout>
    );
  }

  // Project managers have access to most features except user management
  if (hasPermission("project_manager")) {
    if (path === "/user-management") {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  // Subcontractors have limited access
  if (hasPermission("subcontractor")) {
    // Subcontractors can only access dashboard, their assigned projects, and documents
    if (
      path.startsWith("/projects/") &&
      hasProjectAccess(parseInt(path.split("/")[2]))
    ) {
      return (
        <Layout>
          <Outlet />
        </Layout>
      );
    } else if (path === "/dashboard" || path === "/documents") {
      return (
        <Layout>
          <Outlet />
        </Layout>
      );
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Regular users have very limited access
  if (hasPermission("user")) {
    if (path === "/dashboard" || path === "/documents") {
      return (
        <Layout>
          <Outlet />
        </Layout>
      );
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Default fallback - shouldn't reach here but just in case
  return <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();

  // Load user data from token when the application starts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // For demo purposes, we'll create a mock user
      // In a real application, you would decode the token or make an API call to get the user data
      const mockUser = {
        userId: 1,
        username: "admin",
        role: "admin",
      };

      dispatch(setUser({ user: mockUser, token }));
    }
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Test Dialog Route - Public for testing */}
            <Route path="/test-dialog" element={<TestDialog />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route
                path="/projects/:projectId/payment-items"
                element={<PaymentItemsPage />}
              />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/accounting" element={<Accounting />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/activity" element={<AllActivity />} />
            </Route>

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
