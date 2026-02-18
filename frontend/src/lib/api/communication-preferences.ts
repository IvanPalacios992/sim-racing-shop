import apiClient from "@/lib/api-client";
import { CommunicationPreferences } from "@/types/communication-preferences";

export const communicationPreferencesApi = {
  /**
   * Get user communication preferences
   * If preferences don't exist, they will be created with default values
   */
  async getPreferences(): Promise<CommunicationPreferences> {
    const response = await apiClient.get<CommunicationPreferences>(
      "/communication-preferences"
    );
    return response.data;
  },

  /**
   * Update user communication preferences
   * If preferences don't exist, they will be created with the provided values
   */
  async updatePreferences(
    preferences: CommunicationPreferences
  ): Promise<CommunicationPreferences> {
    const response = await apiClient.put<CommunicationPreferences>(
      "/communication-preferences",
      preferences
    );
    return response.data;
  },
};
