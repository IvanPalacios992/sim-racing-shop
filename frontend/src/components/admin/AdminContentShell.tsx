"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FetchStatus } from "./adminUtils";

interface AdminContentShellProps {
  title: string;
  description: string;
  createLabel: string;
  onCreateClick: () => void;
  fetchStatus: FetchStatus;
  errorText: string;
  emptyText: string;
  isEmpty: boolean;
  onRetry: () => void;
  toolbar?: ReactNode;
  children: ReactNode;
}

export default function AdminContentShell({
  title,
  description,
  createLabel,
  onCreateClick,
  fetchStatus,
  errorText,
  emptyText,
  isEmpty,
  onRetry,
  toolbar,
  children,
}: AdminContentShellProps) {
  return (
    <div>
      <div className="border-b border-graphite py-6 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pure-white mb-1">{title}</h1>
          <p className="text-silver">{description}</p>
        </div>
        <Button onClick={onCreateClick} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {createLabel}
        </Button>
      </div>

      {toolbar && <div className="mb-4">{toolbar}</div>}

      {fetchStatus === "loading" && (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-obsidian border border-graphite rounded animate-pulse" />
          ))}
        </div>
      )}

      {fetchStatus === "error" && (
        <div className="bg-obsidian border border-graphite rounded-lg p-8 text-center">
          <p className="text-error mb-4">{errorText}</p>
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}

      {fetchStatus === "success" && (
        <>
          {isEmpty ? (
            <div className="bg-obsidian border border-graphite rounded-lg p-12 text-center">
              <p className="text-silver">{emptyText}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">{children}</div>
          )}
        </>
      )}
    </div>
  );
}
