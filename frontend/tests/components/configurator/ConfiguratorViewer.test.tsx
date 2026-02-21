import React from "react";
import { render, screen, waitFor } from "../../helpers/render";
import type { CustomizationGroup } from "@/types/products";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// React Three Fiber: Canvas renders children as a plain div
vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
  }: {
    children: React.ReactNode;
    [k: string]: unknown;
  }) => React.createElement("div", { "data-testid": "r3f-canvas" }, children),
}));

// Drei: stubs for scene components; useGLTF is controlled per-test
const mockUseGLTF = vi.fn();
vi.mock("@react-three/drei", () => ({
  OrbitControls: (props: Record<string, unknown>) =>
    React.createElement("div", {
      "data-testid": "orbit-controls",
      "data-enable-pan": String(props.enablePan),
      "data-min-distance": String(props.minDistance),
      "data-max-distance": String(props.maxDistance),
    }),
  Environment: () => null,
  Html: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "html-overlay" }, children),
  useGLTF: (...args: unknown[]) => mockUseGLTF(...args),
  Bounds: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "bounds" }, children),
}));

import { ConfiguratorViewer } from "@/components/configurator/ConfiguratorViewer";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMockClonedScene(getObjectByName = vi.fn()) {
  return {
    scale: { setScalar: vi.fn() },
    position: { set: vi.fn() },
    // No-op traverse: no meshes → no material overrides, no canvas 2d calls
    traverse: vi.fn(),
    getObjectByName,
    // Required by Three.js Box3.expandByObject when computing bounding box
    updateWorldMatrix: vi.fn(),
    geometry: undefined,
    children: [],
  };
}

function makeMockScene(cloned = makeMockClonedScene()) {
  return { clone: vi.fn().mockReturnValue(cloned) };
}

const defaultGroups: CustomizationGroup[] = [];
const defaultSelections: Record<string, string | null> = {};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ConfiguratorViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGLTF.mockReturnValue({ scene: makeMockScene() });
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  describe("structure", () => {
    it("renders the R3F Canvas wrapper", () => {
      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={defaultGroups}
          selections={defaultSelections}
        />
      );

      expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
    });

    it("renders OrbitControls inside the canvas", () => {
      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={defaultGroups}
          selections={defaultSelections}
        />
      );

      expect(screen.getByTestId("orbit-controls")).toBeInTheDocument();
    });

    it("disables pan on OrbitControls", () => {
      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={defaultGroups}
          selections={defaultSelections}
        />
      );

      expect(
        screen.getByTestId("orbit-controls").dataset.enablePan
      ).toBe("false");
    });

    it("renders Bounds wrapper for auto-framing", () => {
      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={defaultGroups}
          selections={defaultSelections}
        />
      );

      expect(screen.getByTestId("bounds")).toBeInTheDocument();
    });

    it("passes modelUrl to useGLTF", () => {
      render(
        <ConfiguratorViewer
          modelUrl="/models/hypercar.glb"
          groups={defaultGroups}
          selections={defaultSelections}
        />
      );

      expect(mockUseGLTF).toHaveBeenCalledWith("/models/hypercar.glb");
    });
  });

  // ── Object visibility ──────────────────────────────────────────────────────

  describe("object visibility based on selections", () => {
    it("sets selected object visible and unselected object hidden", async () => {
      const selectedObj = { visible: false };
      const unselectedObj = { visible: true };

      const getObjectByName = vi.fn((name: string) => {
        if (name === "WheelBlack") return selectedObj;
        if (name === "WheelRed") return unselectedObj;
        return null;
      });

      mockUseGLTF.mockReturnValue({
        scene: makeMockScene(makeMockClonedScene(getObjectByName)),
      });

      const groups: CustomizationGroup[] = [
        {
          name: "Color",
          isRequired: true,
          options: [
            {
              componentId: "opt-black",
              name: "Black",
              description: null,
              glbObjectName: "WheelBlack",
              thumbnailUrl: null,
              priceModifier: 0,
              isDefault: true,
              displayOrder: 0,
              inStock: true,
            },
            {
              componentId: "opt-red",
              name: "Red",
              description: null,
              glbObjectName: "WheelRed",
              thumbnailUrl: null,
              priceModifier: 0,
              isDefault: false,
              displayOrder: 1,
              inStock: true,
            },
          ],
        },
      ];

      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={groups}
          selections={{ Color: "opt-black" }}
        />
      );

      await waitFor(() => {
        expect(selectedObj.visible).toBe(true);
        expect(unselectedObj.visible).toBe(false);
      });
    });

    it("hides all options when selection is null", async () => {
      const obj1 = { visible: true };
      const obj2 = { visible: true };

      const getObjectByName = vi.fn((name: string) => {
        if (name === "WheelBlack") return obj1;
        if (name === "WheelRed") return obj2;
        return null;
      });

      mockUseGLTF.mockReturnValue({
        scene: makeMockScene(makeMockClonedScene(getObjectByName)),
      });

      const groups: CustomizationGroup[] = [
        {
          name: "Color",
          isRequired: false,
          options: [
            { componentId: "opt-black", name: "Black", description: null, glbObjectName: "WheelBlack", thumbnailUrl: null, priceModifier: 0, isDefault: false, displayOrder: 0, inStock: true },
            { componentId: "opt-red", name: "Red", description: null, glbObjectName: "WheelRed", thumbnailUrl: null, priceModifier: 0, isDefault: false, displayOrder: 1, inStock: true },
          ],
        },
      ];

      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={groups}
          selections={{ Color: null }}
        />
      );

      await waitFor(() => {
        expect(obj1.visible).toBe(false);
        expect(obj2.visible).toBe(false);
      });
    });

    it("does not throw when a glbObjectName is not found in the scene", async () => {
      const getObjectByName = vi.fn().mockReturnValue(null);

      mockUseGLTF.mockReturnValue({
        scene: makeMockScene(makeMockClonedScene(getObjectByName)),
      });

      const groups: CustomizationGroup[] = [
        {
          name: "Color",
          isRequired: true,
          options: [
            { componentId: "opt-1", name: "Black", description: null, glbObjectName: "MissingObject", thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
          ],
        },
      ];

      expect(() =>
        render(
          <ConfiguratorViewer
            modelUrl="/models/product.glb"
            groups={groups}
            selections={{ Color: "opt-1" }}
          />
        )
      ).not.toThrow();
    });

    it("skips options without a glbObjectName", async () => {
      const getObjectByName = vi.fn();

      mockUseGLTF.mockReturnValue({
        scene: makeMockScene(makeMockClonedScene(getObjectByName)),
      });

      const groups: CustomizationGroup[] = [
        {
          name: "Color",
          isRequired: true,
          options: [
            { componentId: "opt-1", name: "Black", description: null, glbObjectName: null, thumbnailUrl: null, priceModifier: 0, isDefault: true, displayOrder: 0, inStock: true },
          ],
        },
      ];

      render(
        <ConfiguratorViewer
          modelUrl="/models/product.glb"
          groups={groups}
          selections={{ Color: "opt-1" }}
        />
      );

      await waitFor(() => {
        // getObjectByName should not be called for options without glbObjectName
        expect(getObjectByName).not.toHaveBeenCalled();
      });
    });
  });
});
