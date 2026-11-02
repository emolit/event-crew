import type { ContactPayload } from "@/lib/contact-schema";

const DEFAULT_TIMEOUT_MS = 8_000;

export interface RelayConfig {
  url: string;
  secret: string;
  timeoutMs?: number;
}

export async function sendApplicationRelay(
  payload: ContactPayload,
  config: RelayConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  let relayUrl: URL;
  try {
    relayUrl = new URL(config.url);
    if (relayUrl.protocol !== "https:") {
      throw new Error("INSECURE_RELAY_URL");
    }
  } catch {
    throw new Error("RELAY_DELIVERY_FAILED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetchImpl(relayUrl.toString(), {
      method: "POST",
      redirect: "error",
      headers: {
        authorization: `Bearer ${config.secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("RELAY_DELIVERY_FAILED");
    }

    const result = await response.json() as { ok?: unknown };
    if (result.ok !== true) {
      throw new Error("RELAY_DELIVERY_FAILED");
    }
  } catch {
    throw new Error("RELAY_DELIVERY_FAILED");
  } finally {
    clearTimeout(timeout);
  }
}
