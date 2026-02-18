"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Modal from "@/components/ui/modal";
import { communicationPreferencesApi } from "@/lib/api/communication-preferences";
import { authApi } from "@/lib/api/auth";
import apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { CommunicationPreferences } from "@/types/communication-preferences";

export default function SettingsContent() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Communication Preferences State
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    newsletter: false,
    orderNotifications: true,
    smsPromotions: false,
  });
  const [preferencesLoading, setPreferencesLoading] = useState(true);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  // Password Reset State
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Load communication preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true);
      setPreferencesError(null);
      const data = await communicationPreferencesApi.getPreferences();
      setPreferences(data);
    } catch (error: unknown) {
      console.error("Error loading preferences:", error);
      setPreferencesError(t("communicationPreferences.loadError"));
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handlePreferenceChange = async (
    key: keyof CommunicationPreferences,
    value: boolean
  ) => {
    const previousPreferences = preferences;
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      setPreferencesSaving(true);
      setPreferencesError(null);
      setPreferencesSuccess(false);

      await communicationPreferencesApi.updatePreferences(newPreferences);

      setPreferencesSuccess(true);
      setTimeout(() => setPreferencesSuccess(false), 3000);
    } catch (error: unknown) {
      console.error("Error updating preferences:", error);
      setPreferencesError(t("communicationPreferences.saveError"));
      // Revert the change on error
      setPreferences(previousPreferences);
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    try {
      setPasswordResetLoading(true);
      setPasswordResetError(null);
      setPasswordResetSuccess(false);

      await authApi.forgotPassword({ email: user.email });

      setPasswordResetSuccess(true);
      setTimeout(() => setPasswordResetSuccess(false), 5000);
    } catch (error: unknown) {
      console.error("Error sending password reset email:", error);
      setPasswordResetError(t("security.emailError"));
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== user?.email) {
      setDeleteError(t("dangerZone.emailMismatch"));
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      // Call delete user endpoint
      await apiClient.delete("/user");

      // Logout and redirect
      logout();
      router.push("/");
    } catch (error: unknown) {
      console.error("Error deleting account:", error);
      setDeleteError(t("dangerZone.deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pure-white mb-2">
          {t("title")}
        </h1>
        <p className="text-silver">{t("subtitle")}</p>
      </div>

      {/* Communication Preferences Section */}
      <section className="bg-obsidian rounded-lg p-6">
        <div className="border-b border-graphite pb-4 mb-6">
          <h2 className="text-xl font-semibold text-pure-white">
            {t("communicationPreferences.title")}
          </h2>
        </div>

        {preferencesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-racing-red" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Newsletter */}
            <div className="flex items-center justify-between p-4 bg-carbon rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-pure-white mb-1">
                  {t("communicationPreferences.newsletter.title")}
                </div>
                <div className="text-sm text-silver">
                  {t("communicationPreferences.newsletter.description")}
                </div>
              </div>
              <Switch
                checked={preferences.newsletter}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("newsletter", checked)
                }
                disabled={preferencesSaving}
                aria-label={t("communicationPreferences.newsletter.title")}
              />
            </div>

            {/* Order Notifications */}
            <div className="flex items-center justify-between p-4 bg-carbon rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-pure-white mb-1">
                  {t("communicationPreferences.orderNotifications.title")}
                </div>
                <div className="text-sm text-silver">
                  {t("communicationPreferences.orderNotifications.description")}
                </div>
              </div>
              <Switch
                checked={preferences.orderNotifications}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("orderNotifications", checked)
                }
                disabled={preferencesSaving}
                aria-label={t("communicationPreferences.orderNotifications.title")}
              />
            </div>

            {/* SMS Promotions */}
            <div className="flex items-center justify-between p-4 bg-carbon rounded-lg">
              <div className="flex-1">
                <div className="font-semibold text-pure-white mb-1">
                  {t("communicationPreferences.smsPromotions.title")}
                </div>
                <div className="text-sm text-silver">
                  {t("communicationPreferences.smsPromotions.description")}
                </div>
              </div>
              <Switch
                checked={preferences.smsPromotions}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("smsPromotions", checked)
                }
                disabled={preferencesSaving}
                aria-label={t("communicationPreferences.smsPromotions.title")}
              />
            </div>

            {/* Save status */}
            {preferencesError && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{preferencesError}</span>
              </div>
            )}

            {preferencesSuccess && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{t("communicationPreferences.saveSuccess")}</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Security Section */}
      <section className="bg-obsidian rounded-lg p-6">
        <div className="border-b border-graphite pb-4 mb-6">
          <h2 className="text-xl font-semibold text-pure-white">
            {t("security.title")}
          </h2>
        </div>

        <p className="text-silver mb-6">{t("security.description")}</p>

        {passwordResetSuccess && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{t("security.emailSent")}</span>
          </div>
        )}

        {passwordResetError && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{passwordResetError}</span>
          </div>
        )}

        <Button
          onClick={handlePasswordReset}
          disabled={passwordResetLoading}
          className="min-w-[280px]"
        >
          {passwordResetLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("security.sending")}
            </>
          ) : (
            t("security.sendButton")
          )}
        </Button>
      </section>

      {/* Danger Zone Section */}
      <section className="bg-obsidian rounded-lg p-6 border border-error">
        <div className="border-b border-graphite pb-4 mb-6">
          <h2 className="text-xl font-semibold text-error">
            {t("dangerZone.title")}
          </h2>
        </div>

        <p className="text-silver mb-6">{t("dangerZone.description")}</p>

        <Button
          onClick={() => setShowDeleteModal(true)}
          variant="destructive"
          className="min-w-[200px]"
        >
          {t("dangerZone.deleteButton")}
        </Button>
      </section>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmEmail("");
          setDeleteError(null);
        }}
        title={t("dangerZone.modal.title")}
      >
        <div className="space-y-4">
          <p className="text-silver">{t("dangerZone.modal.description")}</p>

          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg">
            <p className="font-semibold mb-1">{t("dangerZone.modal.warning")}</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>{t("dangerZone.modal.consequence1")}</li>
              <li>{t("dangerZone.modal.consequence2")}</li>
              <li>{t("dangerZone.modal.consequence3")}</li>
            </ul>
          </div>

          <div>
            <Label htmlFor="confirm-email" className="text-pure-white">
              {t("dangerZone.modal.emailLabel", { email: user?.email || "" })}
            </Label>
            <Input
              id="confirm-email"
              type="email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
              placeholder={user?.email}
              className="mt-2"
            />
          </div>

          {deleteError && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmEmail("");
                setDeleteError(null);
              }}
              variant="secondary"
              className="flex-1"
              disabled={deleteLoading}
            >
              {t("dangerZone.modal.cancel")}
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="flex-1"
              disabled={deleteLoading || deleteConfirmEmail !== user?.email}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("dangerZone.modal.deleting")}
                </>
              ) : (
                t("dangerZone.modal.confirm")
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
