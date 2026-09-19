/**
 * P2 — Messagerie métier: classify topic + auto-reply from service detailCard only.
 * No generative invention — answers come from salon-configured fields.
 */

const Salon = require("../models/salon.model");
const Service = require("../models/service.model");

const TOPIC_RULES = [
  {
    topic: "complaint",
    patterns: [
      /\breclam/i,
      /\bplainte/i,
      /\binsatisf/i,
      /\bmécontent|\bmecontent/i,
      /\bscandale/i,
      /\bhonte/i,
      /\bcomplaint/i,
      /\bunacceptable/i,
    ],
  },
  {
    topic: "payment",
    patterns: [
      /\bpaiement/i,
      /\bpayment/i,
      /\bacompte/i,
      /\bdeposit/i,
      /\bstripe/i,
      /\bcb\b|\bcarte/i,
      /\brembours/i,
      /\brefund/i,
      /\bsolde\b/i,
    ],
  },
  {
    topic: "cancel",
    patterns: [
      /\bannul/i,
      /\bcancel/i,
      /\breport/i,
      /\breporté|\breporter/i,
      /\bno[\s-]?show/i,
      /\bpolitique/i,
    ],
  },
  {
    topic: "prep",
    patterns: [
      /\bprep/i,
      /\bprépar|\bprepar/i,
      /\bavant\s+(le\s+)?rdv/i,
      /\bchecklist/i,
      /\bm[eè]ches?\b/i,
      /\blaver\b|\blavage\b/i,
      /\bapporter\b/i,
      /\b[eé]viter\b/i,
    ],
  },
  {
    topic: "price",
    patterns: [
      /\bprix\b/i,
      /\btarif/i,
      /\bcout\b|\bco[uû]t\b/i,
      /\bcombien/i,
      /\bhow\s+much/i,
      /\bprice\b/i,
      /\bdur[eé]e\b/i,
      /\bcombien\s+de\s+temps/i,
      /\binclus\b|\binclude/i,
      /\badd[\s-]?on/i,
      /\boption/i,
    ],
  },
  {
    topic: "booking",
    patterns: [
      /\br[eé]serv/i,
      /\bbook(ing)?\b/i,
      /\bcr[eé]neau/i,
      /\bdisponib/i,
      /\bavailable/i,
      /\bhoraire/i,
      /\brdv\b|\brendez[\s-]?vous/i,
    ],
  },
  {
    topic: "technical",
    patterns: [
      /\bcheveux\b/i,
      /\bhair\b/i,
      /\btexture/i,
      /\blongueur/i,
      /\bfinesse/i,
      /\bknotless/i,
      /\bbox\s*braid/i,
      /\bnattes?\b/i,
      /\btresses?\b/i,
      /\blocks?\b|\bdread/i,
      /\bwig\b|\bperruque/i,
      /\bpossible\b.*\bavec\b/i,
      /\bavec\s+mes\s+cheveux/i,
      /\bcuir\s+chevelu/i,
      /\bsensible/i,
      /\btechnique/i,
    ],
  },
];

const AUTO_REPLY_TOPICS = new Set(["prep", "price", "cancel", "booking"]);
const AUTO_REPLY_COOLDOWN_MS = 10 * 60 * 1000;

function normalizeTopic(topic) {
  const t = String(topic || "").trim().toLowerCase();
  const allowed = new Set([
    "price",
    "booking",
    "cancel",
    "technical",
    "prep",
    "payment",
    "complaint",
    "other",
  ]);
  return allowed.has(t) ? t : "";
}

/**
 * Rule-based classifier. Client-picked topic wins if valid.
 */
function classifyMessageTopic(text, hintTopic) {
  const hinted = normalizeTopic(hintTopic);
  if (hinted && hinted !== "other") {
    return { topic: hinted, source: "client", confidence: 1 };
  }
  const body = String(text || "");
  if (!body.trim()) {
    return { topic: "other", source: "auto", confidence: 0 };
  }
  for (const rule of TOPIC_RULES) {
    for (const re of rule.patterns) {
      if (re.test(body)) {
        return { topic: rule.topic, source: "auto", confidence: 0.8 };
      }
    }
  }
  return { topic: "other", source: "auto", confidence: 0.2 };
}

function getSalonServiceEntry(salon, serviceId) {
  if (!salon || !serviceId) return null;
  const sid = String(serviceId);
  return (salon.serviceIds || []).find(
    (s) => String(s.id?._id || s.id) === sid
  ) || null;
}

function listLines(items, bullet = "•") {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((x) => `${bullet} ${x}`)
    .join("\n");
}

/**
 * Build grounded FAQ reply from detailCard + policy. Returns null if nothing configured.
 */
async function buildGroundedAutoReply({
  salonId,
  serviceId,
  topic,
  lang = "fr",
}) {
  const t = normalizeTopic(topic);
  if (!AUTO_REPLY_TOPICS.has(t)) return null;

  const salon = await Salon.findById(salonId)
    .select("name serviceIds cancellationPolicy")
    .populate("serviceIds.id", "name duration")
    .lean();
  if (!salon) return null;

  const entry = getSalonServiceEntry(salon, serviceId);
  const card = entry?.detailCard || {};
  const svcName =
    (entry?.id && typeof entry.id === "object" && entry.id.name) ||
    "";
  let duration =
    entry?.id && typeof entry.id === "object" && entry.id.duration != null
      ? Number(entry.id.duration)
      : null;
  const price = entry?.price != null ? Number(entry.price) : null;

  if (!svcName && serviceId) {
    const svc = await Service.findById(serviceId).select("name duration").lean();
    if (svc) {
      duration = duration != null ? duration : svc.duration;
    }
  }

  const fr = lang !== "en";
  const lines = [];
  const header = fr
    ? `Réponse automatique Skedisy${svcName ? ` — ${svcName}` : ""} :`
    : `Skedisy auto-reply${svcName ? ` — ${svcName}` : ""}:`;

  if (t === "prep") {
    const must = Array.isArray(card.prepMust) ? card.prepMust : [];
    const avoid = Array.isArray(card.prepAvoid) ? card.prepAvoid : [];
    if (!must.length && !avoid.length) return null;
    lines.push(header);
    if (must.length) {
      lines.push(fr ? "À faire :" : "Do:");
      lines.push(listLines(must, "✓"));
    }
    if (avoid.length) {
      lines.push(fr ? "À éviter :" : "Avoid:");
      lines.push(listLines(avoid, "✕"));
    }
  } else if (t === "price") {
    if (price == null && !card.shortDescription && !(card.includes || []).length) {
      return null;
    }
    lines.push(header);
    if (price != null) {
      lines.push(fr ? `Prix catalogue : ${price}` : `Catalogue price: ${price}`);
    }
    if (duration != null && duration > 0) {
      lines.push(fr ? `Durée indicative : ${duration} min` : `Approx. duration: ${duration} min`);
    }
    const dep = card.depositPercent != null ? Number(card.depositPercent) : null;
    if (dep > 0) {
      lines.push(
        fr
          ? `Acompte demandé : ${dep}%`
          : `Deposit required: ${dep}%`
      );
    }
    if (card.shortDescription) {
      lines.push(String(card.shortDescription).slice(0, 280));
    }
    const includes = Array.isArray(card.includes) ? card.includes : [];
    if (includes.length) {
      lines.push(fr ? "Inclus :" : "Included:");
      lines.push(listLines(includes));
    }
    const addons = Array.isArray(card.addons) ? card.addons : [];
    if (addons.length) {
      lines.push(fr ? "Options :" : "Add-ons:");
      lines.push(
        listLines(
          addons.map((a) => {
            const p = Number(a.addPrice) || 0;
            const m = Number(a.addMinutes) || 0;
            const bits = [a.label || a.id];
            if (p) bits.push(`+${p}`);
            if (m) bits.push(`+${m} min`);
            return bits.join(" ");
          })
        )
      );
    }
  } else if (t === "cancel") {
    const pol = salon.cancellationPolicy || {};
    if (!pol.enabled) return null;
    lines.push(header);
    lines.push(
      fr
        ? `Annulation libre jusqu’à ${pol.freeCancelHours ?? 24} h avant le RDV.`
        : `Free cancellation until ${pol.freeCancelHours ?? 24}h before the appointment.`
    );
    lines.push(
      fr
        ? `Au-delà : rétention d’environ ${pol.lateCancelPercent ?? 50}% de l’acompte.`
        : `After that: about ${pol.lateCancelPercent ?? 50}% of the deposit may be retained.`
    );
    if (pol.noShowPercent != null) {
      lines.push(
        fr
          ? `No-show : jusqu’à ${pol.noShowPercent}% de l’acompte.`
          : `No-show: up to ${pol.noShowPercent}% of the deposit.`
      );
    }
  } else if (t === "booking") {
    lines.push(header);
    if (card.shortDescription) {
      lines.push(String(card.shortDescription).slice(0, 280));
    } else if (svcName) {
      lines.push(
        fr
          ? `Vous pouvez réserver « ${svcName} » directement depuis la fiche salon.`
          : `You can book “${svcName}” from the salon page.`
      );
    } else {
      lines.push(
        fr
          ? "Vous pouvez choisir un créneau depuis le bouton Réserver sur la fiche salon."
          : "You can pick a slot via Book on the salon page."
      );
    }
    if (duration != null && duration > 0) {
      lines.push(fr ? `Durée indicative : ${duration} min` : `Approx. duration: ${duration} min`);
    }
    lines.push(
      fr
        ? "Utilisez « Réserver cette prestation » dans cette conversation pour continuer."
        : "Use “Book this service” in this chat to continue."
    );
  }

  const body = lines.filter(Boolean).join("\n").trim();
  if (!body || body === header) return null;

  const footer = fr
    ? "\n\n— Infos issues de la fiche prestation du salon. Un humain peut compléter si besoin."
    : "\n\n— From the salon’s service card. A human can add details if needed.";

  return {
    body: (body + footer).slice(0, 1200),
    topic: t,
  };
}

function canSendAutoReply(conversation, topic) {
  if (!conversation) return false;
  const t = normalizeTopic(topic);
  if (!AUTO_REPLY_TOPICS.has(t)) return false;
  const last = conversation.lastAutoReplyAt
    ? new Date(conversation.lastAutoReplyAt).getTime()
    : 0;
  if (last && Date.now() - last < AUTO_REPLY_COOLDOWN_MS) return false;
  return true;
}

/**
 * Routing intent from topic.
 * @returns {{ keepSalon: boolean, autoAssignExpert: boolean, tryAutoReply: boolean }}
 */
function routingForTopic(topic) {
  const t = normalizeTopic(topic) || "other";
  switch (t) {
    case "technical":
      return { keepSalon: true, autoAssignExpert: true, tryAutoReply: false };
    case "prep":
    case "price":
    case "booking":
    case "cancel":
      return { keepSalon: true, autoAssignExpert: false, tryAutoReply: true };
    case "payment":
    case "complaint":
      return { keepSalon: true, autoAssignExpert: false, tryAutoReply: false };
    default:
      return { keepSalon: true, autoAssignExpert: false, tryAutoReply: false };
  }
}

module.exports = {
  classifyMessageTopic,
  buildGroundedAutoReply,
  canSendAutoReply,
  routingForTopic,
  normalizeTopic,
  AUTO_REPLY_TOPICS,
  TOPIC_RULES,
};
