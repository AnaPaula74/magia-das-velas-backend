import { addCartSchema } from "../../validators/cartValidator.js";

describe("cartValidator", () => {
  it("falha se productId não for número", () => {
    expect(() => addCartSchema.parse({ productId: "abc", quantity: 2 })).toThrow();
  });

  it("falha se quantity <= 0", () => {
    expect(() => addCartSchema.parse({ productId: 1, quantity: 0 })).toThrow();
  });

  it("passa com dados válidos", () => {
    expect(addCartSchema.parse({ productId: 1, quantity: 2 })).toEqual({
      productId: 1,
      quantity: 2,
    });
  });
});
