import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@/components/products/Pagination";

describe("Pagination", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  describe("rendering", () => {
    it("displays current page information", () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );

      expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
    });

    it("renders previous button", () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      // First button should be previous (ChevronLeft)
      expect(buttons[0]).toBeInTheDocument();
    });

    it("renders next button", () => {
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      // Last button should be next (ChevronRight)
      expect(buttons[buttons.length - 1]).toBeInTheDocument();
    });

    it("renders page number buttons", () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
      );

      // Should show page numbers
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("calls onPageChange with previous page when previous button clicked", async () => {
      const user = userEvent.setup();
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]); // Previous button

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("calls onPageChange with next page when next button clicked", async () => {
      const user = userEvent.setup();
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[buttons.length - 1]); // Next button

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it("calls onPageChange when page number clicked", async () => {
      const user = userEvent.setup();
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );

      await user.click(screen.getByText("4"));

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
  });

  describe("disabled states", () => {
    it("disables previous button on first page", () => {
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toBeDisabled();
    });

    it("disables next button on last page", () => {
      render(
        <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[buttons.length - 1]).toBeDisabled();
    });

    it("does not call onPageChange when previous is disabled", async () => {
      const user = userEvent.setup();
      render(
        <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]); // Previous button

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("does not call onPageChange when next is disabled", async () => {
      const user = userEvent.setup();
      render(
        <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[buttons.length - 1]); // Next button

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe("single or no pages", () => {
    it("does not render when only one page", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
      );

      // Should render null
      expect(container.firstChild).toBeNull();
    });

    it("does not render when zero pages", () => {
      const { container } = render(
        <Pagination currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
      );

      // Should render null
      expect(container.firstChild).toBeNull();
    });
  });

  describe("current page highlighting", () => {
    it("highlights current page button", () => {
      render(
        <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
      );

      const page3Button = screen.getByText("3").closest("button");
      expect(page3Button).toHaveClass("bg-racing-red");
    });
  });
});
