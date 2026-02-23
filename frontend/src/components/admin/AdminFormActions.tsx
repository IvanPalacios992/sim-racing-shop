"use client";

import { Button } from "@/components/ui/button";

interface AdminFormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

export default function AdminFormActions({ loading, onCancel }: AdminFormActionsProps) {
  return (
    <div className="flex gap-3 pt-4 border-t border-graphite">
      <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading} className="flex-1">
        {loading ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
}
