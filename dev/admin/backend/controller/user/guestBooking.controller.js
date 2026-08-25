const sgMail = require("@sendgrid/mail");
const GuestOTP = require("../../models/guestOtp.model");
const User = require("../../models/user.model");
const { LOGIN_TYPE } = require("../../types/constant");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const { wrapOtpEmailHtml, otpAutofillPlainLine, otpEmailSubject } = require("../../lib/otpEmailAutofill");

const OTP_RATE_LIMIT_MS = 60 * 1000;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeMobile(mobile) {
  return String(mobile || "").trim();
}

function nameFromEmail(email) {
  const local = normalizeEmail(email).split("@")[0] || "";
  return local || "Guest";
}

function ensureSendgrid() {
  if (!process.env.SENDGRID_API_KEY) {
    return false;
  }
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  return true;
}

function sanitizeUser(userDoc) {
  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete u.password;
  return u;
}

/**
 * POST /user/guest/sendOtp
 * Body: { email, mobile }
 * Sends OTP to email; guest account uses email+mobile pair (loginType 5).
 */
exports.sendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const mobile = normalizeMobile(req.body?.mobile);

    if (!email || !email.includes("@")) {
      return res.status(200).json({ status: false, message: "Valid email is required." });
    }
    if (!mobile) {
      return res.status(200).json({ status: false, message: "Mobile number is required." });
    }

    if (!ensureSendgrid()) {
      return res.status(200).json({ status: false, message: "Email service is not configured." });
    }

    const nonGuestConflict = await User.findOne({
      isDelete: false,
      loginType: { $ne: LOGIN_TYPE.GUEST_EMAIL_OTP },
      $or: [{ email }, { mobile }],
    });

    if (nonGuestConflict) {
      if (nonGuestConflict.email === email) {
        return res.status(200).json({
          status: false,
          message: "This email is already registered. Please sign in with your existing account.",
        });
      }
      return res.status(200).json({
        status: false,
        message: "This mobile number is already used with a registered account. Please sign in.",
      });
    }

    const guestByEmail = await User.findOne({
      email,
      loginType: LOGIN_TYPE.GUEST_EMAIL_OTP,
      isDelete: false,
    });
    if (guestByEmail && guestByEmail.mobile !== mobile) {
      return res.status(200).json({
        status: false,
        message: "This email is already used for guest booking with a different phone number.",
      });
    }

    const guestByMobile = await User.findOne({
      mobile,
      loginType: LOGIN_TYPE.GUEST_EMAIL_OTP,
      isDelete: false,
    });
    if (guestByMobile && guestByMobile.email !== email) {
      return res.status(200).json({
        status: false,
        message: "This phone is already used for guest booking with a different email.",
      });
    }

    const existOTP = await GuestOTP.findOne({ email, mobile });
    if (existOTP && existOTP.updatedAt) {
      const elapsed = Date.now() - new Date(existOTP.updatedAt).getTime();
      if (elapsed < OTP_RATE_LIMIT_MS) {
        return res.status(200).json({
          status: true,
          message: "Verification code sent. Check your email.",
        });
      }
    }

    const newOtp = Math.floor(Math.random() * 900000) + 100000;

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const doc = new GuestOTP();
      doc.email = email;
      doc.mobile = mobile;
      doc.otp = newOtp;
      await doc.save();
    }

    const displayName = nameFromEmail(email);
    const html = wrapOtpEmailHtml({
      title: `Hi ${displayName}`,
      bodyHtml: `<p>Use this code to continue booking on ${process.env.projectName || "Skedisy"}:</p>
        <p style="color:#666;font-size:13px">If you did not request this, you can ignore this email.</p>`,
      code: String(newOtp),
    });

    const codeStr = String(newOtp);
    await sgMail.send({
      to: email,
      from: process.env.EMAIL,
      subject: otpEmailSubject(codeStr),
      text: otpAutofillPlainLine(codeStr),
      html,
    });

    return res.status(200).json({
      status: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("[guest/sendOtp]", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * POST /user/guest/verify
 * Body: { email, mobile, otp, fcmToken? }
 */
exports.verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const mobile = normalizeMobile(req.body?.mobile);
    const otpRaw = req.body?.otp;
    const fcmToken = req.body?.fcmToken;

    if (!email || !mobile || otpRaw === undefined || otpRaw === null || otpRaw === "") {
      return res.status(200).json({ status: false, message: "Email, mobile, and OTP are required." });
    }

    const otp = parseInt(String(otpRaw).trim(), 10);
    if (Number.isNaN(otp)) {
      return res.status(200).json({ status: false, message: "Invalid OTP." });
    }

    const row = await GuestOTP.findOne({ email, mobile });
    if (!row) {
      return res.status(200).json({ status: false, message: "No verification pending. Request a new code." });
    }

    if (row.otp !== otp) {
      return res.status(200).json({ status: false, message: "Invalid verification code." });
    }

    await GuestOTP.deleteOne({ _id: row._id });

    const nonGuestConflict = await User.findOne({
      isDelete: false,
      loginType: { $ne: LOGIN_TYPE.GUEST_EMAIL_OTP },
      $or: [{ email }, { mobile }],
    });

    if (nonGuestConflict) {
      return res.status(200).json({
        status: false,
        message: "This email or phone is linked to a full account. Please use Sign In.",
      });
    }

    const guestByEmail = await User.findOne({
      email,
      loginType: LOGIN_TYPE.GUEST_EMAIL_OTP,
      isDelete: false,
    });
    if (guestByEmail && guestByEmail.mobile !== mobile) {
      return res.status(200).json({
        status: false,
        message: "This email is already used for guest booking with a different phone number.",
      });
    }

    const guestByMobile = await User.findOne({
      mobile,
      loginType: LOGIN_TYPE.GUEST_EMAIL_OTP,
      isDelete: false,
    });
    if (guestByMobile && guestByMobile.email !== email) {
      return res.status(200).json({
        status: false,
        message: "This phone is already used for guest booking with a different email.",
      });
    }

    let user = await User.findOne({
      email,
      mobile,
      loginType: LOGIN_TYPE.GUEST_EMAIL_OTP,
      isDelete: false,
    });

    let signup = false;
    const fname = nameFromEmail(email);

    if (user) {
      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin." });
      }
      if (fcmToken) user.fcmToken = fcmToken;
      user.analyticDate = new Date().toLocaleString();
      if (!user.fname) user.fname = fname;
      await user.save();
    } else {
      signup = true;
      user = new User();
      user.uniqueId = Math.floor(Math.random() * 1000000 + 999999);
      user.fname = fname;
      user.lname = "";
      user.email = email;
      user.mobile = mobile;
      user.loginType = LOGIN_TYPE.GUEST_EMAIL_OTP;
      user.password = undefined;
      user.image = `${process?.env?.baseURL}storage/male.png`;
      user.identity = await generateUniqueIdentifier();
      user.fcmToken = fcmToken || null;
      user.analyticDate = new Date().toLocaleString();
      await user.save();
    }

    return res.status(200).json({
      status: true,
      message: signup ? "Account ready. You can continue booking." : "Welcome back.",
      user: sanitizeUser(user),
      signup,
    });
  } catch (error) {
    console.error("[guest/verifyOtp]", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
