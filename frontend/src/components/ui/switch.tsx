"use client";

import * as React from "react";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled = false, id, "aria-label": ariaLabel }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        id={id}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`
          relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full
          transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-racing-red focus:ring-offset-2 focus:ring-offset-obsidian-black
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? "bg-racing-red" : "bg-graphite"}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none absolute top-[2px] left-[2px] z-10 inline-block h-5 w-5
            rounded-full bg-white shadow-lg ring-0
            transition-transform duration-300 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-0"}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
