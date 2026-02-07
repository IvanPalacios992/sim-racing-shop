"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  showBrandPanel?: boolean;
  brandContent?: ReactNode;
}

export function AuthLayout({
  children,
  showBrandPanel = false,
  brandContent,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-obsidian flex">
      {/* Brand Panel - Only visible on desktop when enabled */}
      {showBrandPanel && (
        <div className="hidden lg:flex lg:w-1/2 relative bg-carbon">
          {/* Background image/gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(10,10,10,0.9), rgba(10,10,10,0.7)), url('/images/auth-bg.jpg')",
            }}
          />
          {/* Brand content */}
          <div className="relative z-10 flex flex-col justify-center p-12">
            {brandContent}
          </div>
        </div>
      )}

      {/* Auth Form Panel */}
      <div
        className={`flex-1 flex items-center justify-center p-6 ${
          showBrandPanel ? "lg:w-1/2" : "w-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
