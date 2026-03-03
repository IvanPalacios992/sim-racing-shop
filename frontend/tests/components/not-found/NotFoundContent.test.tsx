import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent } from "../../helpers/render";
import NotFoundContent from "@/components/not-found/NotFoundContent";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

function mockCanvasAndRaf() {
  const ctx = {
    clearRect: vi.fn(), fillRect: vi.fn(), beginPath: vi.fn(),
    moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fill: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(), roundRect: vi.fn(),
    save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    setLineDash: vi.fn(), fillText: vi.fn(),
    fillStyle: "", strokeStyle: "", lineWidth: 1,
    font: "", textAlign: "center" as CanvasTextAlign, globalAlpha: 1, lineDashOffset: 0,
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(window, "requestAnimationFrame").mockReturnValue(0);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
}

describe("NotFoundContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("renderizado", () => {
    it("muestra el bloque 404 clicable", () => {
      render(<NotFoundContent />);

      expect(screen.getByTitle("¿Buscas algo más?")).toBeInTheDocument();
    });

    it("muestra el título con el texto destacado", () => {
      render(<NotFoundContent />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Looks like you went off");
      expect(heading).toHaveTextContent("track");
    });

    it("muestra la descripción", () => {
      render(<NotFoundContent />);

      expect(
        screen.getByText(/The page you're looking for/i)
      ).toBeInTheDocument();
    });

    it("el enlace 'Back to home' apunta a /", () => {
      render(<NotFoundContent />);

      expect(
        screen.getByRole("link", { name: /back to home/i })
      ).toHaveAttribute("href", "/");
    });

    it("el enlace 'View products' apunta a /productos", () => {
      render(<NotFoundContent />);

      expect(
        screen.getByRole("link", { name: /view products/i })
      ).toHaveAttribute("href", "/productos");
    });

    it("muestra la pista del código Konami", () => {
      render(<NotFoundContent />);

      expect(screen.getByText("↑↑↓↓←→←→BA")).toBeInTheDocument();
    });

    it("el overlay del juego no se muestra inicialmente", () => {
      render(<NotFoundContent />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("triple clic en el 404", () => {
    it("tres clics consecutivos abren el juego", async () => {
      mockCanvasAndRaf();
      const user = userEvent.setup();
      render(<NotFoundContent />);

      const code404 = screen.getByTitle("¿Buscas algo más?");
      await user.click(code404);
      await user.click(code404);
      await user.click(code404);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("dos clics no abren el juego", async () => {
      const user = userEvent.setup();
      render(<NotFoundContent />);

      const code404 = screen.getByTitle("¿Buscas algo más?");
      await user.click(code404);
      await user.click(code404);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("código Konami", () => {
    it("la secuencia completa abre el juego", () => {
      mockCanvasAndRaf();
      render(<NotFoundContent />);

      KONAMI.forEach((key) => fireEvent.keyDown(document, { key }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("una secuencia incorrecta no abre el juego", () => {
      render(<NotFoundContent />);

      ["ArrowUp", "ArrowDown", "b", "a"].forEach((key) =>
        fireEvent.keyDown(document, { key })
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("juego abierto", () => {
    function openGame() {
      mockCanvasAndRaf();
      render(<NotFoundContent />);
      KONAMI.forEach((key) => fireEvent.keyDown(document, { key }));
    }

    it("muestra el encabezado SimRun 404", () => {
      openGame();

      expect(screen.getByText(/SimRun 404/i)).toBeInTheDocument();
    });

    it("muestra el botón de cerrar", () => {
      openGame();

      expect(
        screen.getByRole("button", { name: /cerrar juego/i })
      ).toBeInTheDocument();
    });

    it("el botón X cierra el juego", async () => {
      const user = userEvent.setup();
      openGame();

      await user.click(screen.getByRole("button", { name: /cerrar juego/i }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Escape cierra el juego", () => {
      openGame();

      fireEvent.keyDown(window, { key: "Escape" });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("lee la puntuación best desde localStorage al abrir", () => {
      localStorage.setItem("simrun404best", "42");
      mockCanvasAndRaf();
      render(<NotFoundContent />);
      KONAMI.forEach((key) => fireEvent.keyDown(document, { key }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Récord")).toBeInTheDocument();

      localStorage.removeItem("simrun404best");
    });
  });

  describe("código Konami – reset de índice", () => {
    it("una tecla incorrecta al inicio resetea el índice a 0 (la secuencia parcial no abre el juego)", () => {
      render(<NotFoundContent />);

      // Wrong key at the start → idx stays 0
      fireEvent.keyDown(document, { key: "z" });
      // Provide only 8 of the 10 Konami keys (not enough even from idx=0)
      KONAMI.slice(0, 8).forEach((key) => fireEvent.keyDown(document, { key }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("una tecla incorrecta (no KONAMI[0]) en mitad de la secuencia resetea el índice a 0", () => {
      render(<NotFoundContent />);

      // Advance partway through the sequence, then break it
      KONAMI.slice(0, 5).forEach((key) => fireEvent.keyDown(document, { key }));
      // Wrong key (not KONAMI[0]="ArrowUp") → idx resets to 0
      fireEvent.keyDown(document, { key: "z" });
      // Remaining 5 keys from idx=0 are not enough to complete the full 10
      KONAMI.slice(5).forEach((key) => fireEvent.keyDown(document, { key }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("triple clic – reset del temporizador", () => {
    it("el contador se resetea si pasan más de 600ms entre clics", () => {
      vi.useFakeTimers();
      render(<NotFoundContent />);

      const code404 = screen.getByTitle("¿Buscas algo más?");
      fireEvent.click(code404);
      fireEvent.click(code404);

      // Let the 600ms timer expire → counter resets to 0
      vi.advanceTimersByTime(700);

      // Two more clicks (total effective = 2 after reset, not enough to open)
      fireEvent.click(code404);
      fireEvent.click(code404);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });
});
