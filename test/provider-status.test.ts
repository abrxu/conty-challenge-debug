import { describe, expect, it } from "vitest";
import { mapProviderStatus } from "../src/provider-status.ts";

describe("status do provedor", () => {
  it("mantém PENDING como pendente", () => {
    expect(mapProviderStatus("PENDING")).toBe("pending");
  });

  it("quita com RECEIVED e CONFIRMED", () => {
    expect(mapProviderStatus("RECEIVED")).toBe("paid");
    expect(mapProviderStatus("CONFIRMED")).toBe("paid");
  });

  it("marca falha com FAILED", () => {
    expect(mapProviderStatus("FAILED")).toBe("failed");
  });

  it("rejeita status desconhecido", () => {
    expect(mapProviderStatus("REFUNDED")).toBe("unknown");
  });
});
