"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
  showLogo?: boolean;
}

export function AuthCard({
  children,
  title,
  subtitle,
  showLogo = true,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-[420px] bg-carbon border-graphite shadow-lg">
      <CardHeader className="space-y-4 pb-4">
        {showLogo && (
          <Link href="/" className="flex justify-center">
            <div className="text-2xl font-bold text-white tracking-wider">
              SIMRACING<span className="text-racing-red">SHOP</span>
            </div>
          </Link>
        )}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-silver text-sm">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export default AuthCard;
