import { jest } from "@jest/globals";
import DashboardService from "../../services/dashboardService.js";
import { ValidationError } from "../../errors/customErrors.js";
import { connection } from "../../config/database.js";

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
    jest.clearAllMocks();
  });

  it("lança ValidationError se não houver estatísticas", async () => {
    jest.spyOn(connection, "query").mockResolvedValue([[]] as any);
    await expect(service.getStats()).rejects.toThrow(ValidationError);
  });

  it("lança ValidationError se não houver produtos vendidos", async () => {
    jest.spyOn(connection, "query").mockResolvedValue([[]] as any);
    await expect(service.topProducts()).rejects.toThrow(ValidationError);
  });
});
