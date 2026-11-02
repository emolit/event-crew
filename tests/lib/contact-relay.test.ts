import { describe, expect, test, vi } from "vitest";
import { sendApplicationRelay } from "@/lib/contact-relay";
import type { ContactPayload } from "@/lib/contact-schema";

const payload: ContactPayload = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-11-10",
  eventEndDate: "",
  staffTypes: ["Хелперы", "Официанты"],
  quantity: 2,
  comment: "Тестовая заявка",
  website: "",
};

describe("contact relay client", () => {
  test("posts the normalized payload with a bearer secret and abort signal", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await sendApplicationRelay(
      payload,
      {
        url: "https://example.netlify.app/api/contact/relay",
        secret: "relay-secret",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.netlify.app/api/contact/relay");
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        authorization: "Bearer relay-secret",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  test.each([
    ["a non-success HTTP status", new Response("Bad Gateway", { status: 502 })],
    [
      "an API-level failure",
      new Response(JSON.stringify({ ok: false, error: "DELIVERY_ERROR" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ],
    ["malformed JSON", new Response("not-json", { status: 200 })],
  ])("normalizes %s", async (_label, response) => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);

    await expect(
      sendApplicationRelay(
        payload,
        { url: "https://relay.example/api/contact/relay", secret: "relay-secret" },
        fetchMock,
      ),
    ).rejects.toThrow(/^RELAY_DELIVERY_FAILED$/);
  });

  test("normalizes network errors without exposing their message", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(
      new Error("request failed with relay-secret"),
    );

    await expect(
      sendApplicationRelay(
        payload,
        { url: "https://relay.example/api/contact/relay", secret: "relay-secret" },
        fetchMock,
      ),
    ).rejects.toThrow(/^RELAY_DELIVERY_FAILED$/);
  });

  test("aborts a request that exceeds the configured timeout", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
    );

    await expect(
      sendApplicationRelay(
        payload,
        {
          url: "https://relay.example/api/contact/relay",
          secret: "relay-secret",
          timeoutMs: 5,
        },
        fetchMock,
      ),
    ).rejects.toThrow(/^RELAY_DELIVERY_FAILED$/);
  });
});
