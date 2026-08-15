const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;

const requests = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(request: Request) {
  const now = Date.now();
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientId = forwardedFor || request.headers.get("x-real-ip") || "local";
  const current = requests.get(clientId);

  if (!current || current.resetAt <= now) {
    requests.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
