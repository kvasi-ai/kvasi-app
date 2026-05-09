"use client";
import * as React from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [, setOpenK] = React.useState(false);

  return (
    <div className="flex h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onCommand={() => setOpenK(true)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
