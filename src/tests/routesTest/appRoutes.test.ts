import "../setup.js";
import fs from "fs/promises";
import path from "path";
import request from "supertest";
import { jest } from "@jest/globals";

import { app } from "../../app.js";
import { signAccessToken } from "../../utils/jwtUtils.js";
import { ProductService } from "../../services/productService.js";
import AuditService from "../../services/auditService.js";

describe("app routes", () => {
  const adminToken = signAccessToken({
    id: 1,
    email: "admin@test.com",
    role: "admin",
  });
  const userToken = signAccessToken({
    id: 2,
    email: "user@test.com",
    role: "user",
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuditService.prototype, "log").mockResolvedValue(undefined);
  });

  afterEach(async () => {
    const uploadDir = path.resolve("uploads");
    const files = await fs.readdir(uploadDir).catch(() => []);

    await Promise.all(
      files
        .filter((file) => file.includes("produto"))
        .map((file) => fs.rm(path.join(uploadDir, file), { force: true }))
    );
  });

  it("valida payload de registro pela rota", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Ana",
        email: "ana@email.com",
        password: "fraca",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: "Dados inválidos",
        details: expect.any(Array),
      })
    );
  });

  it("bloqueia criação de produto sem token", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .field("name", "Vela")
      .field("description", "Vela aromática")
      .field("price", "20")
      .field("stock", "10");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Token não fornecido",
    });
  });

  it("bloqueia rota admin para usuário comum", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${userToken}`)
      .field("name", "Vela")
      .field("description", "Vela aromática")
      .field("price", "20")
      .field("stock", "10");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: "Acesso negado",
    });
  });

  it("valida payload do carrinho pela rota", async () => {
    const response = await request(app)
      .post("/api/v1/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId: 1,
        quantity: 1000,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        error: "Dados inválidos",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "quantity",
            message: "Quantidade máxima excedida",
          }),
        ]),
      })
    );
  });

  it("rejeita upload de produto com tipo de arquivo inválido", async () => {
    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Vela")
      .field("description", "Vela aromática")
      .field("price", "20")
      .field("stock", "10")
      .attach("image", Buffer.from("arquivo texto"), {
        filename: "produto.txt",
        contentType: "text/plain",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Formato de arquivo inválido. Use JPG, PNG ou WEBP.",
    });
  });

  it("cria produto com upload de imagem válido", async () => {
    const createProductSpy = jest
      .spyOn(ProductService.prototype, "createProduct")
      .mockResolvedValue({
        id: 1,
        name: "Vela",
      } as any);

    const response = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Vela")
      .field("description", "Vela aromática")
      .field("price", "20")
      .field("stock", "10")
      .attach("image", Buffer.from("fake png"), {
        filename: "produto.png",
        contentType: "image/png",
      });

    expect(response.status).toBe(201);
    expect(createProductSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Vela",
        image_url: expect.stringMatching(/^\/uploads\/.+\.png$/),
      })
    );

    expect(createProductSpy.mock.calls[0]?.[0].image_url).toBeDefined();
  });
});
