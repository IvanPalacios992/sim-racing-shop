"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminRowActionsProps {
  isConfirming: boolean;
  deleting: boolean;
  onEdit: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}

export default function AdminRowActions({
  isConfirming,
  deleting,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: AdminRowActionsProps) {
  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-silver text-xs">¿Eliminar?</span>
        <Button size="xs" variant="destructive" disabled={deleting} onClick={onConfirmDelete}>
          Sí
        </Button>
        <Button size="xs" variant="secondary" onClick={onCancelDelete}>
          No
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="p-1.5 text-silver hover:text-electric-blue transition-colors rounded"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={onRequestDelete}
        className="p-1.5 text-silver hover:text-racing-red transition-colors rounded"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
