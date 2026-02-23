import userEvent from "@testing-library/user-event";
import { render, screen } from "../../helpers/render";
import Modal from "@/components/ui/modal";

describe("Modal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("does not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
    });

    it("renders when isOpen is true", () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("renders title in header", () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="My Modal Title">
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText("My Modal Title")).toBeInTheDocument();
    });

    it("renders close button with X icon", () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toBeInTheDocument();
    });

    it("renders children content", () => {
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div data-testid="modal-content">
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </div>
        </Modal>
      );
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );

      const closeButton = screen.getByLabelText("Close modal");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("styling", () => {
    it("applies correct background overlay classes", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      const overlay = container.querySelector(".bg-black\\/80");
      expect(overlay).toBeInTheDocument();
    });

    it("applies correct modal container classes", () => {
      const { container } = render(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      const modalContainer = container.querySelector(".bg-carbon");
      expect(modalContainer).toBeInTheDocument();
    });
  });
});
