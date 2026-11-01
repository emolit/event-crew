import nodemailer from "nodemailer";
import type { ContactPayload } from "@/lib/contact-schema";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  recipient: string;
}

interface TransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
}

interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

type TransportFactory = (options: TransportOptions) => {
  sendMail(message: EmailMessage): Promise<unknown>;
};

const defaultTransportFactory: TransportFactory = (options) =>
  nodemailer.createTransport(options);

export function formatApplicationEmail(
  payload: ContactPayload,
): Pick<EmailMessage, "subject" | "text" | "html"> {
  const fields = [
    ["Имя", payload.name],
    ["Телефон", payload.phone],
    ["Telegram", payload.telegram],
    ["Дата мероприятия", payload.eventDate],
    ["Тип персонала", payload.staffType],
    ["Количество", payload.quantity],
    ["Комментарий", payload.comment],
  ] as const;
  const safeName = payload.name.replace(/[\r\n]+/g, " ").trim();
  const text = ["Новая заявка с сайта EVENT CREW", "", ...fields.map(([label, value]) => `${label}: ${display(value)}`)].join("\n");
  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><th style="padding:10px 14px;text-align:left;vertical-align:top;color:#777">${escapeHtml(label)}</th><td style="padding:10px 14px;color:#111">${escapeHtml(display(value))}</td></tr>`,
    )
    .join("");

  return {
    subject: `Новая заявка EVENT CREW — ${safeName}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto"><div style="background:#111;color:#fff;padding:24px 28px"><p style="margin:0;color:#ffc400;font-weight:700;letter-spacing:.12em">EVENT CREW</p><h1 style="margin:8px 0 0;font-size:26px">Новая заявка с сайта</h1></div><table style="width:100%;border-collapse:collapse;background:#f7f7f4">${rows}</table></div>`,
  };
}

export async function sendApplicationEmail(
  payload: ContactPayload,
  config: EmailConfig,
  createTransport: TransportFactory = defaultTransportFactory,
): Promise<void> {
  const transport = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  });
  const message = formatApplicationEmail(payload);

  try {
    await transport.sendMail({
      from: `"EVENT CREW" <${config.user}>`,
      to: config.recipient,
      ...message,
    });
  } catch {
    throw new Error("EMAIL_DELIVERY_FAILED");
  }
}

function display(value: string | number | undefined): string {
  return value === undefined || String(value).trim() === "" ? "—" : String(value);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
