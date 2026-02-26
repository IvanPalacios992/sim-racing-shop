import type { ShippingCalculationDto, ShippingZoneDto } from "@/types/shipping";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({
  default: { get: mockGet, post: mockPost },
  apiClient: { get: mockGet, post: mockPost },
}));

import { shippingApi } from "@/lib/api/shipping";

const mockCalculation: ShippingCalculationDto = {
  zoneName: "Peninsular",
  baseCost: 6.25,
  weightCost: 0,
  totalCost: 6.25,
  weightKg: 0,
  isFreeShipping: false,
  freeShippingThreshold: 100,
  subtotalNeededForFreeShipping: 0,
};

const mockZone: ShippingZoneDto = {
  name: "Peninsular",
  baseCost: 6.25,
  costPerKg: 0.5,
  freeShippingThreshold: 100,
};

describe("shippingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── calculate ──────────────────────────────────────────────────────────────

  describe("calculate", () => {
    it("calls POST /shipping/calculate with the dto", async () => {
      mockPost.mockResolvedValue({ data: mockCalculation });

      const dto = { postalCode: "28001", subtotal: 349.99, weightKg: 0 };
      await shippingApi.calculate(dto);

      expect(mockPost).toHaveBeenCalledWith("/shipping/calculate", dto);
    });

    it("returns response data", async () => {
      mockPost.mockResolvedValue({ data: mockCalculation });

      const result = await shippingApi.calculate({
        postalCode: "28001",
        subtotal: 349.99,
        weightKg: 0,
      });

      expect(result).toEqual(mockCalculation);
    });
  });

  // ── getZones ───────────────────────────────────────────────────────────────

  describe("getZones", () => {
    it("calls GET /shipping/zones", async () => {
      mockGet.mockResolvedValue({ data: [mockZone] });

      await shippingApi.getZones();

      expect(mockGet).toHaveBeenCalledWith("/shipping/zones");
    });

    it("returns response data", async () => {
      mockGet.mockResolvedValue({ data: [mockZone] });

      const result = await shippingApi.getZones();

      expect(result).toEqual([mockZone]);
    });
  });
});
