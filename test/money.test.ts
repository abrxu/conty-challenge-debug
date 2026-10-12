import { describe, expect, it } from "vitest";
import { reaisFromCents } from "../src/money.ts";

describe("conversão de centavos em reais", () => {
  it("converte 15000 centavos em R$ 150,00", () => {
    expect(reaisFromCents(15000)).toBe(150);
  });

  it("converte 8000 centavos em R$ 80,00", () => {
    expect(reaisFromCents(8000)).toBe(80);
  });

  it("preserva os centavos", () => {
    expect(reaisFromCents(1999)).toBe(19.99);
  });
});
