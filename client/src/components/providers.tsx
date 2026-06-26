"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Suspense, useEffect, useState } from "react";

import { ThemeProvider } from "./theme-provider";
import { NavigationLoading } from "./navigation-loading";
import { ElectroXExperience } from "./electrox-experience";
import { useAuth } from "@/store/auth";

function AuthBootstrap() {
  const { status, refreshMe } = useAuth();

  useEffect(() => {
    if (status !== "unknown") return;
    refreshMe().catch(() => null);
  }, [refreshMe, status]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <AuthBootstrap />
        <ElectroXExperience>{children}</ElectroXExperience>
        <Suspense fallback={null}>
          <NavigationLoading />
        </Suspense>
        <Toaster 
          position="top-center" 
          toastOptions={{ 
            className: "border border-[#FF3B30]/20 bg-[#130708]/95 text-white shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl font-semibold text-sm rounded-2xl",
            style: {
              background: "rgba(19, 7, 8, 0.96)",
              color: "#ffffff",
              border: "1px solid rgba(255, 59, 48, 0.22)"
            }
          }} 
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
