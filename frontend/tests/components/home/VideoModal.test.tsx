import userEvent from "@testing-library/user-event";
import { render, screen, fireEvent } from "../../helpers/render";
import { VideoModal } from "@/components/home/VideoModal";

const VIDEOS = [
  "UOL0ZeH6Re0",
  "UEuZG37gFdM",
  "WAvN0EzEacU",
  "tiTtgq2Pcow",
  "OSMCfPASImQ",
];

describe("VideoModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("renderizado", () => {
    it("no renderiza cuando isOpen es false", () => {
      render(<VideoModal isOpen={false} onClose={onClose} />);

      expect(screen.queryByText("COMING SOON")).not.toBeInTheDocument();
      expect(document.querySelector("iframe")).not.toBeInTheDocument();
    });

    it("renderiza el badge cuando isOpen es true", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      expect(screen.getByText("COMING SOON")).toBeInTheDocument();
    });

    it("renderiza el título", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Our video is on its way"
      );
    });

    it("renderiza la descripción", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      expect(
        screen.getByText(/working on something special/i)
      ).toBeInTheDocument();
    });

    it("renderiza un iframe con URL de YouTube embed", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      const iframe = document.querySelector("iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe!.src).toMatch(/youtube\.com\/embed\//);
    });

    it("la URL del iframe corresponde a uno de los vídeos predefinidos", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      const iframe = document.querySelector("iframe");
      expect(VIDEOS.some((id) => iframe!.src.includes(id))).toBe(true);
    });

    it("renderiza el botón de cerrar", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      expect(screen.getByLabelText("Close")).toBeInTheDocument();
    });

    it("renderiza el botón 'Next video'", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      expect(
        screen.getByRole("button", { name: /next video/i })
      ).toBeInTheDocument();
    });
  });

  describe("interacciones", () => {
    it("llama onClose al hacer clic en el botón X", async () => {
      const user = userEvent.setup();
      render(<VideoModal isOpen={true} onClose={onClose} />);

      await user.click(screen.getByLabelText("Close"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("llama onClose al hacer clic en el backdrop", async () => {
      const user = userEvent.setup();
      const { container } = render(<VideoModal isOpen={true} onClose={onClose} />);

      const backdrop = container.querySelector(".bg-black\\/90")!;
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("no llama onClose al hacer clic en el contenido del modal", async () => {
      const user = userEvent.setup();
      render(<VideoModal isOpen={true} onClose={onClose} />);

      await user.click(screen.getByRole("heading", { level: 2 }));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("llama onClose al pulsar la tecla Escape", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("no llama onClose al pulsar otras teclas", () => {
      render(<VideoModal isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: " " });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("no dispara Escape cuando el modal está cerrado", () => {
      render(<VideoModal isOpen={false} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("selección de vídeo", () => {
    it("al pulsar 'Next video' cambia la URL del iframe", async () => {
      const user = userEvent.setup();
      render(<VideoModal isOpen={true} onClose={onClose} />);

      const srcBefore = document.querySelector("iframe")!.src;

      await user.click(screen.getByRole("button", { name: /next video/i }));

      const srcAfter = document.querySelector("iframe")!.src;
      expect(srcAfter).not.toBe(srcBefore);
    });

    it("el nuevo vídeo siempre es distinto al anterior", async () => {
      const user = userEvent.setup();
      render(<VideoModal isOpen={true} onClose={onClose} />);

      const getVideoId = () =>
        VIDEOS.find((id) => document.querySelector("iframe")!.src.includes(id));

      const idBefore = getVideoId();
      await user.click(screen.getByRole("button", { name: /next video/i }));
      const idAfter = getVideoId();

      expect(idAfter).not.toBe(idBefore);
    });

    it("al cerrar y reabrir el modal se selecciona un nuevo vídeo", () => {
      // Cada montaje llama al inicializador de useState con crypto.getRandomValues
      vi.spyOn(crypto, "getRandomValues")
        .mockImplementationOnce((arr) => { (arr as Uint32Array)[0] = 0; return arr; }) // primer montaje → VIDEOS[0]
        .mockImplementationOnce((arr) => { (arr as Uint32Array)[0] = 4; return arr; }); // segundo montaje → VIDEOS[4]

      const { unmount } = render(<VideoModal isOpen={true} onClose={onClose} />);
      const srcFirst = document.querySelector("iframe")!.src;

      unmount();
      render(<VideoModal isOpen={true} onClose={onClose} />);

      const srcSecond = document.querySelector("iframe")!.src;
      expect(srcSecond).not.toBe(srcFirst);

      vi.restoreAllMocks();
    });
  });
});
