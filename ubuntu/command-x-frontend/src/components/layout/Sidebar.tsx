import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FolderKanban,
  Wrench,
  Users,
  FileText,
  BarChart2,
  Settings,
  DollarSign,
} from "lucide-react"; // Using lucide-react icons from template

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-300 flex flex-col">
      <div className="mb-8 text-center">
        <Link to="/">
          <img
            src="/command-x-logo.png"
            alt="Command X Logo"
            className="h-24 mx-auto mb-2"
          />
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          <li className="mb-2">
            <Link
              to="/dashboard"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/dashboard" ? "bg-gray-200" : ""
              }`}
            >
              <Home className="mr-3 h-5 w-5" /> Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/projects"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/projects" ? "bg-gray-200" : ""
              }`}
            >
              <FolderKanban className="mr-3 h-5 w-5" /> Projects
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/work-orders"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/work-orders" ? "bg-gray-200" : ""
              }`}
            >
              <Wrench className="mr-3 h-5 w-5" /> Work Orders
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/subcontractors"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/subcontractors" ? "bg-gray-200" : ""
              }`}
            >
              <Users className="mr-3 h-5 w-5" /> Subcontractors
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/documents"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/documents" ? "bg-gray-200" : ""
              }`}
            >
              <FileText className="mr-3 h-5 w-5" /> Documents
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/accounting"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/accounting" ? "bg-gray-200" : ""
              }`}
            >
              <DollarSign className="mr-3 h-5 w-5" /> Accounting
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/reports"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/reports" ? "bg-gray-200" : ""
              }`}
            >
              <BarChart2 className="mr-3 h-5 w-5" /> Reports
            </Link>
          </li>
          <li className="mb-2">
            <Link
              to="/user-management"
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/user-management" ? "bg-gray-200" : ""
              }`}
            >
              <Settings className="mr-3 h-5 w-5" /> User Management
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500">
        Command X v0.1.0
      </div>
    </aside>
  );
};

export default Sidebar;
