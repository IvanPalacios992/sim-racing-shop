import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { FetchStatus } from "@/components/admin/adminUtils";

interface AdminListResult<T> {
  items: T[];
  totalPages: number;
}

interface UseAdminListReturn<T> {
  items: T[];
  page: number;
  totalPages: number;
  fetchStatus: FetchStatus;
  modalOpen: boolean;
  editItem: T | undefined;
  confirmDeleteId: string | null;
  deleting: boolean;
  setPage: (page: number) => void;
  setConfirmDeleteId: (id: string | null) => void;
  handleDelete: (id: string) => Promise<void>;
  handleSuccess: () => void;
  openCreate: () => void;
  openEdit: (item: T) => void;
  retry: () => void;
}

export function useAdminList<T>(
  fetchFn: (page: number) => Promise<AdminListResult<T>>,
  deleteFn: (id: string) => Promise<void>,
): UseAdminListReturn<T> {
  const { _hasHydrated } = useAuthStore();
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("loading");
  const [retryCount, setRetryCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const deleteFnRef = useRef(deleteFn);
  deleteFnRef.current = deleteFn;

  useEffect(() => {
    if (!_hasHydrated) return;
    setFetchStatus("loading");
    fetchFnRef.current(page).then(
      (result) => {
        if (isMountedRef.current) {
          setItems(result.items);
          setTotalPages(result.totalPages);
          setFetchStatus("success");
        }
      },
      () => {
        if (isMountedRef.current) setFetchStatus("error");
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, page, retryCount]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteFnRef.current(id);
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) {
        setPage(newPage);
      } else {
        setRetryCount((c) => c + 1);
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleSuccess = () => {
    setPage(1);
    setRetryCount((c) => c + 1);
  };

  const openCreate = () => {
    setEditItem(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: T) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return {
    items,
    page,
    totalPages,
    fetchStatus,
    modalOpen,
    editItem,
    confirmDeleteId,
    deleting,
    setPage,
    setConfirmDeleteId,
    handleDelete,
    handleSuccess,
    openCreate,
    openEdit,
    retry: () => setRetryCount((c) => c + 1),
  };
}
