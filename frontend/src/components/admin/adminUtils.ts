export type FetchStatus = "loading" | "success" | "error";

export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const extractApiError = (err: unknown): string | undefined =>
  (err as { response?: { data?: { message?: string } } }).response?.data?.message;
