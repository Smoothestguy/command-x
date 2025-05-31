import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { RootState } from "../../store/store";
import { Button } from "@/components/ui/button";
import { LogOut, User, MoreVertical } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeviceInfo } from "@/hooks/use-mobile";

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const deviceInfo = useDeviceInfo();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      className={`bg-gray-800 text-white p-2 sm:p-4 shadow-md flex justify-between items-center
      ${
        deviceInfo.isIOS ? "safe-area-top safe-area-left safe-area-right" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {children}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/command-x-logo-white.png"
            alt="Command X Logo"
            className="h-8 sm:h-10"
          />
        </Link>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:text-white hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        )}
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white min-h-[44px] min-w-[44px]"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={deviceInfo.isIOS ? "safe-area-right" : ""}
            >
              <DropdownMenuItem className="flex items-center gap-2 min-h-[44px]">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 min-h-[44px]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;
