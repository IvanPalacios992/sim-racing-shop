import userEvent from "@testing-library/user-event";
import { render, screen } from "../../helpers/render";
import { PasswordInput } from "@/components/auth/PasswordInput";

describe("PasswordInput", () => {
  it("renders an input with type='password' by default", () => {
    render(<PasswordInput />);
    const input = document.querySelector("input")!;
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles to type='text' when the toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const input = document.querySelector("input")!;
    const toggleBtn = screen.getByRole("button");
    await user.click(toggleBtn);

    expect(input).toHaveAttribute("type", "text");
  });

  it("toggles back to type='password' on second click", async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    const input = document.querySelector("input")!;
    const toggleBtn = screen.getByRole("button");
    await user.click(toggleBtn);
    await user.click(toggleBtn);

    expect(input).toHaveAttribute("type", "password");
  });

  it("shows sr-only 'Show' text when password is hidden", () => {
    render(<PasswordInput />);
    expect(screen.getByText("Show")).toBeInTheDocument();
  });

  it("shows sr-only 'Hide' text when password is visible", async () => {
    const user = userEvent.setup();
    render(<PasswordInput />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Hide")).toBeInTheDocument();
  });

  it("uses custom showLabel and hideLabel props", () => {
    render(<PasswordInput showLabel="Mostrar" hideLabel="Ocultar" />);
    expect(screen.getByText("Mostrar")).toBeInTheDocument();
  });

  it("toggle button has tabIndex={-1}", () => {
    render(<PasswordInput />);
    const toggleBtn = screen.getByRole("button");
    expect(toggleBtn).toHaveAttribute("tabindex", "-1");
  });

  it("passes through placeholder attribute", () => {
    render(<PasswordInput placeholder="Enter password" />);
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("passes through disabled attribute", () => {
    render(<PasswordInput disabled />);
    const input = document.querySelector("input")!;
    expect(input).toBeDisabled();
  });
});
