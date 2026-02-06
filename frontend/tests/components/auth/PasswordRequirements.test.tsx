import { render, screen } from "../../helpers/render";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";

const labels = {
  title: "Password must contain:",
  minLength: "Minimum 8 characters",
  uppercase: "At least one uppercase letter",
  lowercase: "At least one lowercase letter",
  number: "At least one number",
};

describe("PasswordRequirements", () => {
  it("renders the title", () => {
    render(<PasswordRequirements password="" labels={labels} />);
    expect(screen.getByText("Password must contain:")).toBeInTheDocument();
  });

  it("shows all requirements as unmet for empty password", () => {
    render(<PasswordRequirements password="" labels={labels} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    items.forEach((item) => {
      expect(item).toHaveClass("text-silver");
    });
  });

  it("shows minLength as met for 8+ chars password", () => {
    render(<PasswordRequirements password="abcdefgh" labels={labels} />);
    const minLengthItem = screen.getByText("Minimum 8 characters").closest("li");
    expect(minLengthItem).toHaveClass("text-success");
  });

  it("shows uppercase as met when password contains uppercase", () => {
    render(<PasswordRequirements password="A" labels={labels} />);
    const uppercaseItem = screen.getByText("At least one uppercase letter").closest("li");
    expect(uppercaseItem).toHaveClass("text-success");
  });

  it("shows lowercase as met when password contains lowercase", () => {
    render(<PasswordRequirements password="a" labels={labels} />);
    const lowercaseItem = screen.getByText("At least one lowercase letter").closest("li");
    expect(lowercaseItem).toHaveClass("text-success");
  });

  it("shows number as met when password contains digit", () => {
    render(<PasswordRequirements password="1" labels={labels} />);
    const numberItem = screen.getByText("At least one number").closest("li");
    expect(numberItem).toHaveClass("text-success");
  });

  it("shows all requirements as met for 'Password1'", () => {
    render(<PasswordRequirements password="Password1" labels={labels} />);
    const items = screen.getAllByRole("listitem");
    items.forEach((item) => {
      expect(item).toHaveClass("text-success");
    });
  });

  it("shows mixed met/unmet for partial password", () => {
    render(<PasswordRequirements password="abc" labels={labels} />);
    const lowercaseItem = screen.getByText("At least one lowercase letter").closest("li");
    expect(lowercaseItem).toHaveClass("text-success");

    const minLengthItem = screen.getByText("Minimum 8 characters").closest("li");
    expect(minLengthItem).toHaveClass("text-silver");
  });
});
