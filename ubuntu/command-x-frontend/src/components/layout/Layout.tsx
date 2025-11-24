import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile, useDeviceInfo } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const deviceInfo = useDeviceInfo();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--surface-0)] relative">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - conditionally shown based on state */}
      <div
        className={`
        ${isMobile ? "fixed z-30 h-full" : "relative"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out
        ${deviceInfo.isIOS ? "safe-area-top safe-area-bottom" : ""}
      `}
      >
        <Sidebar onCloseMobile={closeSidebar} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Header>
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-3 sm:p-5 md:p-8
          ${
            deviceInfo.isIOS
              ? "safe-area-bottom safe-area-left safe-area-right"
              : ""
          }`}
        >
          <div className="app-surface p-3 sm:p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
