"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useThemeContext } from "./theme-provider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { isAutoTheme, setIsAutoTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Format current time for display
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-white hover:text-white hover:bg-gray-700 relative"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-theme"
              checked={isAutoTheme}
              onCheckedChange={(checked) => {
                setIsAutoTheme(checked);
                if (!checked) {
                  // If turning off auto theme, set to system
                  setTheme("system");
                }
              }}
            />
            <Label htmlFor="auto-theme" className="cursor-pointer">
              Auto (Time-based)
            </Label>
          </div>
          {isAutoTheme && (
            <div className="text-xs text-muted-foreground mt-1 text-center">
              Current time: {formattedTime}
              <div className="mt-1">
                <span className="inline-block w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mr-1"></span>
                <span>6:00 AM - 6:00 PM: Light</span>
              </div>
              <div className="mt-1">
                <span className="inline-block w-4 h-4 rounded-full bg-zinc-900 dark:bg-zinc-300 mr-1"></span>
                <span>6:00 PM - 6:00 AM: Dark</span>
              </div>
            </div>
          )}
        </div>
        {!isAutoTheme && (
          <>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <SunMoon className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
