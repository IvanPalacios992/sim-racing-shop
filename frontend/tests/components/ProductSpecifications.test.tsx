import { render, screen } from "../helpers/render";
import { ProductSpecifications } from "@/components/products/ProductSpecifications";
import { createMockProductSpecification } from "../helpers/products";

describe("ProductSpecifications", () => {
  describe("rendering", () => {
    it("renders the heading", () => {
      const specs = [createMockProductSpecification()];
      render(<ProductSpecifications specifications={specs} />);

      expect(
        screen.getByRole("heading", { level: 2 })
      ).toHaveTextContent("Technical Specifications");
    });

    it("renders all specifications", () => {
      const specs = [
        createMockProductSpecification({
          specKey: "Material",
          specValue: "Carbon Fiber",
          displayOrder: 0,
        }),
        createMockProductSpecification({
          specKey: "Diameter",
          specValue: "270mm",
          displayOrder: 1,
        }),
        createMockProductSpecification({
          specKey: "Weight",
          specValue: "1.2kg",
          displayOrder: 2,
        }),
      ];
      render(<ProductSpecifications specifications={specs} />);

      expect(screen.getByText("Material")).toBeInTheDocument();
      expect(screen.getByText("Carbon Fiber")).toBeInTheDocument();
      expect(screen.getByText("Diameter")).toBeInTheDocument();
      expect(screen.getByText("270mm")).toBeInTheDocument();
      expect(screen.getByText("Weight")).toBeInTheDocument();
      expect(screen.getByText("1.2kg")).toBeInTheDocument();
    });
  });

  describe("ordering", () => {
    it("renders specifications sorted by displayOrder", () => {
      const specs = [
        createMockProductSpecification({
          specKey: "Third",
          specValue: "C",
          displayOrder: 2,
        }),
        createMockProductSpecification({
          specKey: "First",
          specValue: "A",
          displayOrder: 0,
        }),
        createMockProductSpecification({
          specKey: "Second",
          specValue: "B",
          displayOrder: 1,
        }),
      ];

      const { container } = render(
        <ProductSpecifications specifications={specs} />
      );

      const rows = container.querySelectorAll(
        ".overflow-hidden > div"
      );
      expect(rows[0]).toHaveTextContent("First");
      expect(rows[1]).toHaveTextContent("Second");
      expect(rows[2]).toHaveTextContent("Third");
    });
  });

  describe("styling", () => {
    it("applies alternating background colors to rows", () => {
      const specs = [
        createMockProductSpecification({
          specKey: "Row 0",
          specValue: "even",
          displayOrder: 0,
        }),
        createMockProductSpecification({
          specKey: "Row 1",
          specValue: "odd",
          displayOrder: 1,
        }),
        createMockProductSpecification({
          specKey: "Row 2",
          specValue: "even again",
          displayOrder: 2,
        }),
      ];

      const { container } = render(
        <ProductSpecifications specifications={specs} />
      );

      const rows = container.querySelectorAll(
        ".overflow-hidden > div"
      );
      expect(rows[0].className).toContain("bg-graphite/50");
      expect(rows[1].className).toContain("bg-carbon");
      expect(rows[2].className).toContain("bg-graphite/50");
    });
  });
});
