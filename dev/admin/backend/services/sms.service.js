const twilio = require("twilio");

// Initialize Twilio client (only if credentials are available)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

/**
 * Normalize SMS message for GSM-7 encoding to reduce segment count and cost.
 * - Removes emojis (Unicode triggers 67 chars/segment vs 153 for GSM-7)
 * - Replaces accented chars with ASCII equivalents (e.g. e, a, c)
 * - Replaces smart quotes with straight quotes
 * @param {string} message - Raw message
 * @returns {string} - GSM-7 compatible message
 */
function normalizeForGSM7(message) {
  if (!message || typeof message !== "string") return message;
  let normalized = message;

  // Remove emojis and Unicode symbols (triggers UCS-2 = 67 chars/segment vs GSM-7 = 153)
  normalized = normalized.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{203C}\u{2049}\u{2139}\u{274C}\u{274E}\u{2705}\u{2B50}]/gu, "");

  // Replace accented chars and Unicode symbols with ASCII (avoids UCS-2, keeps GSM-7 = 153 chars/segment)
  // Euro (€) and Pound (£) trigger Unicode - replace to stay in GSM-7
  const accentMap = {
    "\u00E0": "a", "\u00E1": "a", "\u00E2": "a", "\u00E3": "a", "\u00E4": "a", "\u00E5": "a",
    "\u00E8": "e", "\u00E9": "e", "\u00EA": "e", "\u00EB": "e",
    "\u00EC": "i", "\u00ED": "i", "\u00EE": "i", "\u00EF": "i",
    "\u00F2": "o", "\u00F3": "o", "\u00F4": "o", "\u00F5": "o", "\u00F6": "o",
    "\u00F9": "u", "\u00FA": "u", "\u00FB": "u", "\u00FC": "u",
    "\u00E7": "c", "\u00F1": "n", "\u00DF": "s",
    "\u00C0": "A", "\u00C1": "A", "\u00C2": "A", "\u00C8": "E", "\u00C9": "E", "\u00CA": "E",
    "\u00CC": "I", "\u00CD": "I", "\u00CE": "I", "\u00D2": "O", "\u00D3": "O", "\u00D4": "O",
    "\u00D9": "U", "\u00DA": "U", "\u00DB": "U", "\u00C7": "C", "\u00D1": "N",
    "\u2018": "'", "\u2019": "'", "\u201C": '"', "\u201D": '"', "\u2013": "-", "\u2014": "-",
    "\u20AC": "EUR ", "\u00A3": "GBP ",  // Euro and Pound trigger UCS-2
  };
  for (const [accent, ascii] of Object.entries(accentMap)) {
    normalized = normalized.split(accent).join(ascii);
  }

  return normalized.trim();
}

/**
 * Send SMS using Twilio
 * @param {string} to - Phone number to send SMS to (E.164 format)
 * @param {string} message - Message body
 * @returns {Promise<Object>} - Twilio message response
 */
async function sendSMS(to, message) {
  try {
    // Validate Twilio credentials
    if (!client || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error("[SMS Service] ERROR: Twilio credentials not configured.");
      console.error("[SMS Service] Current status:");
      console.error("   - Account SID:", process.env.TWILIO_ACCOUNT_SID ? `✓ Set (${process.env.TWILIO_ACCOUNT_SID.substring(0, 10)}...)` : "✗ Missing");
      console.error("   - Auth Token:", process.env.TWILIO_AUTH_TOKEN ? "✓ Set" : "✗ Missing");
      console.error("   - Phone Number:", process.env.TWILIO_PHONE_NUMBER ? `✓ Set (${process.env.TWILIO_PHONE_NUMBER})` : "✗ Missing");
      
      // Check for common .env format issues
      if (process.env.TWILIO_PHONE_NUMBER && process.env.TWILIO_PHONE_NUMBER.endsWith(';')) {
        console.error("[SMS Service] ⚠ WARNING: TWILIO_PHONE_NUMBER ends with semicolon (;). Remove it from .env file!");
      }
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.includes(' =')) {
        console.error("[SMS Service] ⚠ WARNING: Spaces detected in TWILIO_ACCOUNT_SID. Remove spaces around = in .env file!");
      }
      
      console.error("[SMS Service] Please ensure .env file has correct format (no spaces around =, no semicolons):");
      console.error("[SMS Service]   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.error("[SMS Service]   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.error("[SMS Service]   TWILIO_PHONE_NUMBER=+1234567890");
      return { success: false, error: "SMS service not configured" };
    }
    // Validate phone number
    if (!to || to.trim() === "") {
      console.error("Phone number is required");
      return { success: false, error: "Phone number is required" };
    }

    // Format phone number - handle French and Cameroon numbers in different formats
    let formattedPhone = to.trim().replace(/\s+/g, ''); // Remove spaces
    
    // Handle Cameroon phone numbers first (check before French to avoid conflicts)
    // Formats: +237690343431, 237690343431, 690343431
    if (formattedPhone.startsWith("+237")) {
      // Already in correct format: +237690343431
      console.log(`[SMS Service] Cameroon number already formatted: ${formattedPhone}`);
    } else if (formattedPhone.startsWith("237") && formattedPhone.length === 12) {
      // Cameroon international format without + (237690343431) -> add + (+237690343431)
      formattedPhone = `+${formattedPhone}`;
      console.log(`[SMS Service] Added + to Cameroon international format: ${to} -> ${formattedPhone}`);
    } else if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("237") && 
               formattedPhone.length === 9 && 
               (formattedPhone.startsWith("6") || formattedPhone.startsWith("7") || formattedPhone.startsWith("8"))) {
      // Cameroon local format (690343431) -> convert to international (+237690343431)
      formattedPhone = `+237${formattedPhone}`;
      console.log(`[SMS Service] Converted Cameroon local format: ${to} -> ${formattedPhone}`);
    }
    // Handle French phone numbers (+33, 33, or 0 prefix)
    // Formats: +33145834832, 33145834832, 0145834832
    else if (formattedPhone.startsWith("0")) {
      // French national format (0145834832) -> convert to international (+33145834832)
      formattedPhone = `+33${formattedPhone.substring(1)}`;
      console.log(`[SMS Service] Converted French national format: ${to} -> ${formattedPhone}`);
    } else if (formattedPhone.startsWith("33") && !formattedPhone.startsWith("+33")) {
      // French international format without + (33145834832) -> add + (+33145834832)
      formattedPhone = `+${formattedPhone}`;
      console.log(`[SMS Service] Added + to French international format: ${to} -> ${formattedPhone}`);
    } else if (!formattedPhone.startsWith("+")) {
      // Other numbers - just add + prefix
      formattedPhone = `+${formattedPhone}`;
      console.log(`[SMS Service] Added + prefix: ${to} -> ${formattedPhone}`);
    }

    // Normalize for GSM-7 to reduce segments and cost (no emojis, ASCII accents)
    const normalizedMessage = normalizeForGSM7(message);

    // Send SMS
    const messageResponse = await client.messages.create({
      body: normalizedMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`SMS sent successfully to ${formattedPhone}. Message SID: ${messageResponse.sid}`);
    return {
      success: true,
      messageSid: messageResponse.sid,
      status: messageResponse.status,
    };
  } catch (error) {
    // Check for Twilio permission errors (e.g., for certain countries like Cameroon)
    const isPermissionError = error.message && error.message.includes("Permission to send an SMS has not been enabled for the region");
    
    if (isPermissionError) {
      // Extract country code from phone number for better error message
      const countryCode = formattedPhone.startsWith("+237") ? "Cameroon (+237)" : 
                         formattedPhone.startsWith("+33") ? "France (+33)" : 
                         "this country";
      
      console.error(`[SMS Service] ❌ SMS permission error for ${formattedPhone}:`);
      console.error(`[SMS Service] ⚠️  Twilio does not have permission to send SMS to ${countryCode}.`);
      console.error(`[SMS Service] 📋 To enable SMS to ${countryCode}:`);
      console.error(`[SMS Service]    1. Log in to Twilio Console: https://console.twilio.com`);
      console.error(`[SMS Service]    2. Go to Settings > Geo Permissions`);
      console.error(`[SMS Service]    3. Enable SMS permissions for the required country`);
      console.error(`[SMS Service]    4. Note: Some countries require account verification`);
      
      return {
        success: false,
        error: `SMS permission not enabled for ${countryCode}. Please enable SMS geo permissions in Twilio Console for this country code.`,
        errorCode: "PERMISSION_ERROR",
        countryCode: formattedPhone.substring(0, 4), // +237 or +33
      };
    }
    
    console.error(`[SMS Service] Error sending SMS to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      errorCode: "GENERAL_ERROR",
    };
  }
}

/**
 * Collect prep tips from salon.serviceIds[].detailCard for this booking's services.
 * Falls back to avis-based templates when the salon left prep empty.
 */
function collectBookingPrepTips(salon, booking) {
  const {
    resolveDetailCardPrep,
  } = require("./prepTemplates.service");
  const bookedIds = new Set(
    (booking.serviceId || []).map((s) => String(s?._id || s)).filter(Boolean)
  );
  const must = [];
  const avoid = [];
  const seen = new Set();

  const pushUnique = (list, raw) => {
    const tip = String(raw || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!tip) return;
    const key = tip.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    list.push(tip);
  };

  const ingestEntry = (entry) => {
    const svc = entry?.id;
    const name =
      (svc && typeof svc === "object" && svc.name) || entry?.name || "";
    const categoryName =
      (svc && typeof svc === "object" && svc.categoryId && svc.categoryId.name) ||
      "";
    const card = resolveDetailCardPrep(name, categoryName, entry.detailCard || null);
    (Array.isArray(card.prepMust) ? card.prepMust : []).forEach((t) =>
      pushUnique(must, t)
    );
    (Array.isArray(card.prepAvoid) ? card.prepAvoid : []).forEach((t) =>
      pushUnique(avoid, t)
    );
  };

  for (const entry of salon.serviceIds || []) {
    const sid = String(entry?.id?._id || entry?.id || "");
    if (!sid || (bookedIds.size && !bookedIds.has(sid))) continue;
    ingestEntry(entry);
  }

  // If booking has no serviceId match but salon has one card only, still use it
  if (!must.length && !avoid.length && bookedIds.size === 0) {
    for (const entry of salon.serviceIds || []) {
      ingestEntry(entry);
      if (must.length || avoid.length) break;
    }
  }

  return { must: must.slice(0, 5), avoid: avoid.slice(0, 5) };
}

/**
 * Compact prep line for SMS cost control (aim 1 GSM segment with core message).
 * Prefer prepMust; at most 2 tips, each truncated.
 */
function buildShortPrepSnippet(must, avoid, maxLen = 52) {
  const shorten = (s, n) => {
    const t = String(s).trim();
    return t.length <= n ? t : `${t.slice(0, Math.max(1, n - 3))}...`;
  };

  const bits = [];
  for (const tip of must.slice(0, 2)) {
    bits.push(shorten(tip, 22));
  }
  if (!bits.length && avoid.length) {
    bits.push(`Eviter ${shorten(avoid[0], 20)}`);
  }

  if (!bits.length) return "";

  let line = `Prep: ${bits.join(", ")}`;
  if (line.length > maxLen) {
    line = `${line.slice(0, Math.max(1, maxLen - 3)).replace(/\s+\S*$/, "")}...`;
  }
  return line;
}

/**
 * Build reminder SMS — short, GSM-7 friendly, optional prep tip.
 * Soft cap ~153 chars (1 concatenated segment) after normalize.
 */
function buildAppointmentReminderMessage({
  reminderType,
  customerName,
  salonName,
  appointmentDate,
  appointmentTime,
  bookingId,
  prepMust = [],
  prepAvoid = [],
  prepConfirmUrl = "",
}) {
  const first = String(customerName || "Cliente")
    .trim()
    .split(/\s+/)[0]
    .slice(0, 12);
  const salon = String(salonName || "Salon").trim().slice(0, 22);
  const time = String(appointmentTime || "").trim();
  const id = String(bookingId || "").trim();
  const confirmUrl = String(prepConfirmUrl || "").trim();

  // Core (no accents — normalizeForGSM7 also strips them)
  let core;
  if (reminderType === "24h") {
    core = `Skedisy: RDV ${salon} demain ${time}.`;
  } else if (reminderType === "j1" || reminderType === "prep") {
    core = `Skedisy: RDV ${salon} demain ${time}.`;
  } else if (reminderType === "2h") {
    core = `Skedisy: RDV ${salon} dans 2h (${time}).`;
  } else {
    core = `Skedisy: RDV ${salon} ${appointmentDate || ""} ${time}.`.replace(
      /\s+/g,
      " "
    );
  }

  // Budget for prep + confirm link: keep total near 1 SMS segment
  const idPart = id ? ` #${id}` : "";
  const maxTotal = 153;
  const linkPart =
    confirmUrl && (reminderType === "24h" || reminderType === "j1" || reminderType === "prep")
      ? ` PrepOK ${confirmUrl}`
      : "";
  const prepBudget = Math.max(
    0,
    maxTotal - core.length - idPart.length - linkPart.length - 1
  );
  const prep =
    prepBudget >= 12
      ? buildShortPrepSnippet(prepMust, prepAvoid, Math.min(48, prepBudget))
      : "";

  let message = [core, prep, linkPart.trim(), idPart.trim()]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  // Drop booking id first if still too long
  if (message.length > maxTotal && idPart) {
    message = [core, prep, linkPart.trim()]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // Drop prep before link (link is actionable)
  if (message.length > maxTotal && prep) {
    message = [core, linkPart.trim()]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (message.length > maxTotal) {
    message = `${message.slice(0, maxTotal - 3)}...`;
  }
  void first;
  return message.trim();
}

/**
 * Send appointment reminder SMS
 * @param {Object} booking - Booking object with populated user and salon
 * @param {string} reminderType - Type of reminder: '24h' or '2h'
 * @returns {Promise<Object>} - SMS send result
 */
async function sendAppointmentReminder(booking, reminderType = "24h") {
  try {
    if (!booking.userId || !booking.salonId) {
      return { success: false, error: "Booking data incomplete" };
    }

    // Populate user and salon if not already populated
    const User = require("../models/user.model");
    const Salon = require("../models/salon.model");

    const [user, salon] = await Promise.all([
      booking.userId.mobile ? booking.userId : User.findById(booking.userId),
      booking.salonId.name && booking.salonId.serviceIds
        ? booking.salonId
        : Salon.findById(booking.salonId).select("name serviceIds"),
    ]);

    if (!user || !user.mobile || user.mobile.trim() === "") {
      console.log(`[SMS Reminder] User ${user?._id || booking.userId} does not have a mobile number. Skipping SMS reminder for booking ${booking.bookingId || booking._id}.`);
      return { success: false, error: "User mobile number not found" };
    }

    console.log(`[SMS Reminder] Attempting to send ${reminderType} reminder to user ${user._id} (mobile: ${user.mobile}) for booking ${booking.bookingId || booking._id}`);

    if (!salon) {
      return { success: false, error: "Salon not found" };
    }

    const appointmentDate = booking.date;
    const appointmentTime = booking.startTime || booking.time?.[0] || "";
    const customerName = user.fname || "Cliente";
    const salonName = salon.name || "Salon";
    const bookingId = booking.bookingId || "";
    const { must: prepMust, avoid: prepAvoid } = collectBookingPrepTips(
      salon,
      booking
    );

    // One-tap prep confirm link for J-1
    let prepConfirmUrl = "";
    let prepChecklistIncluded = false;
    if (reminderType === "24h" || reminderType === "j1" || reminderType === "prep") {
      const crypto = require("crypto");
      if (!booking.prepConfirmToken) {
        booking.prepConfirmToken = crypto.randomBytes(12).toString("hex");
        try {
          await booking.save();
        } catch (e) {
          console.warn("[SMS Reminder] prepConfirmToken save failed", e.message);
        }
      }
      if (booking.prepConfirmToken && !booking.prepConfirmedAt) {
        const base = (process.env.baseURL || "https://skedisy.com").replace(
          /\/+$/,
          ""
        );
        prepConfirmUrl = `${base}/p/${booking.prepConfirmToken}`;
        prepChecklistIncluded = true;
      }
      if (prepMust.length || prepAvoid.length) {
        prepChecklistIncluded = true;
      }
    }

    let message = buildAppointmentReminderMessage({
      reminderType,
      customerName,
      salonName,
      appointmentDate,
      appointmentTime,
      bookingId,
      prepMust,
      prepAvoid,
      prepConfirmUrl,
    });

    // Soft checklist text only if no URL room / no confirm link
    if (
      (reminderType === "24h" || reminderType === "j1") &&
      !prepConfirmUrl
    ) {
      const checks = [];
      const hasPhoto =
        Array.isArray(booking.inspirationPhotoUrls) &&
        booking.inspirationPhotoUrls.length > 0;
      if (booking.inspirationPhotoRequired && !hasPhoto) {
        checks.push("Photo inspiration manquante");
      }
      if (!booking.prepConfirmedAt && prepMust.length) {
        checks.push("Confirmer prep");
      }
      if (checks.length && message.length < 120) {
        const extra = checks.join(" / ").slice(0, 40);
        message = `${message} ${extra}`.trim().slice(0, 153);
        prepChecklistIncluded = true;
      }
    }

    console.log(
      `[SMS Reminder] Message (${message.length} chars): ${message}`
    );

    const result = await sendSMS(user.mobile, message);

    if (result.success) {
      console.log(`[SMS Reminder] Successfully sent ${reminderType} reminder to ${user.mobile} for booking ${booking.bookingId || booking._id}`);
      result.prepChecklistIncluded = prepChecklistIncluded;
    } else {
      console.error(`[SMS Reminder] Failed to send ${reminderType} reminder to ${user.mobile} for booking ${booking.bookingId || booking._id}: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error("Error in sendAppointmentReminder:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
  sendAppointmentReminder,
  collectBookingPrepTips,
  buildShortPrepSnippet,
  buildAppointmentReminderMessage,
};

