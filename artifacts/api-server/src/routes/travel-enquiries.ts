import { ReplitConnectors } from "@replit/connectors-sdk";
import { Router, type IRouter, type Request } from "express";

const router: IRouter = Router();
const destinationInbox = "bluejetholidaypune@gmail.com";
const categories = new Set([
  "General enquiry",
  "International holiday",
  "Domestic holiday",
  "Customized tour",
  "Group tour (16+ travellers)",
  "Private tour (up to 11 travellers)",
  "International student study tour",
  "Domestic student study tour",
  "Spiritual journey",
  "Rail booking assistance",
  "Visa assistance",
  "Passport assistance",
]);
const rateWindowMs = 15 * 60 * 1000;
const rateLimit = 6;
const rateEntries = new Map<string, { count: number; expiresAt: number }>();

function allowedSameOrigin(request: Request): boolean {
  const origin = request.get("origin");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  const forwardedHost = request.get("x-forwarded-host")?.split(",")[0]?.trim();
  const configuredHosts = [
    request.get("host"),
    forwardedHost,
    process.env["REPLIT_DEV_DOMAIN"],
    ...(process.env["REPLIT_DOMAINS"] ?? "").split(","),
  ]
    .map((host) => host?.trim().toLowerCase())
    .filter((host): host is string => Boolean(host));

  return configuredHosts.includes(originHost);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  for (const [key, entry] of rateEntries) {
    if (entry.expiresAt <= now) rateEntries.delete(key);
  }
  if (rateEntries.size > 5000) rateEntries.clear();

  const entry = rateEntries.get(ip);
  if (!entry || entry.expiresAt <= now) {
    rateEntries.set(ip, { count: 1, expiresAt: now + rateWindowMs });
    return true;
  }
  if (entry.count >= rateLimit) return false;
  entry.count += 1;
  return true;
}

function textField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length > maxLength) return null;
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
}

function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

router.post("/travel-enquiries", async (request, response) => {
  if (!allowedSameOrigin(request)) {
    response.status(403).json({ error: "This form can only be submitted from the Blue Jet Holidays website." });
    return;
  }

  const ip = request.ip ?? request.socket.remoteAddress ?? "unknown";
  if (!checkRateLimit(ip)) {
    response.status(429).json({ error: "Too many enquiries were sent from this connection. Please try again later or call the team." });
    return;
  }

  const data: unknown = request.body;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    response.status(400).json({ error: "Please check the enquiry details and try again." });
    return;
  }
  const body = data as Record<string, unknown>;

  // Bots that fill the invisible field receive a generic success, but no email is sent.
  const honeypot = textField(body["website"], 200);
  if (honeypot === null) {
    response.status(400).json({ error: "Please check the enquiry details and try again." });
    return;
  }
  if (honeypot) {
    response.status(202).json({ ok: true });
    return;
  }

  const kind = textField(body["kind"], 80);
  const name = textField(body["name"], 100);
  const phone = textField(body["phone"], 40);
  const email = textField(body["email"], 254);
  const destination = textField(body["destination"], 120);
  const departure = textField(body["departure"], 100);
  const when = textField(body["when"], 7);
  const travellers = textField(body["travellers"], 4);
  const institution = textField(body["institution"], 120);
  const details = textField(body["details"], 2000);

  if (
    !kind ||
    !categories.has(kind) ||
    !name ||
    !phone ||
    !/^[+()\d.\s-]{7,40}$/.test(phone) ||
    email === null ||
    (email.length > 0 && !isEmail(email)) ||
    destination === null ||
    departure === null ||
    when === null ||
    (when !== "" && !/^\d{4}-(0[1-9]|1[0-2])$/.test(when)) ||
    travellers === null ||
    (travellers !== "" && (!/^\d{1,3}$/.test(travellers) || Number(travellers) < 1 || Number(travellers) > 500)) ||
    institution === null ||
    details === null ||
    body["consent"] !== true
  ) {
    response.status(400).json({ error: "Please check the required fields and try again." });
    return;
  }

  const message = [
    "New Blue Jet Holidays website enquiry",
    "",
    `Enquiry type: ${kind}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Destination or route: ${destination || "Not provided"}`,
    `Leaving from: ${departure || "Not provided"}`,
    `Travel month: ${when || "Not decided"}`,
    `Travellers: ${travellers || "Not provided"}`,
    `School, college, or organisation: ${institution || "Not provided"}`,
    "",
    "Additional details:",
    details || "None provided",
    "",
    "Submitted through the Blue Jet Holidays website.",
  ].join("\n");
  const subject = `New website enquiry — ${kind}`;
  const mimeMessage = [
    `From: Blue Jet Holidays <${destinationInbox}>`,
    `To: ${destinationInbox}`,
    `Subject: ${subject}`,
    ...(email ? [`Reply-To: ${email}`] : []),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(message, "utf8").toString("base64"),
  ].join("\r\n");

  try {
    const connectors = new ReplitConnectors();
    const profileResponse = await connectors.proxy("google-mail", "/gmail/v1/users/me/profile", {
      method: "GET",
    });
    if (!profileResponse.ok) {
      throw new Error("Mail connection unavailable");
    }
    const profile = (await profileResponse.json()) as { emailAddress?: string };
    if (profile.emailAddress?.toLowerCase() !== destinationInbox) {
      throw new Error("Mail account does not match the business inbox");
    }

    const sendResponse = await connectors.proxy("google-mail", "/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: Buffer.from(mimeMessage, "utf8").toString("base64url") }),
    });
    if (!sendResponse.ok) {
      throw new Error("Mail provider did not accept the message");
    }

    response.status(202).json({ ok: true });
  } catch {
    request.log.error("Travel enquiry email could not be sent");
    response.status(503).json({
      error: "Email delivery is not connected yet. Please call the Blue Jet Holidays team or email them directly.",
    });
  }
});

export default router;
