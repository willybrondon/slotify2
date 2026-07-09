const OTP = require("../../models/otp.model");



//import model
const User = require("../../models/user.model");

const sgMail = require('@sendgrid/mail');
const { wrapOtpEmailHtml } = require("../../lib/otpEmailAutofill");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Rate limit: 60 seconds between OTP emails per email address
const OTP_RATE_LIMIT_MS = 60 * 1000;

//create OTP and send the email for password security
exports.store = async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "Email must be required!!" });
    }

    const [userEmail, existOTP] = await Promise.all([
      User.findOne({ email: req.query.email }),
      OTP.findOne({ email: req.query.email })
    ]);

    if (!userEmail) {
      return res.status(200).json({ status: false, message: "User does not found with that email." });
    }

    // Rate limit: if OTP was sent recently, return success without sending again
    if (existOTP && existOTP.updatedAt) {
      const elapsed = Date.now() - new Date(existOTP.updatedAt).getTime();
      if (elapsed < OTP_RATE_LIMIT_MS) {
        return res.status(200).json({ status: true, message: "Email Send Successfully for Password Security." });
      }
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();
      otp.email = req.query.email;
      otp.otp = newOtp;
      await otp.save();
    }

    var tab = wrapOtpEmailHtml({
      title: `Hi, Mr./Ms. ${userEmail.fname}`,
      bodyHtml: `<p>Thank you for choosing ${process.env.projectName}. Use the following code to reset your password:</p>`,
      code: String(newOtp),
    });

    const msg = {
      to: req.query.email,
      from: process.env.EMAIL,
      subject: `Sending Email from ${process.env.projectName} for Password Security`,
      html: tab,
    };

    try {
      await sgMail.send(msg);
      return res.status(200).json({ status: true, message: "Email Send Successfully for Password Security." });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ status: false, error: error.message || "Email send error" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//create otp when user login with email-password
exports.otplogin = async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "Email must be required." });
    }

    const existOTP = await OTP.findOne({ email: req.query.email });
    // Rate limit: if OTP was sent recently, return success without sending again
    if (existOTP && existOTP.updatedAt) {
      const elapsed = Date.now() - new Date(existOTP.updatedAt).getTime();
      if (elapsed < OTP_RATE_LIMIT_MS) {
        return res.status(200).json({ status: true, message: "Email Send Successfully to User!" });
      }
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;
    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();
      otp.email = req.query.email;
      otp.otp = newOtp;
      await otp.save();
    }

    var tab = wrapOtpEmailHtml({
      bodyHtml: `<p>Please use the following One-Time Password (OTP) to complete the verification process:</p>
        <p style="color:#666;font-size:14px">This code is valid for a limited time.</p>`,
      code: String(newOtp),
    });

    const msg = {
      to: req.query.email,
      from: process.env.EMAIL,
      subject: `Sending Email from ${process.env.projectName}`,
      html: tab,
    };

    try {
      await sgMail.send(msg);
      return res.status(200).json({ status: true, message: "Email Send Successfully to User!" });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ status: false, error: error.message || "Email Send Error" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//verify the OTP
exports.verify = async (req, res) => {
  try {
    if (!req.query.email || !req.query.otp) {
      return res.status(200).json({ status: false, message: "OTP and email must be required." });
    }

    const otpUser = await OTP.findOne({ email: req.query.email });
    if (!otpUser) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (parseInt(req.query.otp) === otpUser.otp) {
      await otpUser.deleteOne();

      return res.status(200).json({ status: true, message: "OTP Verified Successfully!" });
    } else {
      return res.status(200).json({ status: false, message: "OTP does not matched!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
