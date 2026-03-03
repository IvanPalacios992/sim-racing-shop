import { render, screen } from "../helpers/render";
import NotFoundPage from "@/app/[locale]/not-found";

vi.mock("@/components/not-found/NotFoundContent", () => ({
  default: () => <div data-testid="not-found-content">NotFoundContent</div>,
}));

describe("NotFoundPage ([locale]/not-found)", () => {
  it("renderiza sin errores", () => {
    render(<NotFoundPage />);

    expect(screen.getByTestId("not-found-content")).toBeInTheDocument();
  });

  it("delega el renderizado a NotFoundContent", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("NotFoundContent")).toBeInTheDocument();
  });
});
