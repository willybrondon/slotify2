require("dotenv").config();

// Set default baseURL if not provided in environment
if (!process.env.baseURL) {
  process.env.baseURL = "https://skedisy.com";
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const moment = require("moment");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

require("./middleware/mongodb");
const fs = require("fs");

var logger = require("morgan");
app.use(express.json());
app.use(cors());
app.use(logger("dev"));

const cron = require("node-cron");
const Salon = require("./models/salon.model");
const Expert = require("./models/expert.model");
const Booking = require("./models/booking.model");
const SalonSettlement = require("./models/salonSettlement.model");
const ExpertSettlement = require("./models/expertSettlement.model");
const Attendance = require("./models/attendance.model");
const Setting = require("./models/setting.model");
const User = require("./models/user.model");
const { sendAppointmentReminder } = require("./services/sms.service");


const settingJson = require("./setting");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      global.settingJSON = setting;
    } else {
      global.settingJSON = settingJson;
    }
    console.log("Settings initialized successfully");
  } catch (error) {
    console.error("Failed to initialize settings:", error);
    // Use default settings if database query fails
    global.settingJSON = settingJson;
  }
}

// Initialize settings (don't block server startup)
initializeSettings().catch((error) => {
  console.error("Critical error initializing settings:", error);
  global.settingJSON = settingJson; // Fallback to default
});

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

// Resolve salonportal path first (works for both dev: ../salonportal and prod: backend/salonportal)
const salonportalPath = fs.existsSync(path.join(__dirname, "salonportal", "index.html"))
  ? path.join(__dirname, "salonportal")
  : path.join(__dirname, "..", "salonportal");

const indexRoute = require("./route/index");
const bookingAdminEmailController = require("./controller/user/bookingAdminEmail.controller");

// Public booking action from admin email (no secret key) — register before /user router
app.get("/user/booking/public/email-action", bookingAdminEmailController.handleEmailAction);

app.use(indexRoute);

// Docs — /docs/ and /docs must serve the same content as /docs/index.html (cucumber-style docs folder)
app.get("/docs", (req, res) => res.redirect(301, "/docs/"));
app.get("/docs/", (req, res) => {
  const docsIndex = path.join(salonportalPath, "docs", "index.html");
  const docHtml = path.join(salonportalPath, "documentation.html");
  const filePath = fs.existsSync(docsIndex) ? docsIndex : docHtml;
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(path.resolve(filePath));
  } else {
    res.status(404).send(`<h1>404 - Documentation not found</h1><p><a href="/">Return to Skedisy</a></p>`);
  }
});
// Pages légales — servir le fichier directement (évite boucle /cookies/ ↔ /cookies.html avec nginx/static)
const serveSalonportalLegalPage = (indexRelPath, flatRelPath) => (req, res) => {
  const indexPath = path.join(salonportalPath, indexRelPath);
  const flatPath = path.join(salonportalPath, flatRelPath);
  const filePath = fs.existsSync(indexPath)
    ? indexPath
    : fs.existsSync(flatPath)
      ? flatPath
      : null;
  if (!filePath) {
    return res.status(404).send(`<h1>404 - Page not found</h1><p><a href="/">Retour à Skedisy</a></p>`);
  }
  res.status(200).sendFile(path.resolve(filePath));
};

const serveTermsPage = serveSalonportalLegalPage("terms/index.html", "terms.html");
const servePrivacyPage = serveSalonportalLegalPage("privacy/index.html", "privacy.html");
const serveCookiesPage = serveSalonportalLegalPage("cookies/index.html", "cookies.html");

app.get(["/terms", "/terms/", "/terms.html"], serveTermsPage);
app.get(["/privacy", "/privacy/", "/privacy.html"], servePrivacyPage);
app.get(["/cookies", "/cookies/", "/cookies.html"], serveCookiesPage);
// Serve documentation.html directly (no redirect) - was working before
app.get("/documentation.html", (req, res) => {
  const filePath = path.join(salonportalPath, "documentation.html");
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(path.resolve(filePath));
  } else {
    res.status(404).send(`<h1>404 - Documentation not found</h1><p><a href="/">Return to Skedisy</a></p>`);
  }
});
app.get(["/blog", "/blog/", "/blog.html"], (req, res) => {
  const filePath = path.join(salonportalPath, "blog", "index.html");
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(path.resolve(filePath));
  } else {
    res.status(404).send(`<h1>404 - Blog not found</h1><p><a href="/">Return to Skedisy</a></p>`);
  }
});

// Public web route for salon claim page
app.get("/salon/claim", (req, res) => {
  const filePath = path.join(__dirname, "public", "salon-claim.html");
  
  // Check if file exists, if not serve inline HTML
  if (!fs.existsSync(filePath)) {
    console.warn(`[Salon Claim] File not found at ${filePath}, serving inline HTML`);
    // Serve the HTML inline as fallback
    return res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réclamer votre salon - Skedisy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #667eea; font-size: 32px; margin-bottom: 10px; }
        .logo p { color: #666; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 600; font-size: 14px; }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus { outline: none; border-color: #667eea; }
        .error { background: #fee; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; display: none; }
        .success { background: #efe; color: #3c3; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; display: none; }
        .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
        .btn:active { transform: translateY(0); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .loading { display: none; text-align: center; margin-top: 20px; }
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .info { background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #555; }
        .info strong { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🎉 Bienvenue sur Skedisy</h1>
            <p>Réclamez votre profil salon</p>
        </div>
        <div class="error" id="error"></div>
        <div class="success" id="success"></div>
        <div class="info">
            <strong>Votre salon a été ajouté sur Skedisy!</strong><br>
            Créez un mot de passe pour réclamer votre profil et commencer à gérer vos réservations en ligne.
        </div>
        <form id="claimForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required readonly>
            </div>
            <div class="form-group">
                <label for="password">Nouveau mot de passe</label>
                <input type="password" id="password" name="password" required minlength="6" placeholder="Minimum 6 caractères">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6" placeholder="Répétez le mot de passe">
            </div>
            <button type="submit" class="btn" id="submitBtn">Réclamer mon profil</button>
        </form>
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p style="margin-top: 10px; color: #666;">Traitement en cours...</p>
        </div>
    </div>
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        if (!token || !email) {
            document.getElementById('error').textContent = 'Lien invalide. Veuillez utiliser le lien fourni dans votre email.';
            document.getElementById('error').style.display = 'block';
            document.getElementById('claimForm').style.display = 'none';
        } else {
            document.getElementById('email').value = decodeURIComponent(email);
        }
        document.getElementById('claimForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                document.getElementById('error').textContent = 'Les mots de passe ne correspondent pas.';
                document.getElementById('error').style.display = 'block';
                return;
            }
            if (password.length < 6) {
                document.getElementById('error').textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
                document.getElementById('error').style.display = 'block';
                return;
            }
            document.getElementById('error').style.display = 'none';
            document.getElementById('success').style.display = 'none';
            document.getElementById('claimForm').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
            try {
                const baseURL = window.location.origin;
                const apiURL = \`\${baseURL}/salon/claim\`;
                console.log('[Claim Form] Attempting to claim salon...');
                console.log('[Claim Form] API URL:', apiURL);
                console.log('[Claim Form] Token:', token ? token.substring(0, 10) + '...' : 'missing');
                console.log('[Claim Form] Email:', decodeURIComponent(email));
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token, email: decodeURIComponent(email), password: password })
                });
                const data = await response.json();
                if (data.status === true) {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('success').textContent = '✅ Profil réclamé avec succès! Vous pouvez maintenant vous connecter.';
                    document.getElementById('success').style.display = 'block';
                    setTimeout(() => { window.location.href = '/salonpanel/login'; }, 3000);
                } else {
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('error').textContent = data.message || 'Une erreur est survenue. Veuillez réessayer.';
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('claimForm').style.display = 'block';
                }
            } catch (error) {
                console.error('[Claim Form] Fetch error:', error);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').textContent = 'Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.';
                document.getElementById('error').style.display = 'block';
                document.getElementById('claimForm').style.display = 'block';
            }
        });
    </script>
</body>
</html>
    `);
  }
  
  res.sendFile(filePath);
});

// Public web route for salon pages (for sharing and deep linking)
// New format: /salon/slug-shortId (e.g., /salon/coiffure-beaute-brasil-6885e2)
const salonController = require("./controller/user/salon.controller");
app.get("/salon/:slugWithId", salonController.serveSalonWebPage);

// Public web route for category pages
// New format: /category/category-name-shortId (e.g., /category/body-care-spa-68af94)
const categoryController = require("./controller/user/category.controller");
app.get("/category/:slugWithId", categoryController.serveCategoryPage);

// Public web route for service pages
// New format: /service/service-name-shortId (e.g., /service/facial-treatment-6842cd)
const serviceController = require("./controller/user/service.controller");
app.get("/service/:slugWithId", serviceController.serveServicePage);

// Public API endpoint for categories (for frontend)
app.get("/api/public/categories", async (req, res) => {
  try {
    const Category = require("./models/category.model");
    const language = req.query.language || 'fr'; // Get language from query, default to French
    
    const categories = await Category.find({ isDelete: false, status: true })
      .select("name nameEn nameFr namePt image _id")
      .sort({ createdAt: -1 });
    
    // Map categories with translated names based on language
    const translatedCategories = categories.map(category => {
      let translatedName = category.name; // Default fallback
      
      if (language === 'en' && category.nameEn) {
        translatedName = category.nameEn;
      } else if (language === 'fr' && category.nameFr) {
        translatedName = category.nameFr;
      } else if (language === 'pt' && category.namePt) {
        translatedName = category.namePt;
      } else if (category.name) {
        translatedName = category.name;
      }
      
      return {
        _id: category._id,
        name: translatedName,
        image: category.image,
      };
    });
    
    return res.json({
      status: true,
      data: translatedCategories,
    });
  } catch (error) {
    console.error("[Public Categories] Error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
});

// Public API endpoint for salons by category (for category page)
app.get("/api/public/salons-by-category", categoryController.getSalonsByCategory);
app.get("/api/public/experts-by-category", categoryController.getExpertsByCategory);

const publicWebBooking = require("./controller/user/publicWebBooking.controller");
app.get("/api/public/booking/slots", publicWebBooking.publicCheckSlots);
app.get("/api/public/booking/experts", publicWebBooking.publicExpertsForService);
app.post("/api/public/guest/send-otp", publicWebBooking.publicGuestSendOtp);
app.post("/api/public/guest/verify-otp", publicWebBooking.publicGuestVerifyOtp);
app.get("/api/public/booking/payment-settings", publicWebBooking.publicPaymentSettings);
app.get("/api/public/booking/coupons", publicWebBooking.publicListCoupons);
app.post("/api/public/booking/validate-coupon", publicWebBooking.publicValidateCoupon);
app.post("/api/public/booking/stripe-intent", publicWebBooking.publicCreateStripePaymentIntent);
app.post("/api/public/booking/create", publicWebBooking.publicCreateBooking);
app.get("/api/public/booking/cancel", publicWebBooking.publicCancelBooking);

const publicClientAuth = require("./controller/user/publicClientAuth.controller");
app.get("/compte/connexion", publicClientAuth.serveLoginPage);
app.get("/compte/inscription", publicClientAuth.serveSignupPage);
app.post("/api/public/auth/login", publicClientAuth.publicLogin);
app.post("/api/public/auth/register", publicClientAuth.publicRegister);

// SEO: Sitemap and Robots.txt
const sitemapController = require("./controller/user/sitemap.controller");
app.get("/sitemap.xml", sitemapController.generateSitemap);
app.get("/robots.txt", sitemapController.generateRobots);

// Serve .well-known files for App Links verification (must be before other static routes)
app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "public", ".well-known", "assetlinks.json");
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    console.warn(`[App Links] File not found: ${filePath} - This is not critical, app links will still work`);
    res.status(404).json({ error: "File not found" });
  }
});

app.get("/.well-known/apple-app-site-association", (req, res) => {
  const filePath = path.join(__dirname, "public", ".well-known", "apple-app-site-association");
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    console.warn(`[App Links] File not found: ${filePath} - This is not critical, app links will still work`);
    res.status(404).json({ error: "File not found" });
  }
});

async function updateAttendance(expertId, action) {
  try {
    const todayDate = moment().format("YYYY-MM-DD");

    let attendanceRecord = await Attendance.findOne({
      expertId,
      month: moment().format("YYYY-MM"),
    }).populate("expertId");

    let savedAttendance;

    if (!attendanceRecord) {
      attendanceRecord = new Attendance();
      attendanceRecord.expertId = expertId;
      attendanceRecord.month = moment().format("YYYY-MM");
    }

    const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
    const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

    if (action === "attend") {
      if (dateIndex !== -1) {
        console.log(`Attendance for today has already been marked for ${expertId}`);
        return;
      }

      if (absentIndex !== -1) {
        attendanceRecord.absentCount -= 1;
        attendanceRecord.absentDates.splice(absentIndex, 1);
      }

      attendanceRecord.attendCount += 1;
      attendanceRecord.attendDates.push(todayDate);
    } else if (action === "absent") {
      if (absentIndex !== -1 || dateIndex !== -1) {
        console.log(`Attendance for today has already been marked for ${expertId}`);
        return;
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays = attendanceRecord.attendCount + attendanceRecord.absentCount;

    const expert = await Expert.findById(expertId);
    await expert.save();

    attendanceRecord.salonId = expert.salonId;
    savedAttendance = await attendanceRecord.save();

    console.log(`${action === "attend" ? "Attendance" : "Absent"} marked successfully for ${expertId}`);
  } catch (error) {
    console.log("error", error);
  }
}

// Expert who are not attend are count as absent for the day
cron.schedule("55 23 * * *", async () => {
  try {
    const allExperts = await Expert.find({ isDelete: false });

    for (const expert of allExperts) {
      const expertId = expert._id;
      await updateAttendance(expertId, "absent");
    }

    const expert = await Expert.updateMany({ isDelete: false }, { isAttend: false, showDialog: false });

    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Booking cancel
cron.schedule("55 23 * * *", async () => {
  try {
    const todayDate = moment().format("YYYY-MM-DD");
    console.log("todayDate", todayDate);

    const bookingsToUpdate = await Booking.find({
      status: { $in: ["pending", "confirm"] },
      date: todayDate,
    });

    for (const booking of bookingsToUpdate) {
      booking.status = "cancel";
      booking.cancel.reason = "autoCancel by system";
      booking.cancel.person = "admin";
      booking.cancel.time = moment().format("HH:mm a");
      booking.cancel.date = moment().format("YYYY-MM-DD");
      await booking.save();
    }

    console.log(`${bookingsToUpdate.length} bookings updated successfully.`);
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});

// Define a cron job to run monthly
cron.schedule("55 23 28-31 * *", async () => {
  try {
    const salons = await Salon.find();
    const today = moment().format("YYYY-MM-DD");

    for (const salon of salons) {
      const completedBookings = await Booking.find({
        salonId: salon._id,
        status: "completed",
        isSettle: false,
        isDelete: false,
      });

      let salonEarning = 0;
      let salonCommission = 0;

      for (const booking of completedBookings) {
        salonEarning += booking.salonEarning;
        salonCommission += booking.salonCommission;

        await SalonSettlement.findOneAndUpdate(
          { salonId: salon._id },
          {
            salonId: salon._id,
            $addToSet: { bookingId: booking._id },
            salonEarning,
            salonCommission,
            salonCommissionPercent: booking.platformFeePercent,
            finalAmount: salonEarning,
            date: today,
          },
          { upsert: true }
        );
      }
    }

    const experts = await Expert.find({ isDelete: false });
    for (const expert of experts) {
      const completedBookings = await Booking.find({
        expertId: expert._id,
        status: "completed",
        isSettle: false,
        isDelete: false,
      });

      let expertEarning = 0;
      for (const booking of completedBookings) {
        expertEarning += booking.expertEarning;

        await ExpertSettlement.findOneAndUpdate(
          { expertId: expert._id },
          {
            salonId: expert.salonId,
            $addToSet: { bookingId: booking._id },
            expertEarning: expertEarning,
            finalAmount: expertEarning,
            date: today,
          },
          { upsert: true }
        );

        await Booking.findByIdAndUpdate(booking._id, { isSettle: true });
      }
    }

    console.log("Monthly settlement completed successfully.");
  } catch (error) {
    console.error("Error occurred during monthly settlement:", error);
  }
});

// SMS Reminder: Send 24-hour appointment reminders
// Runs every hour at minute 0 to check for appointments 24 hours from now
cron.schedule("0 * * * *", async () => {
  try {
    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log("[SMS Cron] 24h reminder job skipped - Twilio not configured");
      return;
    }

    const now = moment();
    const tomorrow = moment().add(24, "hours");
    const tomorrowDate = tomorrow.format("YYYY-MM-DD");

    const bookings = await Booking.find({
      date: tomorrowDate,
      status: { $in: ["pending", "confirm"] },
      smsReminder24hSent: false,
      isDelete: false,
    })
      .populate("userId", "fname lname mobile")
      .populate("salonId", "name")
      .populate("expertId", "fname lname");

    console.log(`[SMS Cron] Found ${bookings.length} bookings for 24-hour SMS reminders on ${tomorrowDate}`);

    for (const booking of bookings) {
      try {
        // Calculate appointment datetime
        const bookingStartTime = booking.startTime || booking.time[0] || "";
        if (!bookingStartTime) {
          console.log(`Skipping booking ${booking.bookingId} - no start time`);
          continue;
        }

        // Parse booking datetime
        const bookingDateTime = moment(`${booking.date} ${bookingStartTime}`, ["YYYY-MM-DD hh:mm A", "YYYY-MM-DD HH:mm A", "YYYY-MM-DD HH:mm", "YYYY-MM-DD hh:mm"]);
        
        // Check if appointment is approximately 24 hours away (within 1 hour window)
        const hoursUntilAppointment = bookingDateTime.diff(now, "hours", true);
        
        if (hoursUntilAppointment >= 23 && hoursUntilAppointment <= 25) {
          // Skip if user is blocked or doesn't have mobile
          if (booking.userId && booking.userId.mobile && booking.userId.mobile.trim() !== "") {
            const result = await sendAppointmentReminder(booking, "24h");

            if (result.success) {
              booking.smsReminder24hSent = true;
              await booking.save();
              console.log(`24h SMS reminder sent successfully for booking ${booking.bookingId}`);
            } else {
              console.error(`Failed to send 24h SMS reminder for booking ${booking.bookingId}:`, result.error);
            }
          } else {
            console.log(`Skipping booking ${booking.bookingId} - user has no mobile number`);
          }
        }
      } catch (error) {
        console.error(`Error processing 24h SMS reminder for booking ${booking.bookingId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error executing 24-hour SMS reminder cron job:", error);
  }
});

// SMS Reminder: Send 2-hour appointment reminders
// Runs every 15 minutes to check for appointments 2 hours from now
cron.schedule("*/15 * * * *", async () => {
  try {
    // Check Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log("[SMS Cron] 2h reminder job skipped - Twilio not configured");
      return;
    }

    const twoHoursLater = moment().add(2, "hours");
    const targetDate = twoHoursLater.format("YYYY-MM-DD");
    const targetTime = twoHoursLater.format("HH:mm");

    // Find bookings that are approximately 2 hours away
    const bookings = await Booking.find({
      date: targetDate,
      status: { $in: ["pending", "confirm"] },
      smsReminder2hSent: false,
      isDelete: false,
    })
      .populate("userId", "fname lname mobile")
      .populate("salonId", "name")
      .populate("expertId", "fname lname");

    // Filter bookings where the start time is close to 2 hours from now
    const filteredBookings = bookings.filter((booking) => {
      const bookingStartTime = booking.startTime || booking.time[0] || "";
      if (!bookingStartTime) return false;

      // Parse booking time (format: "HH:mm A" or "HH:mm")
      const bookingTime = moment(bookingStartTime, ["hh:mm A", "HH:mm A", "HH:mm", "hh:mm"]);
      const currentTime = moment(targetTime, "HH:mm");

      // Check if booking time is within 15 minutes of target time (2 hours from now)
      const timeDiff = Math.abs(bookingTime.diff(currentTime, "minutes"));
      return timeDiff <= 15;
    });

    console.log(`[SMS Cron] Found ${filteredBookings.length} bookings for 2-hour SMS reminders on ${targetDate}`);

    for (const booking of filteredBookings) {
      try {
        // Skip if user is blocked or doesn't have mobile
        if (booking.userId && booking.userId.mobile && booking.userId.mobile.trim() !== "") {
          const result = await sendAppointmentReminder(booking, "2h");

          if (result.success) {
            booking.smsReminder2hSent = true;
            await booking.save();
            console.log(`2h SMS reminder sent successfully for booking ${booking.bookingId}`);
          } else {
            console.error(`Failed to send 2h SMS reminder for booking ${booking.bookingId}:`, result.error);
          }
        } else {
          console.log(`Skipping booking ${booking.bookingId} - user has no mobile number`);
        }
      } catch (error) {
        console.error(`Error processing 2h SMS reminder for booking ${booking.bookingId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error executing 2-hour SMS reminder cron job:", error);
  }
});

app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use("/salonpanel/storage", express.static(path.join(__dirname, "storage")));

// Demo request email endpoint
app.post("/api/send-demo-request", express.json(), async (req, res) => {
  const { name, phone, email, salonType } = req.body;
  if (!name || !phone || !email) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.DEMO_MAIL_USER || "your_email@gmail.com",
        pass: process.env.DEMO_MAIL_PASS || "your_email_password",
      },
    });

    await transporter.sendMail({
      from: process.env.DEMO_MAIL_USER || "your_email@gmail.com",
      to: "support@skedisy.com",
      subject: "New Salon Demo Request",
      text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nSalon Type: ${salonType || ""}`,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Serve static files for admin dashboard at /admin/ path
app.use("/admin", express.static(path.join(__dirname, "public")));
// Direct route for admin dashboard (exact /admin path)
app.get("/admin", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});
// Direct route for admin dashboard (all /admin/* paths)
app.get("/admin/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve static files for salonportal at /salonportal/ path (backward compatibility)
app.use("/salonportal", express.static(salonportalPath));
// Direct route for salonportal index.html (backward compatibility)
app.get("/salonportal/*", function (req, res) {
  res.status(200).sendFile(path.join(salonportalPath, "index.html"));
});

// Runtime config for salon panel (API key + base URL) — must be before static /salonpanel
app.get("/salonpanel/runtime-config.js", (req, res) => {
  const host = req.get("host") || "skedisy.com";
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  const apiBase = `${proto}://${host}/`;
  const apiKey = process.env.secretKey || "";
  res.type("application/javascript");
  res.set("Cache-Control", "no-store");
  res.send(
    `window.__SKEDISY_SALON__=${JSON.stringify({ apiBase, apiKey })};`
  );
});

// Serve static files for salon panel at /salonpanel/ path
const salonPath = path.join(__dirname, "salon");
const salonIndexPath = path.join(salonPath, "index.html");

if (fs.existsSync(salonIndexPath)) {
  // Salon panel is built and deployed
  app.use("/salonpanel", express.static(salonPath));
  app.use("/salonPanel", express.static(salonPath)); // Handle /salonPanel/ (capital P)
  app.use("/SalonPanel", express.static(salonPath)); // Handle /SalonPanel/ (both capital)
  
  // Direct route for salon panel (all case variations)
  app.get("/salonpanel/*", function (req, res) {
    res.status(200).sendFile(salonIndexPath);
  });
  app.get("/salonPanel/*", function (req, res) {
    res.status(200).sendFile(salonIndexPath);
  });
  app.get("/SalonPanel/*", function (req, res) {
    res.status(200).sendFile(salonIndexPath);
  });
} else {
  // Salon panel not built - show helpful error message
  console.warn(`[Salon Panel] Salon panel not found at ${salonIndexPath}. Please build and deploy the salon frontend.`);
  
  // Handle all case variations with error message
  const handleSalonPanelError = function (req, res) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Salon Panel Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 50px; text-align: center; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; }
            code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            pre { background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Salon Panel Not Configured</h1>
            <p>The salon panel frontend has not been built and deployed.</p>
            <p><strong>Expected location:</strong> <code>${salonIndexPath}</code></p>
            <p>To fix this, run the following commands on your server:</p>
            <pre>cd /home/admin/salon
npm install
npm run build
mkdir -p ${salonPath}
cp -r build/* ${salonPath}/</pre>
            <p>Or use the installation script which should handle this automatically.</p>
          </div>
        </body>
      </html>
    `);
  };
  
  app.get("/salonpanel/*", handleSalonPanelError);
  app.get("/salonPanel/*", handleSalonPanelError);
  app.get("/SalonPanel/*", handleSalonPanelError);
}



// Serve static files for salonportal at root path (main page) - MUST BE LAST
app.use("/", express.static(salonportalPath));
// Direct route for salonportal as main page - MUST BE LAST
app.get("/", function (req, res) {
  res.status(200).sendFile(path.join(salonportalPath, "index.html"));
});

app.listen(port, () => {
  console.log(`magic happen on ${port}`);
  
  // Check SMS/Twilio configuration on startup
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    console.log("[SMS Service] ✓ Twilio SMS service is configured and ready");
    console.log(`[SMS Service] Phone Number: ${process.env.TWILIO_PHONE_NUMBER}`);
  } else {
    console.warn("[SMS Service] ⚠ WARNING: Twilio SMS service is NOT configured");
    console.warn("[SMS Service] SMS reminders will not be sent. Please configure:");
    console.warn("[SMS Service]   - TWILIO_ACCOUNT_SID");
    console.warn("[SMS Service]   - TWILIO_AUTH_TOKEN");
    console.warn("[SMS Service]   - TWILIO_PHONE_NUMBER");
  }
  
  // Check Gemini AI configuration on startup (same pattern as Twilio)
  if (process.env.GEMINI_API_KEY) {
    console.log("[AI Service] ✓ Gemini API is configured and ready");
  } else {
    console.warn("[AI Service] ⚠ WARNING: Gemini API is NOT configured");
    console.warn("[AI Service] AI concierge features will not work. Please configure:");
    console.warn("[AI Service]   - GEMINI_API_KEY (get free key from https://aistudio.google.com/app/apikey)");
  }
  
  // Check Ollama (optional - only needed as fallback)
  if (process.env.OLLAMA_HOST) {
    console.log("[AI Service] ℹ Ollama is configured (optional fallback)");
  } else {
    console.log("[AI Service] ℹ Ollama not configured (optional - only needed if you want local AI fallback)");
  }
});
