const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const Service = require("../../models/service.model");
const mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid only if API key is configured
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[Claim Controller] SendGrid initialized with API key');
} else {
  console.error('[Claim Controller] ⚠️  WARNING: SENDGRID_API_KEY not found in environment variables');
  console.error('[Claim Controller] Email sending will fail. Please add SENDGRID_API_KEY to .env file');
}

const { sendSMS } = require("../../services/sms.service");

const DEFAULT_SERVICE_PRICE = 50;
const DAY_KEYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function capitalize(str) {
  const s = String(str || "").trim();
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildDefaultSalonTime(overrides = {}) {
  const openTime = overrides.openTime || "09:00 AM";
  const closedTime = overrides.closedTime || "07:00 PM";
  const activeDays = Array.isArray(overrides.activeDays) && overrides.activeDays.length
    ? overrides.activeDays
    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const slot = {
    openTime,
    closedTime,
    isActive: true,
    breakStartTime: overrides.breakStartTime || "01:00 PM",
    breakEndTime: overrides.breakEndTime || "02:00 PM",
    time: 15,
    isBreak: true,
  };

  return DAY_KEYS.map((day) => ({
    day,
    ...slot,
    isActive: activeDays.includes(day),
  }));
}

async function reserveUniqueSalonId() {
  for (let i = 0; i < 20; i++) {
    const uniqueId = Math.floor(Math.random() * 10000000) + 100000;
    const clash = await Salon.findOne({ uniqueId }).select("_id").lean();
    if (!clash) return uniqueId;
  }
  return Date.now() % 100000000;
}

async function reserveUniqueExpertId() {
  for (let i = 0; i < 20; i++) {
    const uniqueId = Math.floor(Math.random() * 1000000) + 999999;
    const clash = await Expert.findOne({ uniqueId }).select("_id").lean();
    if (!clash) return uniqueId;
  }
  return Date.now() % 10000000;
}

async function resolveServiceEntries(rawServices) {
  let list = rawServices;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch (_) {
      list = list.split(",").map((id) => ({ id: id.trim() }));
    }
  }
  if (!Array.isArray(list)) list = [];

  const entries = [];
  for (const item of list) {
    const id = String(item?.id || item?.serviceId || item || "").trim();
    if (!id || !mongoose.Types.ObjectId.isValid(id)) continue;
    const priceNum = Number(item?.price);
    entries.push({
      id: new mongoose.Types.ObjectId(id),
      price:
        Number.isFinite(priceNum) && priceNum > 0
          ? priceNum
          : DEFAULT_SERVICE_PRICE,
    });
  }

  if (!entries.length) return [];

  const found = await Service.find({
    _id: { $in: entries.map((e) => e.id) },
    isDelete: { $ne: true },
    status: { $ne: false },
  })
    .select("_id")
    .lean();

  const ok = new Set(found.map((s) => String(s._id)));
  return entries
    .filter((e) => ok.has(String(e.id)))
    .map((e) => ({
      id: e.id,
      price: e.price,
      allowCities: [],
      afroConfig: null,
      detailCard: {
        shortDescription: "",
        includes: [],
        prepMust: [],
        prepAvoid: [],
        addons: [],
        recommendedProductIds: [],
      },
    }));
}

function publicFileUrl(file) {
  if (!file || !file.path) return "";
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
    /\/?$/,
    "/"
  );
  const rel = String(file.path).replace(/\\/g, "/");
  // multer stores under storage/… — expose as absolute URL
  if (/^https?:\/\//i.test(rel)) return rel;
  return baseURL + rel.replace(/^\//, "");
}

/**
 * Create (or refresh) an owner expert = same person as salon account.
 * @param {string|null} expertImageUrl optional photo for the first expert
 */
async function ensureOwnerExpert(
  salon,
  password,
  serviceObjectIds = [],
  expertImageUrl = null
) {
  const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
    /\/?$/,
    "/"
  );
  const defaultImage = `${baseURL}storage/male.png`;
  const resolvedImage =
    expertImageUrl || salon.mainImage || defaultImage;

  let expertEmail = String(salon.email || "").trim().toLowerCase();
  const emailTaken = await Expert.findOne({
    email: expertEmail,
    salonId: { $ne: salon._id },
    isDelete: { $ne: true },
  })
    .select("_id")
    .lean();
  if (emailTaken) {
    expertEmail = `staff-${salon.uniqueId || String(salon._id).slice(-8)}@skedisy-temp.com`;
  }

  const nameParts = String(salon.name || "Salon")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const fname = capitalize(nameParts[0] || "Proprietaire");
  const lname = capitalize(
    (nameParts.slice(1).join(" ") || salon.name || "Salon").slice(0, 40)
  );

  let expert = await Expert.findOne({
    salonId: salon._id,
    isDelete: { $ne: true },
  });

  if (expert) {
    expert.password = password;
    expert.mobile = salon.mobile || expert.mobile;
    expert.email = expertEmail;
    if (serviceObjectIds.length) {
      expert.serviceId = serviceObjectIds;
    }
    if (expertImageUrl || !expert.image) {
      expert.image = resolvedImage;
    }
    expert.isBlock = false;
    expert.isDelete = false;
    await expert.save();
    return expert;
  }

  expert = new Expert();
  expert.fname = fname;
  expert.lname = lname;
  expert.email = expertEmail;
  expert.age = 30;
  expert.gender = "Other";
  expert.mobile = salon.mobile || "";
  expert.commission = 0;
  expert.password = password;
  expert.uniqueId = await reserveUniqueExpertId();
  expert.salonId = salon._id;
  expert.serviceId = serviceObjectIds;
  expert.image = resolvedImage;
  expert.isBlock = false;
  expert.isDelete = false;
  await expert.save();
  return expert;
}

/**
 * Claim salon profile using token and email
 * POST /salon/claim
 * Also creates owner expert + keeps (or seeds) services so the salon can take bookings.
 */
exports.claimSalon = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(200).json({
        status: false,
        message: "Token, email, and password are required"
      });
    }

    // Find salon by email and claim token
    // IMPORTANT: Allow claiming even if isDelete is true (soft delete recovery)
    const salon = await Salon.findOne({
      email: email.trim(),
      claimToken: token.trim()
      // Removed isDelete: false to allow recovery of soft-deleted salons
    });

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Invalid claim token or email. Please check your invitation email."
      });
    }

    // Check if already claimed
    if (salon.isClaimed) {
      return res.status(200).json({
        status: false,
        message: "This salon profile has already been claimed."
      });
    }

    // Update salon: claim profile, set password, activate
    salon.isClaimed = true;
    salon.isActive = true;
    salon.isDelete = false; // Ensure salon is not marked as deleted
    salon.password = password;
    salon.claimToken = ""; // Clear token after claiming

    // Optional services from claim completion form
    const serviceEntries = await resolveServiceEntries(
      req.body?.services || req.body?.serviceIds
    );
    if (serviceEntries.length) {
      const existingIds = new Set(
        (salon.serviceIds || []).map((s) => String(s.id))
      );
      for (const entry of serviceEntries) {
        if (!existingIds.has(String(entry.id))) {
          salon.serviceIds.push(entry);
        }
      }
    }

    // Seed hours if missing
    if (!Array.isArray(salon.salonTime) || salon.salonTime.length === 0) {
      salon.salonTime = buildDefaultSalonTime({
        openTime: req.body?.openTime,
        closedTime: req.body?.closedTime,
        activeDays: req.body?.activeDays,
      });
    }

    await salon.save();

    const serviceObjectIds = (salon.serviceIds || [])
      .map((s) => s.id)
      .filter(Boolean);
    const expert = await ensureOwnerExpert(salon, password, serviceObjectIds);

    console.log(
      `[Claim] Salon ${salon.name} (${salon.email}) claimed. Expert ${expert._id}. Services=${serviceObjectIds.length}`
    );

    return res.status(200).json({
      status: true,
      message: "Salon profile claimed successfully!",
      data: {
        salonId: salon._id,
        name: salon.name,
        email: salon.email,
        isActive: salon.isActive,
        isClaimed: salon.isClaimed,
        expertId: expert._id,
        servicesCount: serviceObjectIds.length,
      }
    });
  } catch (error) {
    console.error("Claim salon error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * Send claim invitation email and/or SMS to salon
 * Used by admin to send invitation
 * Supports: email (default), sms, or both
 */
exports.sendClaimInvitation = async (req, res) => {
  try {
    const { salonId, method = 'email' } = req.body; // method: 'email', 'sms', or 'both'

    if (!salonId) {
      return res.status(200).json({
        status: false,
        message: "Salon ID is required"
      });
    }

    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon not found"
      });
    }

    if (salon.isClaimed) {
      return res.status(200).json({
        status: false,
        message: "This salon has already been claimed"
      });
    }

    // Generate claimToken if it doesn't exist or is empty
    if (!salon.claimToken || salon.claimToken.trim() === '') {
      const crypto = require('crypto');
      salon.claimToken = crypto.randomBytes(32).toString('hex');
      await salon.save();
      console.log(`[Claim Invitation] ✅ Generated new claimToken for salon ${salon.name} (ID: ${salon._id})`);
      console.log(`[Claim Invitation] Token length: ${salon.claimToken.length} characters`);
    } else {
      console.log(`[Claim Invitation] Using existing claimToken for salon ${salon.name}`);
    }

    // Verify token is not empty before generating link
    if (!salon.claimToken || salon.claimToken.trim() === '') {
      console.error(`[Claim Invitation] ❌ ERROR: claimToken is still empty after generation!`);
      return res.status(200).json({
        status: false,
        message: "Failed to generate claim token. Please try again."
      });
    }

    // Generate claim link - ensure baseURL doesn't have trailing slash (we add it)
    let baseURL = process.env.baseURL || '';
    if (baseURL && !baseURL.endsWith('/')) {
      baseURL = baseURL + '/';
    }
    const claimLink = `${baseURL}salon/claim?token=${salon.claimToken}&email=${encodeURIComponent(salon.email)}`;
    
    console.log(`[Claim Invitation] Generated claim link for ${salon.name}:`);
    console.log(`   Token: ${salon.claimToken.substring(0, 10)}... (length: ${salon.claimToken.length})`);
    console.log(`   Email: ${salon.email}`);
    console.log(`   Link: ${claimLink}`);
    
    // Verify link is correct
    if (claimLink.includes('token=&') || claimLink.includes('token=') && !salon.claimToken) {
      console.error(`[Claim Invitation] ❌ ERROR: Generated link has empty token!`);
      console.error(`[Claim Invitation] Link: ${claimLink}`);
      return res.status(200).json({
        status: false,
        message: "Failed to generate valid claim link. Please try again."
      });
    }

    const results = {
      email: null,
      sms: null
    };

    // Send email if method is 'email' or 'both'
    if (method === 'email' || method === 'both') {
      // Validate email configuration first
      if (!process.env.SENDGRID_API_KEY) {
        console.error("[Claim Invitation] ❌ ERROR: SENDGRID_API_KEY not configured in .env");
        results.email = { success: false, error: "SendGrid API key not configured" };
      } else if (!process.env.EMAIL) {
        console.error("[Claim Invitation] ❌ ERROR: EMAIL (from address) not configured in .env");
        results.email = { success: false, error: "Email from address not configured" };
      } else if (!salon.email || salon.email.trim() === '') {
        console.error(`[Claim Invitation] ❌ ERROR: Salon ${salon.name} (ID: ${salon._id}) does not have an email address`);
        results.email = { success: false, error: "Salon email address not found" };
      } else {
        // Create email template
        const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
            h2 { color: #333; }
            p { color: #666; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #0056b3; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 style="color: #007bff; text-align: center;">🎉 Félicitations ! Votre salon est sur Skedisy</h2>
            <p>Bonjour,</p>
            <p>Excellente nouvelle ! Votre salon <strong>${salon.name}</strong> a été ajouté sur <strong>Skedisy</strong>, la plateforme de réservation de services de beauté qui connecte des milliers de clients aux meilleurs salons.</p>
            
            <p style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
              <strong>✨ Pourquoi réclamer votre profil maintenant ?</strong><br>
              C'est <strong>gratuit</strong>, cela prend moins de 2 minutes, et vous pourrez commencer à recevoir des réservations dès aujourd'hui !
            </p>
            
            <p><strong>En réclamant votre profil, vous pourrez :</strong></p>
            <ul style="line-height: 2;">
              <li>✅ <strong>Gérer toutes vos réservations</strong> en ligne, 24/7</li>
              <li>✅ <strong>Augmenter votre visibilité</strong> et être découvert par de nouveaux clients</li>
              <li>✅ <strong>Recevoir des réservations</strong> même en dehors des heures d'ouverture</li>
              <li>✅ <strong>Suivre vos revenus en temps réel</strong> avec un tableau de bord complet</li>
              <li>✅ <strong>Gagner du temps</strong> en automatisant la gestion des rendez-vous</li>
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${claimLink}" class="button" style="font-size: 16px; font-weight: bold; padding: 15px 40px;">🚀 Réclamer mon profil maintenant</a>
            </p>
            
            <p style="text-align: center; color: #666; font-size: 0.9em;">Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #007bff; text-align: center; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${claimLink}</p>
            
            <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
              <strong>💡 Astuce :</strong> Plus vous réclamez tôt votre profil, plus vite vous commencerez à recevoir des réservations !
            </p>
            
            <div class="footer">
              <p style="margin-top: 30px;"><strong>Des questions ? Nous sommes là pour vous aider :</strong></p>
              <p>📧 Email : <a href="mailto:support@skedisy.com" style="color: #007bff; text-decoration: none;">support@skedisy.com</a></p>
              <p>📞 Téléphone : <a href="tel:+33766160394" style="color: #007bff; text-decoration: none;">+33 7 66 16 03 94</a></p>
              <p>🌐 Site web : <a href="https://skedisy.com" style="color: #007bff; text-decoration: none;">https://skedisy.com</a></p>
              <p style="margin-top: 25px;">Cordialement,<br><strong>L'équipe Skedisy</strong></p>
              <p style="font-size: 0.8em; color: #999; margin-top: 15px; font-style: italic;">Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.</p>
            </div>
          </div>
        </body>
        </html>
      `;

        const msg = {
          to: salon.email.trim(),
          from: process.env.EMAIL.trim(),
          subject: "🎉 Félicitations ! Réclamez votre profil Skedisy gratuitement (2 min)",
          html: emailHtml,
        };

        try {
          console.log(`[Claim Invitation] 📧 Attempting to send email:`);
          console.log(`   To: ${salon.email}`);
          console.log(`   From: ${process.env.EMAIL}`);
          console.log(`   Salon: ${salon.name} (ID: ${salon._id})`);
          console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
          
          const emailResponse = await sgMail.send(msg);
          
          console.log(`[Claim Invitation] ✅ Email sent successfully!`);
          console.log(`   Status Code: ${emailResponse[0]?.statusCode}`);
          console.log(`   Response Headers:`, emailResponse[0]?.headers);
          
          results.email = { success: true, message: "Email sent successfully" };
        } catch (error) {
          console.error(`[Claim Invitation] ❌ Email send FAILED:`);
          console.error(`   To: ${salon.email}`);
          console.error(`   Error Message: ${error.message}`);
          console.error(`   Error Code: ${error.code}`);
          if (error.response?.body) {
            console.error(`   SendGrid Response:`, JSON.stringify(error.response.body, null, 2));
            if (error.response.body.errors) {
              error.response.body.errors.forEach((err, idx) => {
                console.error(`   Error ${idx + 1}: ${err.message} (field: ${err.field})`);
              });
            }
          }
          
          // Extract detailed error message
          let errorMessage = error.message || "Failed to send email";
          if (error.response?.body?.errors && error.response.body.errors.length > 0) {
            errorMessage = error.response.body.errors.map(e => e.message).join('; ');
          }
          
          results.email = { success: false, error: errorMessage };
        }
      }
    }

    // Send SMS if method is 'sms' or 'both'
    if (method === 'sms' || method === 'both') {
      if (!salon.mobile || salon.mobile.trim() === '') {
        console.log(`[Claim Invitation] ⚠️  Salon ${salon.name} (ID: ${salon._id}) does not have a mobile number`);
        results.sms = { success: false, error: "Salon mobile number not found" };
      } else {
        console.log(`[Claim Invitation] Attempting to send SMS to: ${salon.mobile} for salon: ${salon.name}`);
        const smsMessage = `Salon ${salon.name} sur Skedisy! Reclamez gratuit: ${claimLink}`;
        const smsResult = await sendSMS(salon.mobile, smsMessage);
        results.sms = smsResult;
        
        if (smsResult.success) {
          console.log(`[Claim Invitation] ✅ SMS sent successfully to ${salon.mobile}`);
        } else {
          // Check if it's a permission error (e.g., Cameroon not enabled in Twilio)
          if (smsResult.errorCode === "PERMISSION_ERROR") {
            console.error(`[Claim Invitation] ❌ SMS failed for ${salon.mobile}: ${smsResult.error}`);
            console.error(`[Claim Invitation] ⚠️  Twilio geo permission not enabled for ${smsResult.countryCode || "this country"}`);
            console.error(`[Claim Invitation] 📧 Email invitation will still be sent if enabled.`);
            console.error(`[Claim Invitation] 💡 Recommendation: Enable ${smsResult.countryCode || "country"} SMS permissions in Twilio Console`);
          } else {
            console.error(`[Claim Invitation] ❌ SMS failed for ${salon.mobile}:`, smsResult.error);
          }
        }
      }
    }

    // Return results - consider it success if at least one method succeeded
    const hasSuccess = (method === 'email' && results.email?.success) ||
                      (method === 'sms' && results.sms?.success) ||
                      (method === 'both' && (results.email?.success || results.sms?.success));

    let message = "Claim invitation sent successfully";
    if (method === 'both') {
      if (results.email?.success && results.sms?.success) {
        message = "Claim invitation sent via email and SMS";
      } else if (results.email?.success) {
        message = "Claim invitation sent via email (SMS failed or not configured)";
      } else if (results.sms?.success) {
        message = "Claim invitation sent via SMS (Email failed)";
      } else {
        message = "Failed to send invitation via email and SMS";
      }
    }

    return res.status(200).json({
      status: hasSuccess,
      message: message,
      data: {
        salonId: salon._id,
        salonName: salon.name,
        email: salon.email,
        mobile: salon.mobile,
        method: method,
        results: results
      }
    });
  } catch (error) {
    console.error("Send invitation error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * Bulk send claim invitations
 * POST /api/admin/salon/bulk-send-invitations
 */
exports.bulkSendInvitations = async (req, res) => {
  try {
    const { department, limit = 50 } = req.body;

    // Build query filter
    const filter = {
      isClaimed: false,
      isDelete: false
    };

    // Add department filter if provided (from metadata)
    if (department) {
      filter['metadata.department'] = department;
    }

    // Get unclaimed salons
    const salons = await Salon.find(filter)
      .limit(parseInt(limit))
      .select('_id name email claimToken metadata');

    if (salons.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No unclaimed salons found",
        sent: 0,
        failed: 0
      });
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send invitations in batches
    for (const salon of salons) {
      try {
        const claimLink = `${process.env.baseURL}salon/claim?token=${salon.claimToken}&email=${encodeURIComponent(salon.email)}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
              h2 { color: #333; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button:hover { background-color: #0056b3; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 style="color: #007bff; text-align: center;">🎉 Félicitations ! Votre salon est sur Skedisy</h2>
              <p>Bonjour,</p>
              <p>Excellente nouvelle ! Votre salon <strong>${salon.name}</strong> a été ajouté sur <strong>Skedisy</strong>, la plateforme de réservation de services de beauté qui connecte des milliers de clients aux meilleurs salons.</p>
              
              <p style="background-color: #f0f8ff; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                <strong>✨ Pourquoi réclamer votre profil maintenant ?</strong><br>
                C'est <strong>gratuit</strong>, cela prend moins de 2 minutes, et vous pourrez commencer à recevoir des réservations dès aujourd'hui !
              </p>
              
              <p><strong>En réclamant votre profil, vous pourrez :</strong></p>
              <ul style="line-height: 2;">
                <li>✅ <strong>Gérer toutes vos réservations</strong> en ligne, 24/7</li>
                <li>✅ <strong>Augmenter votre visibilité</strong> et être découvert par de nouveaux clients</li>
                <li>✅ <strong>Recevoir des réservations</strong> même en dehors des heures d'ouverture</li>
                <li>✅ <strong>Suivre vos revenus en temps réel</strong> avec un tableau de bord complet</li>
                <li>✅ <strong>Gagner du temps</strong> en automatisant la gestion des rendez-vous</li>
              </ul>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${claimLink}" class="button" style="font-size: 16px; font-weight: bold; padding: 15px 40px;">🚀 Réclamer mon profil maintenant</a>
              </p>
              
              <p style="text-align: center; color: #666; font-size: 0.9em;">Ou copiez ce lien dans votre navigateur :</p>
              <p style="word-break: break-all; color: #007bff; text-align: center; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${claimLink}</p>
              
              <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                <strong>💡 Astuce :</strong> Plus vous réclamez tôt votre profil, plus vite vous commencerez à recevoir des réservations !
              </p>
              
              <div class="footer">
                <p style="margin-top: 30px;"><strong>Des questions ? Nous sommes là pour vous aider :</strong></p>
                <p>📧 Email : <a href="mailto:support@skedisy.com" style="color: #007bff; text-decoration: none;">support@skedisy.com</a></p>
                <p>📞 Téléphone : <a href="tel:+33766160394" style="color: #007bff; text-decoration: none;">+33 7 66 16 03 94</a></p>
                <p>🌐 Site web : <a href="https://skedisy.com" style="color: #007bff; text-decoration: none;">https://skedisy.com</a></p>
                <p style="margin-top: 25px;">Cordialement,<br><strong>L'équipe Skedisy</strong></p>
                <p style="font-size: 0.8em; color: #999; margin-top: 15px; font-style: italic;">Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const msg = {
          to: salon.email,
          from: process.env.EMAIL,
          subject: "🎉 Félicitations ! Réclamez votre profil Skedisy gratuitement (2 min)",
          html: emailHtml,
        };

        await sgMail.send(msg);
        sent++;
        
        // Rate limiting: wait 1 second between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        errors.push({
          salonId: salon._id,
          salonName: salon.name,
          error: error.message
        });
        console.error(`Failed to send invitation to ${salon.email}:`, error.message);
      }
    }

    return res.status(200).json({
      status: true,
      message: `Bulk invitation sending completed`,
      sent,
      failed,
      total: salons.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Bulk send invitations error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

/**
 * Shared duplicate check for email / mobile on self-register.
 * Returns { field, message } or null if free.
 */
async function findRegisterConflict(email, mobile) {
  const emailNorm = String(email || "").trim().toLowerCase();
  const mobileNorm = String(mobile || "").trim();
  const mobileDigits = digitsOnly(mobileNorm);
  if (!emailNorm && !mobileNorm) return null;

  // Email exact match (case-insensitive) + common mobile formats
  const or = [];
  if (emailNorm) or.push({ email: emailNorm });
  if (mobileNorm) {
    or.push({ mobile: mobileNorm });
    if (mobileDigits) {
      or.push({ mobile: mobileDigits });
      // 0612345678 vs 06 12 34 56 78
      if (mobileDigits.length === 10) {
        or.push({
          mobile:
            mobileDigits.slice(0, 2) +
            " " +
            mobileDigits.slice(2, 4) +
            " " +
            mobileDigits.slice(4, 6) +
            " " +
            mobileDigits.slice(6, 8) +
            " " +
            mobileDigits.slice(8, 10),
        });
      }
    }
  }

  const existing = or.length
    ? await Salon.findOne({ isDelete: false, $or: or })
    : null;

  if (!existing) return null;

  if (
    emailNorm &&
    String(existing.email || "").trim().toLowerCase() === emailNorm
  ) {
    return {
      field: "email",
      message: existing.isClaimed
        ? "Cet e-mail existe déjà. Modifiez votre e-mail, ou connectez-vous à votre espace salon."
        : "Cet e-mail existe déjà sur Skedisy. Modifiez votre e-mail, ou utilisez le lien d'invitation pour réclamer le salon.",
    };
  }

  if (
    mobileDigits &&
    digitsOnly(existing.mobile) === mobileDigits
  ) {
    return {
      field: "mobile",
      message:
        "Ce numéro de téléphone existe déjà. Modifiez votre numéro de téléphone.",
    };
  }

  return {
    field: "email",
    message: "Cet e-mail ou ce numéro existe déjà. Modifiez vos identifiants.",
  };
}

/**
 * Quick check before leaving step 1 (email / mobile free?).
 * POST /salon/check-register
 * Body: { email, mobile }
 */
exports.checkRegisterAvailability = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const mobile = String(req.body?.mobile || "").trim();

    if (!email && !mobile) {
      return res.status(200).json({
        status: false,
        message: "Indiquez un e-mail ou un numéro de téléphone.",
      });
    }

    if (email && !email.includes("@")) {
      return res.status(200).json({
        status: false,
        field: "email",
        message: "Adresse e-mail invalide. Modifiez votre e-mail.",
      });
    }

    const conflict = await findRegisterConflict(email, mobile);
    if (conflict) {
      return res.status(200).json({
        status: false,
        field: conflict.field,
        message: conflict.message,
      });
    }

    return res.status(200).json({ status: true, message: "Disponible." });
  } catch (error) {
    console.error("[CheckRegister] error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/**
 * Public subscription plans for onboarding step 4 (Free first).
 * GET /api/public/onboarding/plans
 */
exports.listOnboardingPlans = async (req, res) => {
  try {
    const {
      ensureDefaultPlans,
    } = require("../../services/subscription.service");
    await ensureDefaultPlans();
    const SubscriptionPlan = require("../../models/subscriptionPlan.model");
    const plans = await SubscriptionPlan.find({ isActive: true })
      .select(
        "planId name tagline tier priceMonthly priceYearly trialDays sortOrder isDefault isHighlighted limits features"
      )
      .sort({ sortOrder: 1 })
      .lean();

    // Free / Essai always first
    plans.sort((a, b) => {
      if (a.planId === "free") return -1;
      if (b.planId === "free") return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    return res.status(200).json({
      status: true,
      data: plans.map((p) => ({
        planId: p.planId,
        name: p.name,
        tagline: p.tagline || "",
        tier: p.tier,
        priceMonthly: p.priceMonthly || 0,
        priceYearly: p.priceYearly || 0,
        trialDays: p.trialDays || 0,
        isDefault: !!p.isDefault,
        isHighlighted: !!p.isHighlighted,
        limits: p.limits || {},
        featureCount: Array.isArray(p.features) ? p.features.length : 0,
      })),
    });
  } catch (error) {
    console.error("[OnboardingPlans] error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/**
 * Public catalogue for onboarding multi-select.
 * GET /api/public/onboarding/services
 */
exports.listOnboardingServices = async (req, res) => {
  try {
    const language = String(req.query.language || "fr").toLowerCase();
    const services = await Service.find({
      isDelete: { $ne: true },
      status: { $ne: false },
    })
      .select("name nameEn nameFr namePt duration categoryId image")
      .populate("categoryId", "name nameFr nameEn")
      .sort({ name: 1 })
      .lean();

    const data = services.map((s) => {
      let name = s.name;
      if (language === "en" && s.nameEn) name = s.nameEn;
      else if (language === "fr" && s.nameFr) name = s.nameFr;
      else if (language === "pt" && s.namePt) name = s.namePt;

      const cat = s.categoryId;
      let categoryName = "";
      if (cat) {
        categoryName =
          (language === "fr" && cat.nameFr) ||
          (language === "en" && cat.nameEn) ||
          cat.name ||
          "";
      }

      return {
        _id: s._id,
        name,
        duration: s.duration || 60,
        categoryName,
        image: s.image || "",
        defaultPrice: DEFAULT_SERVICE_PRICE,
      };
    });

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error("[OnboardingServices] error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/**
 * Public self-registration (3-step form) — same UX as rejoindre/claim without token.
 * Creates claimed salon + services + owner expert (same login person).
 * POST /salon/self-register
 * Body: {
 *   name, mobile, city, email, password, address, about?,
 *   services: [{ id, price? }],
 *   openTime?, closedTime?, activeDays?: string[],
 *   utmSource?, utmMedium?, utmCampaign?
 * }
 */
exports.selfRegister = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const mobile = String(req.body?.mobile || "").trim();
    const city = String(req.body?.city || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const address = String(req.body?.address || "").trim();
    const about = String(req.body?.about || "").trim();
    const landMark = String(req.body?.landMark || city).trim();
    const state = String(req.body?.state || "Île-de-France").trim();
    const country = String(req.body?.country || "France").trim();
    const latitude = String(req.body?.latitude || "").trim();
    const longitude = String(req.body?.longitude || "").trim();
    const utmSource = String(req.body?.utmSource || "").trim();
    const utmMedium = String(req.body?.utmMedium || "").trim();
    const utmCampaign = String(req.body?.utmCampaign || "").trim();

    if (!name || !mobile || !city || !email || !password || !address) {
      return res.status(200).json({
        status: false,
        message:
          "Nom du salon, téléphone, ville, e-mail, mot de passe et adresse sont requis.",
      });
    }

    if (!email.includes("@")) {
      return res.status(200).json({
        status: false,
        message: "Adresse e-mail invalide.",
      });
    }

    if (password.length < 6) {
      return res.status(200).json({
        status: false,
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    const serviceEntries = await resolveServiceEntries(
      req.body?.services || req.body?.serviceIds
    );
    if (!serviceEntries.length) {
      return res.status(200).json({
        status: false,
        message: "Choisissez au moins une prestation.",
      });
    }

    const conflict = await findRegisterConflict(email, mobile);
    if (conflict) {
      return res.status(200).json({
        status: false,
        field: conflict.field,
        message: conflict.message,
      });
    }

    const baseURL = (process.env.baseURL || "https://skedisy.com").replace(
      /\/?$/,
      "/"
    );
    const defaultImage = `${baseURL}storage/male.png`;

    const sourceParts = ["self_register"];
    if (utmSource) sourceParts.push(utmSource);
    if (utmMedium) sourceParts.push(utmMedium);
    if (utmCampaign) sourceParts.push(utmCampaign);

    let activeDays = req.body?.activeDays;
    if (typeof activeDays === "string") {
      try {
        activeDays = JSON.parse(activeDays);
      } catch (_) {
        activeDays = activeDays
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean);
      }
    }
    if (!Array.isArray(activeDays) || !activeDays.length) {
      activeDays = undefined;
    }

    const salon = new Salon();
    salon.name = name;
    salon.email = email;
    salon.mobile = mobile;
    salon.password = password;
    salon.uniqueId = await reserveUniqueSalonId();
    salon.addressDetails = {
      addressLine1: capitalize(address),
      landMark: capitalize(landMark),
      city: capitalize(city),
      state: capitalize(state),
      country: capitalize(country),
    };
    salon.locationCoordinates = {
      latitude: latitude || "",
      longitude: longitude || "",
    };
    salon.about =
      about ||
      `${name} — salon partenaire Skedisy à ${capitalize(city)}.`;
    salon.platformFee = 0;
    salon.wallet = 0;
    salon.minWalletBalance = null;
    salon.paymentMethods = { acceptCash: true, acceptStripe: false };

    // Photos (optional): salon carousel + first expert
    const salonFile =
      (req.files && req.files.salonImage && req.files.salonImage[0]) ||
      (req.files && req.files.image && req.files.image[0]) ||
      null;
    const expertFile =
      (req.files && req.files.expertImage && req.files.expertImage[0]) || null;

    const salonPhotoUrl = publicFileUrl(salonFile) || defaultImage;
    // Desktop carousel: if one photo, duplicate it in 2nd slot
    salon.mainImage = salonPhotoUrl;
    salon.image =
      salonPhotoUrl && salonPhotoUrl !== defaultImage
        ? [salonPhotoUrl, salonPhotoUrl]
        : [defaultImage];
    if (salonPhotoUrl && salonPhotoUrl !== defaultImage) {
      salon.heroImage = salonPhotoUrl;
    }

    const expertPhotoUrl =
      publicFileUrl(expertFile) ||
      (salonPhotoUrl !== defaultImage ? salonPhotoUrl : null);

    salon.isActive = true;
    salon.isDelete = false;
    salon.isClaimed = true;
    salon.claimToken = "";
    salon.source = sourceParts.join(":");
    salon.autoConfirmBookings = true;
    salon.serviceIds = serviceEntries;
    salon.salonTime = buildDefaultSalonTime({
      openTime: req.body?.openTime,
      closedTime: req.body?.closedTime,
      activeDays,
    });

    // Subscription plan chosen on step 4 (default Free)
    const requestedPlanId = String(req.body?.planId || "free")
      .toLowerCase()
      .trim();
    salon.subscription = salon.subscription || {};
    salon.subscription.planId = requestedPlanId || "free";
    salon.subscription.status = "none";

    await salon.save();

    const serviceObjectIds = serviceEntries.map((s) => s.id);
    const expert = await ensureOwnerExpert(
      salon,
      password,
      serviceObjectIds,
      expertPhotoUrl
    );

    let assignedPlanId = "free";
    try {
      const { assignPlanToSalon, getPlanByPlanId } = require("../../services/subscription.service");
      const plan = (await getPlanByPlanId(requestedPlanId)) || (await getPlanByPlanId("free"));
      const planId = plan?.planId || "free";
      const status = plan?.tier === "free" ? "active" : "trialing";
      await assignPlanToSalon(salon._id, { planId, status });
      assignedPlanId = planId;
    } catch (planErr) {
      console.warn("[SelfRegister] plan assign fallback free:", planErr.message);
      try {
        const { assignPlanToSalon } = require("../../services/subscription.service");
        await assignPlanToSalon(salon._id, { planId: "free", status: "active" });
      } catch (_) {}
    }

    console.log(
      `[SelfRegister] Salon ${salon.name} (${salon.email}) expert=${expert._id} services=${serviceObjectIds.length} plan=${assignedPlanId} source=${salon.source}`
    );

    return res.status(200).json({
      status: true,
      message: "Salon créé avec succès ! Vous pouvez vous connecter.",
      data: {
        salonId: salon._id,
        name: salon.name,
        email: salon.email,
        isActive: salon.isActive,
        isClaimed: salon.isClaimed,
        expertId: expert._id,
        servicesCount: serviceObjectIds.length,
        planId: assignedPlanId,
      },
    });
  } catch (error) {
    console.error("[SelfRegister] error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
      error: error.message || "Internal Server Error",
    });
  }
};

