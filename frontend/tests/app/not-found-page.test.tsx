import { notFound } from "next/navigation";
import CatchAllPage from "@/app/[locale]/[...rest]/page";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

describe("CatchAllPage ([...rest])", () => {
  beforeEach(() => vi.clearAllMocks());

  it("llama a notFound() al renderizar", () => {
    CatchAllPage();

    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("llama a notFound() en cada invocación", () => {
    CatchAllPage();
    CatchAllPage();

    expect(notFound).toHaveBeenCalledTimes(2);
  });
});
