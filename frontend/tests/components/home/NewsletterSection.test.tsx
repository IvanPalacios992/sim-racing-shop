import { render, screen, waitFor } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { NewsletterSection } from "@/components/home/NewsletterSection";

describe("NewsletterSection", () => {
  it("renders the newsletter title", () => {
    render(<NewsletterSection />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "JOIN THE RACING COMMUNITY"
    );
  });

  it("renders the subtitle", () => {
    render(<NewsletterSection />);

    expect(
      screen.getByText("Get exclusive offers, early access, and racing tips")
    ).toBeInTheDocument();
  });

  it("renders email input with placeholder", () => {
    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
  });

  it("renders subscribe button", () => {
    render(<NewsletterSection />);

    expect(screen.getByRole("button", { name: /subscribe/i })).toBeInTheDocument();
  });

  it("renders privacy message", () => {
    render(<NewsletterSection />);

    expect(
      screen.getByText("We respect your privacy. Unsubscribe anytime.")
    ).toBeInTheDocument();
  });

  it("allows user to type email", async () => {
    const user = userEvent.setup();
    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  it("shows loading state when submitting", async () => {
    const user = userEvent.setup();
    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(screen.getByText("SUBSCRIBING...")).toBeInTheDocument();
  });

  it("clears email input after successful submission", async () => {
    const user = userEvent.setup();
    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await user.type(emailInput, "test@example.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(
      () => {
        expect(emailInput).toHaveValue("");
      },
      { timeout: 2000 }
    );
  });

  it("disables input and button while submitting", async () => {
    const user = userEvent.setup();
    render(<NewsletterSection />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /subscribe/i });

    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
