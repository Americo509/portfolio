import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

// --------- validação ---------
const schema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  email: z.string().email("Email inválido."),
  message: z.string().min(10, "Mensagem muito curta."),
  // honeypot (campo invisível)
  company: z.string().optional().default(""),
  // tempo (ms) desde que o form abriu (bot preenche rápido demais)
  startedAt: z.number().int().optional(),
});

// --------- rate limit simples (em memória) ---------
// Observação: em serverless pode resetar entre execuções.
// Para produção 100% robusta, use Upstash Redis (free tier).
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 min
const MAX_PER_WINDOW = 5; // 5 req/min por IP

function getIP(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return "unknown";
}

function allow(ip: string) {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || entry.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

// --------- template HTML bonito ---------
function emailHtml(data: { name: string; email: string; message: string }) {
  const safeMessage = data.message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br/>");

  return `
  <div style="background:#0b0c10;padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <div style="max-width:640px;margin:0 auto;background:#111217;border:1px solid rgba(255,255,255,.08);border-radius:18px;overflow:hidden;">
      <div style="padding:22px 22px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,0));">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);">
          Novo contato • Portfólio
        </div>
        <div style="margin-top:10px;font-size:20px;line-height:1.2;color:#fff;font-weight:650;">
          ${data.name}
        </div>
        <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,.72);">
          Reply-to: <span style="color:#fff">${data.email}</span>
        </div>
      </div>

      <div style="padding:18px 22px 22px;">
        <div style="font-size:12px;color:rgba(255,255,255,.55);margin-bottom:10px;">
          Mensagem
        </div>
        <div style="font-size:14px;line-height:1.7;color:rgba(255,255,255,.88);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:14px 14px;border-radius:14px;">
          ${safeMessage}
        </div>

        <div style="margin-top:16px;font-size:12px;color:rgba(255,255,255,.55);">
          Enviado via formulário do portfólio.
        </div>
      </div>

      <div style="padding:14px 22px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:10px;justify-content:space-between;align-items:center;">
        <div style="font-size:12px;color:rgba(255,255,255,.55);">Gustavo Américo Rosa</div>
        <div style="font-size:12px;color:rgba(255,255,255,.55);">${new Date().toLocaleString("pt-BR")}</div>
      </div>
    </div>
  </div>
  `.trim();
}

export async function POST(req: Request) {
  try {
    const ip = getIP(req);
    if (!allow(ip)) {
      return NextResponse.json(
        { ok: false, error: "Muitas tentativas. Tente novamente em instantes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);

    // 1) Honeypot: se bot preencher, finge sucesso
    if (data.company && data.company.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    // 2) Bot speed check: se enviou rápido demais (< 2.5s), suspeito.
    if (typeof data.startedAt === "number") {
      const elapsed = Date.now() - data.startedAt;
      if (elapsed < 2500) {
        return NextResponse.json({ ok: true });
      }
    }

    const to = process.env.CONTACT_TO ?? "americorosagustavo@gmail.com";
    const from = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Novo contato — ${data.name}`,
      html: emailHtml({ name: data.name, email: data.email, message: data.message }),
      text: `Nome: ${data.name}\nEmail: ${data.email}\n\nMensagem:\n${data.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Erro ao enviar." },
      { status: 400 }
    );
  }
}