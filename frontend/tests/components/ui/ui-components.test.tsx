import React from "react";
import { render, screen } from "../../helpers/render";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders as a button element by default", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button").tagName).toBe("BUTTON");
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("sets data-variant attribute", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
  });

  it("sets data-size attribute", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });
});

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Input className="custom-input" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("custom-input");
  });

  it("supports type attribute", () => {
    render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
  });

  it("supports disabled state", () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
  });
});

describe("Label", () => {
  it("renders label text", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Label className="custom-label">Name</Label>);
    expect(screen.getByText("Name")).toHaveClass("custom-label");
  });
});

describe("Card", () => {
  it("renders Card with content", () => {
    render(<Card data-testid="card">Card content</Card>);
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders full card composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Content body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("applies data-slot attributes", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>T</CardTitle>
        </CardHeader>
        <CardContent>C</CardContent>
        <CardFooter>F</CardFooter>
      </Card>
    );

    expect(container.querySelector("[data-slot='card']")).toBeInTheDocument();
    expect(container.querySelector("[data-slot='card-header']")).toBeInTheDocument();
    expect(container.querySelector("[data-slot='card-title']")).toBeInTheDocument();
    expect(container.querySelector("[data-slot='card-content']")).toBeInTheDocument();
    expect(container.querySelector("[data-slot='card-footer']")).toBeInTheDocument();
  });

  it("applies custom className to Card", () => {
    render(<Card className="my-card" data-testid="card">Test</Card>);
    expect(screen.getByTestId("card")).toHaveClass("my-card");
  });
});

describe("Checkbox", () => {
  it("renders a checkbox", () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Toggle" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("applies custom className", () => {
    render(<Checkbox className="custom-check" aria-label="Check" />);
    expect(screen.getByRole("checkbox")).toHaveClass("custom-check");
  });
});
