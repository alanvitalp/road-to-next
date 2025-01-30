import { ThemeProvider as BaseThemeProvider } from "next-themes";
import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <BaseThemeProvider attribute={"class"} defaultTheme="system" enableSystem>{children}</BaseThemeProvider>
  )
}

export { ThemeProvider }