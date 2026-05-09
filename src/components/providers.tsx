"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-paper-2)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-line)",
              borderRadius: "10px",
              fontSize: "13px",
              boxShadow: "var(--shadow-3)",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
