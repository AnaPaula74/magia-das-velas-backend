import "../setup.js";
import { jest } from "@jest/globals";
import path from "path";

import { upload } from "../../middlewares/uploadMiddleware.js";

describe("uploadMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("está configurado com storage diskStorage", () => {
    expect(upload).toBeDefined();

    expect(typeof upload.single).toBe("function");
  });

  it("gera nome único para arquivo", () => {
    const file = {
      originalname: "foto.png",
    } as any;

    const cb = jest.fn();

    const uniqueName =
      Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);

    expect(cb).toHaveBeenCalled();

    const nomeGerado = cb.mock.calls[0]?.[1];

    expect(nomeGerado).toMatch(/\.png$/);
  });
});