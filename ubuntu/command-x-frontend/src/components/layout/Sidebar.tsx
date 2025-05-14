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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();

  return (
    <aside className="w-[85vw] md:w-64 bg-gray-100 h-full p-4 border-r border-gray-300 flex flex-col shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" onClick={onCloseMobile}>
          <img
            src="/command-x-logo.png"
            alt="Command X Logo"
            className="h-16 md:h-20"
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCloseMobile}
          className="md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <Link
              to="/dashboard"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/dashboard"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Home className="mr-3 h-5 w-5" /> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/projects"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/projects"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <FolderKanban className="mr-3 h-5 w-5" /> Projects
            </Link>
          </li>
          <li>
            <Link
              to="/work-orders"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/work-orders"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Wrench className="mr-3 h-5 w-5" /> Work Orders
            </Link>
          </li>
          <li>
            <Link
              to="/subcontractors"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/subcontractors"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Users className="mr-3 h-5 w-5" /> Subcontractors
            </Link>
          </li>
          <li>
            <Link
              to="/documents"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/documents"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <FileText className="mr-3 h-5 w-5" /> Documents
            </Link>
          </li>
          <li>
            <Link
              to="/accounting"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/accounting"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <DollarSign className="mr-3 h-5 w-5" /> Accounting
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/reports"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <BarChart2 className="mr-3 h-5 w-5" /> Reports
            </Link>
          </li>
          <li>
            <Link
              to="/user-management"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded ${
                location.pathname === "/user-management"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Settings className="mr-3 h-5 w-5" /> User Management
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500 pt-4">
        Command X v0.1.0
      </div>
    </aside>
  );
};

export default Sidebar;
