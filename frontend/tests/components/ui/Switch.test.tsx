import userEvent from "@testing-library/user-event";
import { render, screen } from "../../helpers/render";
import { Switch } from "@/components/ui/switch";

describe("Switch", () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders switch in unchecked state", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute("aria-checked", "false");
    });

    it("renders switch in checked state", () => {
      render(<Switch checked={true} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toHaveAttribute("aria-checked", "true");
    });

    it("renders with aria-label when provided", () => {
      render(
        <Switch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          aria-label="Toggle notifications"
        />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-label", "Toggle notifications");
    });

    it("renders with id when provided", () => {
      render(
        <Switch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          id="my-switch"
        />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("id", "my-switch");
    });

    it("applies disabled state correctly", () => {
      render(
        <Switch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          disabled={true}
        />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("calls onCheckedChange with true when unchecked switch is clicked", async () => {
      const user = userEvent.setup();
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(mockOnCheckedChange).toHaveBeenCalledTimes(1);
      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("calls onCheckedChange with false when checked switch is clicked", async () => {
      const user = userEvent.setup();
      render(<Switch checked={true} onCheckedChange={mockOnCheckedChange} />);

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(mockOnCheckedChange).toHaveBeenCalledTimes(1);
      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it("does not call onCheckedChange when disabled switch is clicked", async () => {
      const user = userEvent.setup();
      render(
        <Switch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          disabled={true}
        />
      );

      const switchElement = screen.getByRole("switch");
      await user.click(switchElement);

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("applies correct background color when unchecked", () => {
      const { container } = render(
        <Switch checked={false} onCheckedChange={mockOnCheckedChange} />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("bg-graphite");
    });

    it("applies correct background color when checked", () => {
      const { container } = render(
        <Switch checked={true} onCheckedChange={mockOnCheckedChange} />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("bg-racing-red");
    });

    it("has transition classes for smooth animation", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("transition-colors");
      expect(switchElement).toHaveClass("duration-300");
    });

    it("has proper sizing classes", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("h-6");
      expect(switchElement).toHaveClass("w-12");
      expect(switchElement).toHaveClass("rounded-full");
    });

    it("applies disabled opacity when disabled", () => {
      render(
        <Switch
          checked={false}
          onCheckedChange={mockOnCheckedChange}
          disabled={true}
        />
      );
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("disabled:opacity-50");
    });
  });

  describe("accessibility", () => {
    it("has correct role attribute", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toBeInTheDocument();
    });

    it("has type button to prevent form submission", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("type", "button");
    });

    it("toggles aria-checked attribute correctly", () => {
      const { rerender } = render(
        <Switch checked={false} onCheckedChange={mockOnCheckedChange} />
      );
      let switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "false");

      rerender(<Switch checked={true} onCheckedChange={mockOnCheckedChange} />);
      switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("aria-checked", "true");
    });

    it("has focus ring for keyboard navigation", () => {
      render(<Switch checked={false} onCheckedChange={mockOnCheckedChange} />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("focus:outline-none");
      expect(switchElement).toHaveClass("focus:ring-2");
      expect(switchElement).toHaveClass("focus:ring-racing-red");
    });
  });
});
