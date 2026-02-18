import { communicationPreferencesApi } from "@/lib/api/communication-preferences";
import apiClient from "@/lib/api-client";
import type { CommunicationPreferences } from "@/types/communication-preferences";

vi.mock("@/lib/api-client", () => {
  const mockApiClient = {
    get: vi.fn(),
    put: vi.fn(),
    defaults: { headers: { "Content-Type": "application/json" } },
  };
  return {
    default: mockApiClient,
  };
});

const mockPreferences: CommunicationPreferences = {
  newsletter: true,
  orderNotifications: true,
  smsPromotions: false,
};

describe("communicationPreferencesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPreferences", () => {
    it("gets preferences from /communication-preferences", async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPreferences });

      const result = await communicationPreferencesApi.getPreferences();

      expect(apiClient.get).toHaveBeenCalledWith("/communication-preferences");
      expect(result).toEqual(mockPreferences);
    });

    it("returns default preferences when none exist", async () => {
      const defaultPreferences: CommunicationPreferences = {
        newsletter: false,
        orderNotifications: true,
        smsPromotions: false,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: defaultPreferences });

      const result = await communicationPreferencesApi.getPreferences();

      expect(result).toEqual(defaultPreferences);
      expect(result.newsletter).toBe(false);
      expect(result.orderNotifications).toBe(true);
      expect(result.smsPromotions).toBe(false);
    });

    it("throws error when request fails", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

      await expect(communicationPreferencesApi.getPreferences()).rejects.toThrow(
        "Network error"
      );
    });

    it("throws error when unauthorized", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(communicationPreferencesApi.getPreferences()).rejects.toEqual(
        error
      );
    });
  });

  describe("updatePreferences", () => {
    it("updates preferences via PUT /communication-preferences", async () => {
      const updatedPreferences: CommunicationPreferences = {
        newsletter: false,
        orderNotifications: true,
        smsPromotions: true,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: updatedPreferences });

      const result = await communicationPreferencesApi.updatePreferences(
        updatedPreferences
      );

      expect(apiClient.put).toHaveBeenCalledWith(
        "/communication-preferences",
        updatedPreferences
      );
      expect(result).toEqual(updatedPreferences);
    });

    it("creates preferences if they don't exist", async () => {
      const newPreferences: CommunicationPreferences = {
        newsletter: true,
        orderNotifications: true,
        smsPromotions: false,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: newPreferences });

      const result = await communicationPreferencesApi.updatePreferences(
        newPreferences
      );

      expect(apiClient.put).toHaveBeenCalledWith(
        "/communication-preferences",
        newPreferences
      );
      expect(result).toEqual(newPreferences);
    });

    it("updates all boolean preferences correctly", async () => {
      const allTrue: CommunicationPreferences = {
        newsletter: true,
        orderNotifications: true,
        smsPromotions: true,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: allTrue });

      const result = await communicationPreferencesApi.updatePreferences(allTrue);

      expect(result.newsletter).toBe(true);
      expect(result.orderNotifications).toBe(true);
      expect(result.smsPromotions).toBe(true);
    });

    it("updates individual preferences independently", async () => {
      const onlyNewsletter: CommunicationPreferences = {
        newsletter: true,
        orderNotifications: false,
        smsPromotions: false,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: onlyNewsletter });

      const result = await communicationPreferencesApi.updatePreferences(
        onlyNewsletter
      );

      expect(result.newsletter).toBe(true);
      expect(result.orderNotifications).toBe(false);
      expect(result.smsPromotions).toBe(false);
    });

    it("throws error when update fails", async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new Error("Update failed"));

      await expect(
        communicationPreferencesApi.updatePreferences(mockPreferences)
      ).rejects.toThrow("Update failed");
    });

    it("throws error when unauthorized", async () => {
      const error = { response: { status: 401, data: { message: "Unauthorized" } } };
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(
        communicationPreferencesApi.updatePreferences(mockPreferences)
      ).rejects.toEqual(error);
    });
  });
});
