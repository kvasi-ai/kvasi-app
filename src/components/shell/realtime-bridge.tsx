"use client";
import { useRealtimeWorkspace } from "@/lib/hooks/use-realtime";

export function RealtimeBridge() {
  useRealtimeWorkspace();
  return null;
}
