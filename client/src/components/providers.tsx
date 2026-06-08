"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Suspense, useState } from "react";

import { ThemeProvider } from "./theme-provider";
import { NavigationLoading } from "./navigation-loading";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <Suspense fallback={null}>
          <NavigationLoading />
        </Suspense>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            className: "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 font-medium text-sm rounded-md shadow-lg"
          }} 
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
