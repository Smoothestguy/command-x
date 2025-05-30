import React, { useState, useEffect } from "react";
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
  ShoppingCart,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const [isIPhone, setIsIPhone] = useState(false);

  useEffect(() => {
    // Check if device is an iPhone
    const checkIfIPhone = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      setIsIPhone(isIOS);
    };

    checkIfIPhone();
  }, []);

  return (
    <aside
      className={`w-[85vw] md:w-64 bg-gray-100 h-full p-4 border-r border-gray-300 flex flex-col shadow-lg
      ${isIPhone ? "iphone-padding-top iphone-padding-bottom" : ""}`}
    >
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
          className="md:hidden min-h-[44px] min-w-[44px]"
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
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/dashboard"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/projects"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/projects"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <FolderKanban className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Projects</span>
            </Link>
          </li>
          <li>
            <Link
              to="/work-orders"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/work-orders"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Wrench className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Work Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/purchase-orders"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/purchase-orders"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <ShoppingCart className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Purchase Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/vendors"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/vendors"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Building className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Vendors</span>
            </Link>
          </li>
          <li>
            <Link
              to="/subcontractors"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/subcontractors"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Users className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Subcontractors</span>
            </Link>
          </li>
          <li>
            <Link
              to="/documents"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/documents"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <FileText className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Documents</span>
            </Link>
          </li>
          <li>
            <Link
              to="/accounting"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/accounting"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <DollarSign className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Accounting</span>
            </Link>
          </li>
          <li>
            <Link
              to="/reports"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/reports"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <BarChart2 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Reports</span>
            </Link>
          </li>
          <li>
            <Link
              to="/user-management"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/user-management"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">User Management</span>
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
