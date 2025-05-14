import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileView);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Detect iPhone
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
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile sidebar overlay */}
      {isMobileView && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - conditionally shown based on state */}
      <div
        className={`
        ${isMobileView ? "fixed z-30 h-full" : "relative"}
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out
        ${isIPhone ? "iphone-padding-top iphone-padding-bottom" : ""}
      `}
      >
        <Sidebar onCloseMobile={() => isMobileView && setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </Header>
        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-2 sm:p-4 md:p-6
          ${
            isIPhone
              ? "iphone-padding-bottom iphone-padding-left iphone-padding-right"
              : ""
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
