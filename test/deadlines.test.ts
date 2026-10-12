import { describe, expect, it } from "vitest";
import { approvedCivilDay, isPastDeadline } from "../src/deadlines.ts";

describe("dia civil da aprovação", () => {
  it("usa o dia de São Paulo, não o de UTC", () => {
    expect(approvedCivilDay("2026-03-13T01:02:00.000Z")).toBe("2026-03-12");
  });

  it("vira o dia à meia-noite de São Paulo", () => {
    expect(approvedCivilDay("2026-03-13T02:59:59.999Z")).toBe("2026-03-12");
    expect(approvedCivilDay("2026-03-13T03:00:00.000Z")).toBe("2026-03-13");
  });
});

describe("prazo da campanha", () => {
  it("aceita o último instante do dia do prazo", () => {
    expect(isPastDeadline("2026-03-13T02:59:59.999Z", "2026-03-12")).toBe(false);
  });

  it("expira no primeiro instante do dia seguinte", () => {
    expect(isPastDeadline("2026-03-13T03:00:00.000Z", "2026-03-12")).toBe(true);
  });

  it("aceita aprovação antes do prazo", () => {
    expect(isPastDeadline("2026-03-01T12:00:00.000Z", "2026-03-12")).toBe(false);
  });
});
