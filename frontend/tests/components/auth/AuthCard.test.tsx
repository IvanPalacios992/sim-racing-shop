import { render, screen } from "../../helpers/render";
import { AuthCard } from "@/components/auth/AuthCard";

describe("AuthCard", () => {
  it("renders the title as an h1", () => {
    render(<AuthCard title="Welcome Back">content</AuthCard>);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Welcome Back");
  });

  it("renders subtitle when provided", () => {
    render(<AuthCard title="Title" subtitle="Sign in to continue">content</AuthCard>);
    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
  });

  it("does not render subtitle text when not provided", () => {
    render(<AuthCard title="Title">content</AuthCard>);
    const paragraphs = document.querySelectorAll(".text-silver.text-sm");
    expect(paragraphs).toHaveLength(0);
  });

  it("renders the SIMRACING SHOP logo by default", () => {
    render(<AuthCard title="Title">content</AuthCard>);
    expect(screen.getByText("SIMRACING")).toBeInTheDocument();
    expect(screen.getByText("SHOP")).toBeInTheDocument();
  });

  it("hides the logo when showLogo={false}", () => {
    render(<AuthCard title="Title" showLogo={false}>content</AuthCard>);
    expect(screen.queryByText("SIMRACING")).not.toBeInTheDocument();
  });

  it("renders children inside the card", () => {
    render(<AuthCard title="Title"><span data-testid="child">Hello</span></AuthCard>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("logo links to '/'", () => {
    render(<AuthCard title="Title">content</AuthCard>);
    const logoLink = screen.getByText("SIMRACING").closest("a");
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
