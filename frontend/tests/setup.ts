import "@testing-library/jest-dom/vitest";
import React from "react";

// Polyfill ResizeObserver for Radix UI components in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Global mock for @/i18n/navigation used by all auth components
vi.mock("@/i18n/navigation", () => ({
  Link: (props: { href: string; children: React.ReactNode; [key: string]: unknown }) => {
    const { href, children, ...rest } = props;
    return React.createElement("a", { href, ...rest }, children);
  },
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  redirect: vi.fn(),
}));
