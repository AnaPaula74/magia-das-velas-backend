import "../setup.js";

import {
  salesReportQuerySchema,
  topProductsQuerySchema,
} from "../../validators/dashboardValidator.js";

describe("dashboard validators", () => {
  it("normaliza limite de produtos mais vendidos", () => {
    const result = topProductsQuerySchema.parse({
      limit: "5",
    });

    expect(result).toEqual({
      limit: 5,
    });
  });

  it("valida intervalo de datas do relatório de vendas", () => {
    const result = salesReportQuerySchema.parse({
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    });

    expect(result.startDate).toBeInstanceOf(Date);
    expect(result.endDate).toBeInstanceOf(Date);
  });

  it("rejeita relatório com data inicial maior que a final", () => {
    expect(() =>
      salesReportQuerySchema.parse({
        startDate: "2026-02-01",
        endDate: "2026-01-01",
      })
    ).toThrow();
  });
});
