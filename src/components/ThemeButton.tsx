"use client";

import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "next-themes";

import dynamic from "next/dynamic";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ThemeButtonComponent = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-switch"
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Label htmlFor="theme-switch" className="sr-only">
        Toggle theme
      </Label>
      <div className="flex items-center space-x-2">
        {theme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {theme === "dark" ? "Dark" : "Light"} Mode
        </span>
      </div>
    </div>
  );
};

const ThemeButtonWrapper = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <ThemeButtonComponent />
  </ThemeProvider>
);

export const ThemeButton = dynamic(() => Promise.resolve(ThemeButtonWrapper), {
  ssr: false,
});
