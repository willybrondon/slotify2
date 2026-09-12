/**
 * Salon emails for Afro ServiceDemand events (SendGrid).
 * Fire-and-forget — never block the public API on mail failure.
 */
const sgMail = require("@sendgrid/mail");
const Salon = require("../models/salon.model");
const Service = require("../models/service.model");

function escapeHtml(s) {
  if (s == null || s === undefined || s === "") return "—";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function emailFrom() {
  return process.env.EMAIL || "noreply@skedisy.com";
}

function getBaseUrl() {
  return (process.env.baseURL || process.env.WEBSITE_URL || "https://skedisy.com").replace(
    /\/+$/,
    ""
  );
}

function buildLayout({ title, intro, rows }) {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:40%;">${escapeHtml(
          label
        )}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;"><strong>${value}</strong></td></tr>`
    )
    .join("");
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.5;color:#222;background:#f4f4f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:24px auto;padding:24px;background:#fff;border-radius:8px;">
    <h2 style="margin-top:0;">${escapeHtml(title)}</h2>
    <p>${intro}</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">${rowsHtml}</table>
    <p style="margin:16px 0;"><a href="${escapeHtml(
      getBaseUrl() + "/salonpanel/demandTable"
    )}" style="display:inline-block;padding:10px 16px;background:#c45c26;color:#fff;text-decoration:none;border-radius:8px;">Ouvrir les demandes</a></p>
    <p style="font-size:12px;color:#888;">Skedisy — devis Afro</p>
  </div>
</body></html>`;
}

async function resolveServiceName(serviceId) {
  if (!serviceId) return "—";
  const svc = await Service.findById(serviceId).select("name").lean();
  return svc?.name || "—";
}

async function sendSalonDemandEmail(demand, { event }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[Demand Email] SENDGRID_API_KEY not set; skip");
    return;
  }
  if (!demand?.salonId) return;

  const salon = await Salon.findById(demand.salonId).select("name email").lean();
  const to = salon?.email?.trim();
  if (!isValidEmail(to)) {
    console.warn(`[Demand Email] No salon email for demand ${demand._id}`);
    return;
  }

  const serviceName = await resolveServiceName(demand.serviceId);
  const currency = global.settingJSON?.currencySymbol || "€";
  const needsReview = demand.status === "needs_salon_review";

  let title;
  let intro;
  let subject;
  if (event === "deposit_paid") {
    title = "Acompte reçu";
    intro = `Un acompte a été payé pour une demande devis chez <strong>${escapeHtml(
      salon.name
    )}</strong>.`;
    subject = `[Skedisy] Acompte reçu — ${serviceName}`;
  } else if (needsReview) {
    title = "Devis à valider";
    intro = `Une cliente a envoyé un devis qui nécessite votre validation.`;
    subject = `[Skedisy] Devis à valider — ${serviceName}`;
  } else {
    title = "Nouvelle demande devis";
    intro = `Une nouvelle demande devis a été créée pour <strong>${escapeHtml(
      salon.name
    )}</strong>.`;
    subject = `[Skedisy] Nouvelle demande — ${serviceName}`;
  }

  const answers =
    demand.answers && typeof demand.answers === "object"
      ? Object.entries(demand.answers)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" · ")
      : "—";

  const html = buildLayout({
    title,
    intro,
    rows: [
      ["Prestation", escapeHtml(serviceName)],
      ["Statut", escapeHtml(demand.status)],
      ["Prix estimé", escapeHtml(`${currency}${Number(demand.estimatedPrice || 0).toFixed(2)}`)],
      ["Durée", escapeHtml(`${demand.estimatedDurationMinutes || "—"} min`)],
      ["Acompte", escapeHtml(`${currency}${Number(demand.depositAmount || 0).toFixed(2)} (${demand.depositStatus || "—"})`)],
      ["Reste dû", escapeHtml(`${currency}${Number(demand.balanceDue || 0).toFixed(2)}`)],
      ["Réponses", escapeHtml(answers)],
      ["Canal", escapeHtml(demand.channelHint || demand.source || "web")],
    ],
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: emailFrom(),
    subject,
    html,
  });
  console.log(`[Demand Email] ${event} → ${to} demand=${demand._id}`);
}

function notifySalonDemandCreated(demand) {
  Promise.resolve(sendSalonDemandEmail(demand, { event: "created" })).catch((err) =>
    console.error("[Demand Email] created failed", err.message)
  );
}

function notifySalonDepositPaid(demand) {
  Promise.resolve(sendSalonDemandEmail(demand, { event: "deposit_paid" })).catch((err) =>
    console.error("[Demand Email] deposit_paid failed", err.message)
  );
}

module.exports = {
  notifySalonDemandCreated,
  notifySalonDepositPaid,
  sendSalonDemandEmail,
};
