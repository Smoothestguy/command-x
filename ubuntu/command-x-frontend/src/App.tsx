import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store/store";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import WorkOrders from "./pages/WorkOrders";
import Subcontractors from "./pages/Subcontractors";
import DocumentsPage from "./pages/DocumentsPage";
import Accounting from "./pages/Accounting";
import ReportsPage from "./pages/ReportsPage";
import UserManagement from "./pages/UserManagement";
import AllActivity from "./pages/AllActivity";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage"; // Import LoginPage
import { useEffect } from "react";
import { setUser } from "./features/auth/authSlice";

// Protected Route Component
const ProtectedRoute = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  if (!token) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the requested component within the Layout
  return (
    <Layout>
      <Outlet /> {/* This renders the nested child route component */}
    </Layout>
  );
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
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/work-orders" element={<WorkOrders />} />
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
    </Router>
  );
}

export default App;
