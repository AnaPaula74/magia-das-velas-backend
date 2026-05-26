import "../setup.js";
import { jest } from "@jest/globals";

import AuditService from "../../services/auditService.js";
import { connection } from "../../config/database.js";

describe("AuditService", () => {
  let service: AuditService;

  beforeEach(() => {
    service = new AuditService();

    jest.clearAllMocks();
  });

  it("registra log com sucesso", async () => {
    jest
      .spyOn(connection, "query")
      .mockResolvedValue([{ insertId: 1 }] as any);

    await service.log(
      1,
      "TEST_ACTION",
      "Detalhes do teste"
    );

    expect(connection.query).toHaveBeenCalledWith(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
      [1, "TEST_ACTION", "Detalhes do teste"]
    );
  });
});