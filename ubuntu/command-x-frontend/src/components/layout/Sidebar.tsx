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
  ShoppingCart,
  Building,
  Package,
  Contact2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeviceInfo } from "@/hooks/use-mobile";

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const deviceInfo = useDeviceInfo();

  return (
    <aside
      className={`w-[78vw] sm:w-[70vw] md:w-64 lg:w-68 h-full p-4 md:p-5 bg-white/90 backdrop-blur-xl border-r border-[var(--border-subtle)] shadow-lg flex flex-col rounded-tr-2xl rounded-br-2xl
      ${deviceInfo.isIOS ? "safe-area-top safe-area-bottom" : ""}`}
    >
      <div className="flex justify-between items-center mb-6">
        <Link to="/" onClick={onCloseMobile}>
          <img
            src="/command-x-logo.png"
            alt="Command X Logo"
            className="h-12 md:h-14 drop-shadow"
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
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/dashboard"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
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
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/projects"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <FolderKanban className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Projects</span>
            </Link>
          </li>
          <li>
            <Link
              to="/customers"
              onClick={onCloseMobile}
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/customers"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Contact2 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Customers</span>
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              onClick={onCloseMobile}
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/products"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Package className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Products</span>
            </Link>
          </li>
          <li>
            <Link
              to="/work-orders"
              onClick={onCloseMobile}
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/work-orders"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
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
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/purchase-orders"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
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
              className={`flex items-center p-2.5 text-sm font-medium rounded-xl transition ${
                location.pathname === "/vendors"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
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
              to="/personnel"
              onClick={onCloseMobile}
              className={`flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded min-h-[44px] ${
                location.pathname === "/personnel"
                  ? "bg-gray-200 font-medium"
                  : ""
              }`}
            >
              <Users className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">Personnel</span>
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
