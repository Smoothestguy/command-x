"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  storageKey?: string;
  enableAutoTheme?: boolean;
  lightStart?: number; // Hour to start light mode (24-hour format)
  darkStart?: number; // Hour to start dark mode (24-hour format)
};

type ThemeProviderState = {
  theme: string;
  setTheme: (theme: string) => void;
  isAutoTheme: boolean;
  setIsAutoTheme: (isAutoTheme: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  isAutoTheme: false,
  setIsAutoTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "command-x-ui-theme",
  enableAutoTheme = false,
  lightStart = 6, // 6 AM
  darkStart = 18, // 6 PM
  ...props
}: ThemeProviderProps) {
  const [isAutoTheme, setIsAutoTheme] = useState<boolean>(enableAutoTheme);

  // Function to determine theme based on time
  const getThemeByTime = () => {
    const currentHour = new Date().getHours();
    return currentHour >= lightStart && currentHour < darkStart
      ? "light"
      : "dark";
  };

  // Set up automatic theme switching based on time
  useEffect(() => {
    if (!isAutoTheme) return;

    // Initial theme setting
    const timeBasedTheme = getThemeByTime();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(timeBasedTheme);

    // Set up interval to check time and update theme
    const interval = setInterval(() => {
      const newTheme = getThemeByTime();
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAutoTheme, lightStart, darkStart]);

  return (
    <NextThemesProvider
      {...props}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      disableTransitionOnChange
      enableColorScheme
      attribute="class"
    >
      <ThemeProviderContextProvider
        isAutoTheme={isAutoTheme}
        setIsAutoTheme={setIsAutoTheme}
      >
        {children}
      </ThemeProviderContextProvider>
    </NextThemesProvider>
  );
}

// Context Provider component
type ThemeProviderContextProviderProps = {
  children: React.ReactNode;
  isAutoTheme: boolean;
  setIsAutoTheme: (isAutoTheme: boolean) => void;
};

const ThemeProviderContextProvider = ({
  children,
  isAutoTheme,
  setIsAutoTheme,
}: ThemeProviderContextProviderProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeProviderContext.Provider
      value={{
        theme: theme || "system",
        setTheme,
        isAutoTheme,
        setIsAutoTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useThemeContext must be used within a ThemeProvider");

  return context;
};
