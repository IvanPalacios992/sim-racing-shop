"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import type { UserDto } from "@/types/auth";

// Module-level flag to prevent duplicate fetches across component remounts
let isCurrentlyFetching = false;
let hasFetchedOnce = false;

export default function ProfileContent() {
  const t = useTranslations("Profile");
  const { user: storeUser, _hasHydrated } = useAuthStore();
  const [user, setUser] = useState<UserDto | null>(storeUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for store to be hydrated before making API calls
    if (!_hasHydrated) {
      return;
    }

    // Prevent duplicate requests across remounts
    if (hasFetchedOnce || isCurrentlyFetching) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    isCurrentlyFetching = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await authApi.getMe();

        hasFetchedOnce = true;

        // Only update if component is still mounted
        if (isMounted) {
          setUser(userData);
          // Update authStore with fresh user data
          useAuthStore.getState().setUser(userData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (isMounted) {
          setError(t("errorLoadingProfile"));
        }
      } finally {
        isCurrentlyFetching = false;
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [_hasHydrated, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-silver">{t("loading")}</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-carbon-gray border border-graphite rounded-lg p-8 text-center">
        <p className="text-error mb-4">{error || t("noUserData")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-carbon-gray border border-graphite rounded-lg p-6">
        <h1 className="text-3xl font-bold text-pure-white mb-2">
          {t("title")}
        </h1>
        <p className="text-silver">{t("subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-carbon-gray border border-graphite rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-racing-red mb-2">0</div>
          <div className="text-sm text-silver">{t("stats.totalOrders")}</div>
        </div>
        <div className="bg-carbon-gray border border-graphite rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-electric-blue mb-2">
            €0.00
          </div>
          <div className="text-sm text-silver">{t("stats.totalSpent")}</div>
        </div>
        <div className="bg-carbon-gray border border-graphite rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-champagne-gold mb-2">0</div>
          <div className="text-sm text-silver">
            {t("stats.favoriteProducts")}
          </div>
        </div>
        <div className="bg-carbon-gray border border-graphite rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-success mb-2">
            {t("stats.memberLevel")}
          </div>
          <div className="text-sm text-silver">{t("stats.level")}</div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-carbon-gray border border-graphite rounded-lg p-6">
        <h2 className="text-xl font-bold text-pure-white mb-4">
          {t("personalInfo.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-silver mb-1">
              {t("personalInfo.fullName")}
            </div>
            <div className="text-pure-white">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : t("personalInfo.notProvided")}
            </div>
          </div>
          <div>
            <div className="text-sm text-silver mb-1">
              {t("personalInfo.email")}
            </div>
            <div className="text-pure-white">{user.email}</div>
          </div>
          <div>
            <div className="text-sm text-silver mb-1">
              {t("personalInfo.language")}
            </div>
            <div className="text-pure-white uppercase">{user.language}</div>
          </div>
          <div>
            <div className="text-sm text-silver mb-1">
              {t("personalInfo.emailVerified")}
            </div>
            <div
              className={
                user.emailVerified ? "text-success" : "text-warning"
              }
            >
              {user.emailVerified
                ? t("personalInfo.verified")
                : t("personalInfo.notVerified")}
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      {user.roles && user.roles.length > 0 && (
        <div className="bg-carbon-gray border border-graphite rounded-lg p-6">
          <h2 className="text-xl font-bold text-pure-white mb-4">
            {t("roles.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="px-3 py-1 bg-graphite text-electric-blue rounded-full text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="px-6 py-3 bg-racing-red hover:bg-racing-red/80 text-pure-white font-semibold rounded-lg transition-colors">
          {t("actions.editProfile")}
        </button>
        <button className="px-6 py-3 bg-graphite hover:bg-smoke text-pure-white font-semibold rounded-lg transition-colors">
          {t("actions.changePassword")}
        </button>
      </div>
    </div>
  );
}
