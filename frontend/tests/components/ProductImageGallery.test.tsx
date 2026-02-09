import userEvent from "@testing-library/user-event";
import { render, screen } from "../helpers/render";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import {
  createMockProductImage,
  createMockProductDetail,
} from "../helpers/products";

describe("ProductImageGallery", () => {
  describe("empty state", () => {
    it("renders placeholder when images array is empty", () => {
      const { container } = render(
        <ProductImageGallery images={[]} productName="Test Product" />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("does not render thumbnails when images array is empty", () => {
      render(
        <ProductImageGallery images={[]} productName="Test Product" />
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("single image", () => {
    it("renders main image", () => {
      const image = createMockProductImage({
        imageUrl: "https://example.com/photo.jpg",
        altText: "Product photo",
      });

      render(
        <ProductImageGallery images={[image]} productName="Test Product" />
      );

      const img = screen.getByAltText("Product photo");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
    });

    it("does not render thumbnail strip with single image", () => {
      const image = createMockProductImage();

      render(
        <ProductImageGallery images={[image]} productName="Test Product" />
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("multiple images", () => {
    const images = createMockProductDetail().images;

    it("renders thumbnails for each image", () => {
      render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });

    it("shows first image as main image by default", () => {
      const { container } = render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      // Main image is inside .relative container with object-contain
      const mainImg = container.querySelector(
        ".relative img.object-contain"
      ) as HTMLImageElement;
      expect(mainImg).toBeInTheDocument();
      expect(mainImg.src).toContain("image1.jpg");
      expect(mainImg.alt).toBe("Front view");
    });

    it("changes main image when clicking a thumbnail", async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]);

      const mainImg = container.querySelector(
        ".relative img.object-contain"
      ) as HTMLImageElement;
      expect(mainImg.src).toContain("image2.jpg");
      expect(mainImg.alt).toBe("Side view");
    });

    it("highlights selected thumbnail with border", async () => {
      const user = userEvent.setup();

      render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      const buttons = screen.getAllByRole("button");

      // First thumbnail is selected by default
      expect(buttons[0].className).toContain("border-racing-red");
      expect(buttons[1].className).not.toContain("border-racing-red");

      // Click second thumbnail
      await user.click(buttons[1]);
      expect(buttons[1].className).toContain("border-racing-red");
      expect(buttons[0].className).not.toContain("border-racing-red");
    });

    it("thumbnails have aria-label with image index", () => {
      render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      expect(
        screen.getByLabelText("Select image 1")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select image 2")
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Select image 3")
      ).toBeInTheDocument();
    });
  });

  describe("ordering", () => {
    it("sorts images by displayOrder", () => {
      const images = [
        createMockProductImage({
          id: "c",
          imageUrl: "https://example.com/third.jpg",
          altText: "Third",
          displayOrder: 2,
        }),
        createMockProductImage({
          id: "a",
          imageUrl: "https://example.com/first.jpg",
          altText: "First",
          displayOrder: 0,
        }),
        createMockProductImage({
          id: "b",
          imageUrl: "https://example.com/second.jpg",
          altText: "Second",
          displayOrder: 1,
        }),
      ];

      const { container } = render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      // Main image should be the one with displayOrder 0
      const mainImg = container.querySelector(
        ".relative img.object-contain"
      ) as HTMLImageElement;
      expect(mainImg.src).toContain("first.jpg");
    });
  });

  describe("gallery tab", () => {
    it("renders gallery tab label", () => {
      const images = [createMockProductImage()];

      render(
        <ProductImageGallery images={images} productName="Test Product" />
      );

      expect(screen.getByText("Gallery")).toBeInTheDocument();
    });
  });
});
