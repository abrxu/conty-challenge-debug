import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";
import { openDatabase } from "../src/db.ts";
import { normalizeKey } from "../src/idempotency.ts";
import { seedIncident } from "../src/seed.ts";

describe("chave de idempotência", () => {
  it("ignora espaços nas pontas", () => {
    expect(normalizeKey("pay_22a ")).toBe(normalizeKey("pay_22a"));
    expect(normalizeKey("  pay_22a")).toBe(normalizeKey("pay_22a"));
  });

  it("ignora caracteres invisíveis nas pontas", () => {
    expect(normalizeKey("pay_7c1\u200B")).toBe(normalizeKey("pay_7c1"));
    expect(normalizeKey("\uFEFFpay_7c1")).toBe(normalizeKey("pay_7c1"));
  });

  it("mantém chaves diferentes distintas", () => {
    expect(normalizeKey("pay_7c1")).not.toBe(normalizeKey("pay_7c2"));
  });
});

describe("retry com caractere invisível na chave", () => {
  it("credita R$ 80,00 uma única vez", async () => {
    const db = openDatabase(":memory:");
    seedIncident(db);
    const app = createApp(db);
    const send = (idempotency_key: string) =>
      app.request("/approvals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mission_id: "msn_2044",
          approved_at: "2026-03-12T21:05:00.000Z",
          idempotency_key,
        }),
      });

    expect((await send("pay_7c1")).status).toBe(201);
    expect((await send("pay_7c1\u200B")).status).toBe(200);

    const mission = await app.request("/missions/msn_2044");
    const body = (await mission.json()) as { ledger: Array<{ amount_brl: number }> };
    expect(body.ledger).toHaveLength(1);
    expect(body.ledger[0]?.amount_brl).toBe(80);
  });
});

describe("crédito único por missão", () => {
  const send = (app: ReturnType<typeof createApp>, mission_id: string, idempotency_key: string) =>
    app.request("/approvals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mission_id, approved_at: "2026-03-12T21:05:00.000Z", idempotency_key }),
    });

  it("não credita de novo a mesma missão com outra chave", async () => {
    const db = openDatabase(":memory:");
    seedIncident(db);
    const app = createApp(db);

    expect((await send(app, "msn_2044", "pay_7c1")).status).toBe(201);
    expect((await send(app, "msn_2044", "pay_outra")).status).toBe(200);

    const mission = await app.request("/missions/msn_2044");
    const body = (await mission.json()) as { ledger: unknown[] };
    expect(body.ledger).toHaveLength(1);
  });

  it("recusa a chave já usada em outra missão", async () => {
    const db = openDatabase(":memory:");
    seedIncident(db);
    const app = createApp(db);

    expect((await send(app, "msn_2044", "pay_7c1")).status).toBe(201);
    expect((await send(app, "msn_1900", "pay_7c1")).status).toBe(409);
  });

  it("recusa chave que fica vazia depois de normalizada", async () => {
    const db = openDatabase(":memory:");
    seedIncident(db);
    const app = createApp(db);

    expect((await send(app, "msn_2044", " \u200B ")).status).toBe(400);
  });
});
