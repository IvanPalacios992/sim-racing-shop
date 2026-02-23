"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-carbon border border-graphite rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="px-6">
          <div className="flex items-center justify-between py-6 border-b border-graphite">
            <h2 className="text-xl font-bold text-pure-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-silver hover:text-electric-blue transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
