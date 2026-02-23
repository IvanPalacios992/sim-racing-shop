"use client";

import { Check, X } from "lucide-react";
import { checkPasswordRequirements } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
  labels: {
    title: string;
    minLength: string;
    uppercase: string;
    lowercase: string;
    number: string;
  };
}

export function PasswordRequirements({
  password,
  labels,
}: PasswordRequirementsProps) {
  const requirements = checkPasswordRequirements(password);

  const items = [
    { key: "minLength", label: labels.minLength, met: requirements.minLength },
    { key: "uppercase", label: labels.uppercase, met: requirements.hasUppercase },
    { key: "lowercase", label: labels.lowercase, met: requirements.hasLowercase },
    { key: "number", label: labels.number, met: requirements.hasNumber },
  ];

  return (
    <div className="space-y-2 text-sm">
      <p className="text-silver font-medium">{labels.title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "flex items-center gap-2 transition-colors",
              item.met ? "text-success" : "text-silver"
            )}
          >
            {item.met ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PasswordRequirements;
