"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";
import { addressesApi } from "@/lib/api/addresses";
import type { UserDto } from "@/types/auth";
import type { BillingAddressDetailDto, DeliveryAddressDetailDto } from "@/types/addresses";
import { Plus, Pencil } from "lucide-react";
import AddBillingAddressModal from "./AddBillingAddressModal";
import AddDeliveryAddressModal from "./AddDeliveryAddressModal";
import BillingAddressCard from "./BillingAddressCard";
import DeliveryAddressCard from "./DeliveryAddressCard";
import EditUserModal from "./EditUserModal";
import { Button } from "../ui/button";

export default function ProfileContent() {
  const t = useTranslations("Profile");
  const { user: storeUser, _hasHydrated } = useAuthStore();
  const [user, setUser] = useState<UserDto | null>(storeUser);
  const [billingAddress, setBillingAddress] = useState<BillingAddressDetailDto | null>(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddressDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingBillingAddress, setEditingBillingAddress] = useState<BillingAddressDetailDto | null>(null);
  const [editingDeliveryAddress, setEditingDeliveryAddress] = useState<DeliveryAddressDetailDto | null>(null);

  useEffect(() => {
    // Wait for store to be hydrated before making API calls
    if (!_hasHydrated) {
      return;
    }

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user data and addresses in parallel
        const [userData, billing, delivery] = await Promise.all([
          authApi.getMe(),
          addressesApi.getBillingAddress(),
          addressesApi.getDeliveryAddresses(),
        ]);

        // Only update if component is still mounted
        if (isMounted) {
          setUser(userData);
          setBillingAddress(billing);
          setDeliveryAddresses(delivery);
          // Update authStore with fresh user data
          useAuthStore.getState().setUser(userData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        if (isMounted) {
          setError(t("errorLoadingProfile"));
        }
      } finally {
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

  const handleBillingAddressCreated = async () => {
    try {
      const billing = await addressesApi.getBillingAddress();
      setBillingAddress(billing);
    } catch (err) {
      console.error("Error refreshing billing address:", err);
    }
  };

  const handleDeliveryAddressCreated = async () => {
    try {
      const delivery = await addressesApi.getDeliveryAddresses();
      setDeliveryAddresses(delivery);
      setEditingDeliveryAddress(null);
    } catch (err) {
      console.error("Error refreshing delivery addresses:", err);
    }
  };

  const handleEditBilling = () => {
    if (billingAddress) {
      setEditingBillingAddress(billingAddress);
      setShowBillingModal(true);
    }
  };

  const handleEditDelivery = (address: DeliveryAddressDetailDto) => {
    setEditingDeliveryAddress(address);
    setShowDeliveryModal(true);
  };

  const handleDeleteDelivery = async (addressId: string) => {
    try {
      await addressesApi.deleteDeliveryAddress(addressId);
      const delivery = await addressesApi.getDeliveryAddresses();
      setDeliveryAddresses(delivery);
    } catch (err) {
      console.error("Error deleting delivery address:", err);
    }
  };

  const handleCloseBillingModal = () => {
    setShowBillingModal(false);
    setEditingBillingAddress(null);
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setEditingDeliveryAddress(null);
  };

  const handleUserUpdated = (updatedUser: UserDto) => {
    setUser(updatedUser);
    useAuthStore.getState().setUser(updatedUser);
  };

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
    <div>
      {/* Header */}
      <div className=" border-b border-graphite py-6 mb-6">
        <h1 className="text-3xl font-bold text-pure-white mb-2">
          {t("title")}
        </h1>
        <p className="text-silver">{t("subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-obsidian rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-racing-red mb-2">0</div>
          <div className="text-sm text-silver">{t("stats.totalOrders")}</div>
        </div>
        <div className="bg-obsidian rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-racing-red mb-2">
            €0.00
          </div>
          <div className="text-sm text-silver">{t("stats.totalSpent")}</div>
        </div>
        <div className="bg-obsidian rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-racing-red mb-2">0</div>
          <div className="text-sm text-silver">
            {t("stats.favoriteProducts")}
          </div>
        </div>
        <div className="bg-obsidian rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-racing-red mb-2">
            {t("stats.memberLevel")}
          </div>
          <div className="text-sm text-silver">{t("stats.level")}</div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-obsidian rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-pure-white">
            {t("personalInfo.title")}
          </h2>
          <button
            onClick={() => setShowEditUserModal(true)}
            className="text-silver hover:text-electric-blue transition-colors p-2 cursor-pointer"
            aria-label={t("personalInfo.edit")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
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

      {/* Billing Address */}
      <div className="bg-obsidian rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-pure-white mb-4">
          {t("addresses.billingTitle")}
        </h2>
        {billingAddress ? (
          <BillingAddressCard
            address={billingAddress}
            onEdit={handleEditBilling}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-silver mb-4">{t("addresses.noBillingAddress")}</p>
            <button
              onClick={() => setShowBillingModal(true)}
              className="px-4 py-2 bg-graphite hover:bg-smoke text-pure-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addresses.addBillingAddress")}
            </button>
          </div>
        )}
      </div>

      {/* Delivery Addresses */}
      <div className="bg-obsidian rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-pure-white mb-4">
          {t("addresses.deliveryTitle")}
        </h2>
        {deliveryAddresses.length > 0 ? (
          <div className="space-y-4">
            {deliveryAddresses.map((address) => (
              <DeliveryAddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEditDelivery(address)}
                onDelete={() => handleDeleteDelivery(address.id)}
              />
            ))}
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="w-full py-3 border-2 border-dashed border-graphite hover:border-electric-blue rounded-lg text-electric-blue font-semibold transition-colors inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t("addresses.addDeliveryAddress")}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-silver mb-4">{t("addresses.noDeliveryAddresses")}</p>
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="px-4 py-2 bg-graphite hover:bg-smoke text-pure-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("addresses.addDeliveryAddress")}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="secondary"
          className="px-6 py-3"
        >
          {t("actions.changePassword")}
        </Button>
      </div>

      {/* Modals */}
      {user && (
        <>
          <EditUserModal
            isOpen={showEditUserModal}
            onClose={() => setShowEditUserModal(false)}
            onSuccess={handleUserUpdated}
            currentUser={user}
          />
          <AddBillingAddressModal
            isOpen={showBillingModal}
            onClose={handleCloseBillingModal}
            onSuccess={handleBillingAddressCreated}
            userId={user.id}
            editAddress={editingBillingAddress}
          />
          <AddDeliveryAddressModal
            isOpen={showDeliveryModal}
            onClose={handleCloseDeliveryModal}
            onSuccess={handleDeliveryAddressCreated}
            userId={user.id}
            editAddress={editingDeliveryAddress}
          />
        </>
      )}
    </div>
  );
}
