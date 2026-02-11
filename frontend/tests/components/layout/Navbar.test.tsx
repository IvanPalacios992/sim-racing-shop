import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/components/layout/Navbar";

describe("Navbar", () => {
  describe("rendering", () => {
    it("renders the logo", () => {
      render(<Navbar />);

      expect(screen.getByText("SIM")).toBeInTheDocument();
      expect(screen.getByText("RACING")).toBeInTheDocument();
    });

    it("logo links to home", () => {
      render(<Navbar />);

      const logo = screen.getByText("SIM").closest("a");
      expect(logo).toHaveAttribute("href", "/");
    });

    it("renders navigation links on desktop", () => {
      render(<Navbar />);

      expect(screen.getByText("PRODUCTS")).toBeInTheDocument();
      expect(screen.getByText("WHEELS")).toBeInTheDocument();
      expect(screen.getByText("PEDALS")).toBeInTheDocument();
      expect(screen.getByText("COCKPITS")).toBeInTheDocument();
      expect(screen.getByText("ACCESSORIES")).toBeInTheDocument();
    });

    it("products link is locale-aware", () => {
      render(<Navbar />);

      const productsLink = screen.getByText("PRODUCTS").closest("a");
      expect(productsLink).toHaveAttribute("href", "/productos");
    });

    it("renders action buttons", () => {
      render(<Navbar />);

      expect(screen.getByLabelText("Search")).toBeInTheDocument();
      expect(screen.getByLabelText("Account")).toBeInTheDocument();
      expect(screen.getByLabelText("Cart")).toBeInTheDocument();
    });

    it("search button links to products page", () => {
      render(<Navbar />);

      const searchButton = screen.getByLabelText("Search");
      expect(searchButton.closest("a")).toHaveAttribute("href", "/productos");
    });

    it("account button links to login", () => {
      render(<Navbar />);

      const accountButton = screen.getByLabelText("Account");
      expect(accountButton.closest("a")).toHaveAttribute("href", "/login");
    });

    it("displays cart badge with item count", () => {
      render(<Navbar />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("mobile menu", () => {
    it("renders mobile menu toggle button", () => {
      render(<Navbar />);

      expect(screen.getByLabelText("Menu")).toBeInTheDocument();
    });

    it("mobile menu is hidden by default", () => {
      render(<Navbar />);

      // Check that mobile menu links are not visible initially
      // We look for duplicate PRODUCTS text (one in desktop nav, one in mobile menu)
      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      // Only the desktop one should be visible
      expect(allProductsLinks).toHaveLength(1);
    });

    it("opens mobile menu when toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByLabelText("Menu");
      await user.click(menuButton);

      // After clicking, mobile menu should appear with duplicate links
      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      expect(allProductsLinks.length).toBeGreaterThan(1);
    });

    it("closes mobile menu when a link is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open menu
      const menuButton = screen.getByLabelText("Menu");
      await user.click(menuButton);

      // Click a link in the mobile menu
      const allProductsLinks = screen.queryAllByText("PRODUCTS");
      const mobileLink = allProductsLinks[1]; // Second one is the mobile menu link
      await user.click(mobileLink);

      // Menu should close
      const linksAfterClose = screen.queryAllByText("PRODUCTS");
      expect(linksAfterClose).toHaveLength(1);
    });
  });

  describe("styling", () => {
    it("has sticky positioning", () => {
      render(<Navbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("sticky");
    });

    it("has correct height", () => {
      render(<Navbar />);

      const header = screen.getByRole("banner");
      expect(header).toHaveClass("h-18");
    });
  });
});
