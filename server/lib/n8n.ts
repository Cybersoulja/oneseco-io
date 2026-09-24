const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * Sends an event to your n8n workflow. Safe to call even if n8n is
 * unreachable (e.g. N8N_WEBHOOK_URL points at a local-only host) —
 * failures are logged, never thrown, so they can't break the app.
 */
export async function sendToN8n(event: string, data: Record<string, unknown>) {
  if (!N8N_WEBHOOK_URL) {
    console.warn("N8N_WEBHOOK_URL is not set — skipping n8n webhook call");
    return;
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      console.error(`n8n webhook call failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("n8n webhook call errored:", error);
  }
}
