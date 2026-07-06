const Service = require("../../models/service.model");
const Booking = require("../../models/booking.model");
const Expert = require("../../models/expert.model");
const Salon = require("../../models/salon.model");
const BusyExpert = require("../../models/busyExpert.model");
const User = require("../../models/user.model");
const Holiday = require("../../models/salonClose.model");
const Notification = require("../../models/notification.model");
const UString = require("../../models/uniqueString.model");
const UserWalletHistory = require("../../models/userWalletHistory.model");
const SalonExpertWalletHistory = require("../../models/salonExpertWalletHistory.model");
const SalonWalletHistory = require("../../models/salonWalletHistory.model");
const Coupon = require("../../models/coupon.model");
const Setting = require("../../models/setting.model");
const { SALON_EXPERT_WALLET_TYPE, USER_WALLET_TYPE } = require("../../types/constant");
const { sendSMS } = require("../../services/sms.service");
const sgMail = require("@sendgrid/mail");

const mongoose = require("mongoose");

const admin = require("../../firebase");
const moment = require("moment");
const { generateUniqueIdentifier } = require("../../generateUniqueIdentifier");
const { sendAdminNewBookingEmail, sendAdminCustomerCancelledBookingEmail } = require("../../services/bookingAdminEmail.service");

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Language helper functions for localized messages
const getLanguage = (req) => {
  return req.body?.language || req.query?.language || 'en';
};

const getLocalizedMessages = (language = 'en') => {
  const lang = language.toLowerCase() === 'fr' ? 'fr' : 'en';
  
  return {
    // Customer messages - Salon insufficient wallet
    salonCannotAcceptBooking: {
      en: "The salon cannot accept the booking for now. Please retry later.",
      fr: "Le salon ne peut pas accepter la réservation pour le moment. Veuillez réessayer plus tard."
    },
    
    // Customer messages - Customer insufficient wallet
    customerInsufficientWallet: {
      en: "You cannot book because you don't have enough money in your wallet for booking. Please recharge your wallet to continue.",
      fr: "Vous ne pouvez pas réserver car vous n'avez pas assez d'argent dans votre portefeuille pour la réservation. Veuillez recharger votre portefeuille pour continuer."
    },
    // Customer SMS - ultra-short for 1 segment (GSM-7: 153 chars max)
    customerInsufficientWalletSMS: {
      en: "Wallet low. Recharge to book. skedisy.com Skedisy",
      fr: "Portefeuille bas. Rechargez pour reserver. skedisy.com Skedisy"
    },
    
    // Salon owner SMS - Ultra-short for 1 segment (GSM-7: 153 chars max)
    salonOwnerSMSAlert: {
      en: "Wallet low {salonName}. {currencySymbol}{currentBalance}/{currencySymbol}{requiredBalance}. Recharge: skedisy.com Skedisy",
      fr: "Portefeuille bas {salonName}. {currencySymbol}{currentBalance}/{currencySymbol}{requiredBalance}. Rechargez: skedisy.com Skedisy"
    },
    
    // Salon owner Email - Subject
    salonOwnerEmailSubject: {
      en: "⚠️ Alert: Insufficient Wallet Balance - {salonName}",
      fr: "⚠️ Alerte: Solde de portefeuille insuffisant - {salonName}"
    },
    
    // Salon owner Email - Content
    salonOwnerEmailTitle: {
      en: "⚠️ Alert: Insufficient Wallet Balance",
      fr: "⚠️ Alerte: Solde de Portefeuille Insuffisant"
    },
    
    salonOwnerEmailGreeting: {
      en: "Dear Salon Owner,",
      fr: "Cher propriétaire de salon,"
    },
    
    salonOwnerEmailMessage: {
      en: "Someone tried to book a service at your salon <strong>\"{salonName}\"</strong> but your salon cannot currently accept new bookings because your wallet balance is insufficient.",
      fr: "Quelqu'un a essayé de réserver un service dans votre salon <strong>\"{salonName}\"</strong> mais votre salon ne peut actuellement pas accepter de nouvelles réservations car votre solde de portefeuille est insuffisant."
    },
    
    salonOwnerEmailBalanceDetails: {
      en: "Balance Details:",
      fr: "Détails du solde:"
    },
    
    salonOwnerEmailCurrentBalance: {
      en: "Current Balance:",
      fr: "Solde actuel:"
    },
    
    salonOwnerEmailRequiredBalance: {
      en: "Required Balance:",
      fr: "Solde requis:"
    },
    
    salonOwnerEmailDeficit: {
      en: "Deficit:",
      fr: "Déficit:"
    },
    
    salonOwnerEmailRechargeMessage: {
      en: "To continue accepting bookings, please recharge your wallet from your salon dashboard.",
      fr: "Pour continuer à accepter des réservations, veuillez recharger votre portefeuille depuis votre tableau de bord salon."
    },
    
    salonOwnerEmailRechargeButton: {
      en: "Recharge My Wallet",
      fr: "Recharger mon portefeuille"
    },
    
    salonOwnerEmailNeedHelp: {
      en: "Need Help?",
      fr: "Besoin d'aide?"
    },
    
    salonOwnerEmailWebsite: {
      en: "Website:",
      fr: "Site web:"
    },
    
    salonOwnerEmailEmail: {
      en: "Email:",
      fr: "Email:"
    },
    
    salonOwnerEmailPhone: {
      en: "Phone:",
      fr: "Téléphone:"
    },
    
    salonOwnerEmailFooter: {
      en: "Best regards,<br>Skedisy Team",
      fr: "Cordialement,<br>L'équipe Skedisy"
    },
    
    // Customer Email - Subject
    customerEmailSubject: {
      en: "Booking Alert - Insufficient Wallet Balance",
      fr: "Alerte de réservation - Solde de portefeuille insuffisant"
    },
    
    // Customer Email - Content
    customerEmailTitle: {
      en: "Booking Alert",
      fr: "Alerte de réservation"
    },
    
    customerEmailGreeting: {
      en: "Dear Customer,",
      fr: "Cher client,"
    },
    
    customerEmailFooter: {
      en: "Best regards,<br>Skedisy Team",
      fr: "Cordialement,<br>L'équipe Skedisy"
    }
  };
};

const getMessage = (key, language = 'en', replacements = {}) => {
  const messages = getLocalizedMessages(language);
  const lang = language.toLowerCase() === 'fr' ? 'fr' : 'en';
  let message = messages[key]?.[lang] || messages[key]?.['en'] || '';
  
  // Replace placeholders
  Object.keys(replacements).forEach(placeholder => {
    message = message.replace(new RegExp(`{${placeholder}}`, 'g'), replacements[placeholder]);
  });
  
  return message;
};

exports.getBookingBasedDate = async (req, res) => {
  try {
    // Validate required parameters
    if (!req.query.date || !req.query.salonId) {
      return res.status(200).send({ status: false, message: "Oops Invalid Details!!" });
    }

    // Validate expertId - check if it's null, "null", empty, or undefined
    const expertId = req.query.expertId;
    if (!expertId || expertId === "null" || expertId === "undefined" || expertId.trim() === "") {
      return res.status(200).send({ status: false, message: "Expert ID is required!!" });
    }

    // Validate if expertId is a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(200).send({ status: false, message: "Invalid Expert ID format!!" });
    }

    const dayOfWeek = moment(req.query.date).format("dddd");
    const salon = await Salon.findById(req.query.salonId);
    if (!salon) {
      return res.status(200).send({ status: false, message: "Salon Not Found!!!" });
    }

    const [holiday, salonTime, expert] = await Promise.all([
      Holiday.findOne({ date: req.query.date, salonId: salon._id }),
      salon.salonTime.find((time) => time.day == dayOfWeek),
      Expert.findById(expertId),
    ]);

    if (holiday) {
      return res.status(200).send({
        status: true,
        timeSlots: [],
        isOpen: false,
        message: "Salon Closed!!!",
      });
    }

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert Not Found!!!" });
    }

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon Closed!!!" });
    }

    const bookingDate = req.query.date;

    console.log("bookingDate", bookingDate);
    const bookings = await Booking.aggregate([
      {
        $match: {
          expertId: expert._id,
          date: bookingDate,
          status: { $in: ["pending", "confirm"] },
        },
      },
    ]);

    const generateTimeSlots = (startTime, endTime, slotSize) => {
      const slots = [];
      let start = moment(startTime, "hh:mm A");
      const end = moment(endTime, "hh:mm A");

      while (start < end) {
        slots.push(start.format("hh:mm A"));
        start.add(slotSize, "minutes");
      }
      return slots;
    };

    const { openTime, closedTime, breakStartTime, breakEndTime, time, isBreak } = salonTime;

    const morningSlots = isBreak === true ? generateTimeSlots(openTime, breakStartTime.trim(), time) : generateTimeSlots(openTime, closedTime.trim(), time);

    const eveningSlots = isBreak === true ? generateTimeSlots(breakEndTime.trim(), closedTime, time) : [];

    const managedSlots = {
      morning: morningSlots,
      evening: eveningSlots,
    };

    const timeSlots = [].concat(...bookings.map((booking) => booking.time));

    const busyExpert = await BusyExpert.findOne({
      expertId: expertId,
      date: req.query.date,
    });

    const mergedTimeSlots = busyExpert ? [...timeSlots, ...busyExpert.time] : timeSlots;

    return res.status(200).send({
      status: true,
      message: "success",
      allSlots: managedSlots,
      timeSlots: mergedTimeSlots,
      salonTime,
      isOpen: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.newBooking = async (req, res, next) => {
  let booking = null; // Declare booking at function scope so it's accessible in catch block
  try {
    console.log("req.body++++++++", req.body);

    const atPlaceMissing =
      req.body.atPlace === undefined || req.body.atPlace === null || req.body.atPlace === "";
    const amountNum = parseFloat(req.body.amount);
    const withoutTaxNum = parseFloat(req.body.withoutTax);
    if (
      !req.body.serviceId ||
      !req.body.userId ||
      !req.body.expertId ||
      !req.body.date ||
      !req.body.time ||
      !req.body.salonId ||
      atPlaceMissing ||
      Number.isNaN(amountNum) ||
      amountNum <= 0 ||
      Number.isNaN(withoutTaxNum) ||
      withoutTaxNum <= 0
    ) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }
    req.body.amount = amountNum;
    req.body.withoutTax = withoutTaxNum;

    const today = moment().format("YYYY-MM-DD");
    let timeSlots = Array.isArray(req.body.time) ? req.body.time : [req.body.time];
    const timeArray = timeSlots[0].split(",");
    // const timeArray = bookingSlots.map((time) => time.trim());

    const [uniqueIdForWalletHistory, user, expert, salon] = await Promise.all([
      generateUniqueIdentifier(),
      User.findOne({ _id: req.body.userId }),
      Expert.findOne({ _id: req.body.expertId }),
      Salon.findOne({ _id: req.body.salonId }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(200).send({ status: false, message: "User is blocked. Please contact admin" });
    }

    const priorBookingsCount = await Booking.countDocuments({
      userId: user._id,
      isDelete: { $ne: true },
      status: { $nin: ["cancel"] },
    });
    const isFirstBookingCashback = priorBookingsCount === 0;

    if (!expert || expert.isBlock) {
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    if (!salon || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    // Get user language preference (from request or default to 'en')
    const userLanguage = getLanguage(req);

    const paymentType = (req.body.paymentType || "").toString().trim();

    const {
      resolveSalonCommissionPercent,
      computeRequiredSalonWalletBalance,
      shouldDebitSalonWalletForCommission,
    } = require("../../services/salonBookingWallet.service");
    const { salonPaymentOptions } = require("../../services/stripeConnect.service");

    const setting = await Setting.findOne().sort({ createdAt: -1 });
    const minUserWalletBalance = setting?.minUserWalletBalance || 0;
    const salonWalletBalance = salon.wallet || 0;
    const userWalletBalance = user.amount || 0;

    const salonCommissionPercent = resolveSalonCommissionPercent(salon, setting);
    const customerCommissionPercent = setting?.customerCommissionCharges || 0;

    const services = req.body.serviceId.split(",").map(s => s.trim());
    const servicesDataForCheck = await Service.find({ _id: { $in: services } });
    const serviceIdStrings = services.map(id => id.toString());
    const matchedServicesForCheck = salon.serviceIds.filter((service) => {
      return service.id && service.id._id && serviceIdStrings.includes(service.id._id.toString());
    });
    let totalServicePriceForCheck = 0;
    matchedServicesForCheck.forEach((service) => {
      totalServicePriceForCheck += parseInt(service.price);
    });

    const requiredBalance = computeRequiredSalonWalletBalance({
      salon,
      setting,
      servicePriceWithoutTax: totalServicePriceForCheck,
    });

    if (requiredBalance > 0 && salonWalletBalance < requiredBalance) {
      // Send SMS and Email notification to salon owner about insufficient wallet balance
      // Use setImmediate to send notifications asynchronously without blocking the response
      // Note: Salon owner messages use user's language (or default to 'en')
      setImmediate(async () => {
        try {
          const currencySymbol = global.settingJSON?.currencySymbol || "";
          const salonLanguage = userLanguage; // Use customer's language for salon notifications
          
          // SMS Notification
          if (salon.mobile && salon.mobile.trim() !== "") {
            try {
              const smsMessage = getMessage('salonOwnerSMSAlert', salonLanguage, {
                salonName: salon.name,
                currencySymbol: currencySymbol,
                currentBalance: salonWalletBalance.toFixed(2),
                requiredBalance: requiredBalance.toFixed(2)
              });

              const smsResult = await sendSMS(salon.mobile, smsMessage);
              if (smsResult.success) {
                console.log(`[Wallet Alert] SMS sent successfully to salon ${salon.name} (${salon.mobile})`);
              } else {
                console.error(`[Wallet Alert] Failed to send SMS to salon ${salon.name}:`, smsResult.error);
              }
            } catch (smsError) {
              console.error(`[Wallet Alert] Error sending SMS to salon ${salon.name}:`, smsError.message);
            }
          }

          // Email Notification
          if (salon.email && salon.email.trim() !== "" && process.env.SENDGRID_API_KEY) {
            try {
              const websiteLink = process.env.WEBSITE_URL || "https://skedisy.com";
              const supportEmail = process.env.SUPPORT_EMAIL || "support@skedisy.com";
              const contactNumber = process.env.CONTACT_NUMBER || "+33 7 66 16 03 94";

              const emailHtml = `
              <!DOCTYPE html>
              <html lang="${salonLanguage}">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                  .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
                  h2 { color: #d32f2f; }
                  .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
                  .info-box { background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
                  .info-box p { margin: 8px 0; }
                  .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  .button:hover { background-color: #0056b3; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>${getMessage('salonOwnerEmailTitle', salonLanguage)}</h2>
                  
                  <div class="alert-box">
                    <p><strong>${getMessage('salonOwnerEmailGreeting', salonLanguage)}</strong></p>
                    <p>${getMessage('salonOwnerEmailMessage', salonLanguage, { salonName: salon.name })}</p>
                  </div>

                  <div class="info-box">
                    <p><strong>${getMessage('salonOwnerEmailBalanceDetails', salonLanguage)}</strong></p>
                    <p>${getMessage('salonOwnerEmailCurrentBalance', salonLanguage)} <strong>${currencySymbol}${salonWalletBalance.toFixed(2)}</strong></p>
                    <p>${getMessage('salonOwnerEmailRequiredBalance', salonLanguage)} <strong>${currencySymbol}${requiredBalance.toFixed(2)}</strong></p>
                    <p>${getMessage('salonOwnerEmailDeficit', salonLanguage)} <strong>${currencySymbol}${(requiredBalance - salonWalletBalance).toFixed(2)}</strong></p>
                  </div>

                  <p>${getMessage('salonOwnerEmailRechargeMessage', salonLanguage)}</p>
                  
                  <a href="${websiteLink}/salonpanel/wallet" class="button">${getMessage('salonOwnerEmailRechargeButton', salonLanguage)}</a>

                  <div class="info-box">
                    <p><strong>${getMessage('salonOwnerEmailNeedHelp', salonLanguage)}</strong></p>
                    <p>${getMessage('salonOwnerEmailWebsite', salonLanguage)} <a href="${websiteLink}" style="color: #007bff; text-decoration: none;">${websiteLink}</a></p>
                    <p>${getMessage('salonOwnerEmailEmail', salonLanguage)} <a href="mailto:${supportEmail}" style="color: #007bff; text-decoration: none;">${supportEmail}</a></p>
                    <p>${getMessage('salonOwnerEmailPhone', salonLanguage)} <a href="tel:${contactNumber}" style="color: #007bff; text-decoration: none;">${contactNumber}</a></p>
                  </div>
                  
                  <div class="footer">
                    <p>${getMessage('salonOwnerEmailFooter', salonLanguage)}</p>
                  </div>
                </div>
              </body>
              </html>
            `;

              const msg = {
                to: salon.email.trim(),
                from: process.env.EMAIL || "noreply@skedisy.com",
                subject: getMessage('salonOwnerEmailSubject', salonLanguage, { salonName: salon.name }),
                html: emailHtml,
              };

              await sgMail.send(msg);
              console.log(`[Wallet Alert] Email sent successfully to salon ${salon.name} (${salon.email})`);
            } catch (emailError) {
              console.error(`[Wallet Alert] Error sending email to salon ${salon.name}:`, emailError.message);
            }
          }
        } catch (notificationError) {
          console.error("[Wallet Alert] Error in notification process:", notificationError.message);
          // Don't fail the booking request if notification fails
        }
      });

      // Return simple message to customer (without price details)
      // Detailed message with amounts is sent to salon owner via SMS/Email
      return res.status(200).send({
        status: false,
        message: getMessage('salonCannotAcceptBooking', userLanguage),
      });
    }

    // Only check customer wallet balance when payment is via WALLET.
    // For Stripe, MTN MoMo, Cash on service - skip wallet check (customer pays externally).
    const isWalletPayment = !["Stripe", "MTN MoMo", "cashAfterService"].includes(paymentType);

    if (isWalletPayment && global.settingJSON?.isWalletPay !== true) {
      return res.status(200).send({
        status: false,
        message: "Wallet payment is not available.",
      });
    }

    const salonPay = salonPaymentOptions(salon);
    if (paymentType === "cashAfterService" && !salonPay.acceptCash) {
      return res.status(200).send({
        status: false,
        message: "This salon does not accept cash payment.",
      });
    }
    if (paymentType === "Stripe" && !salonPay.acceptStripe) {
      return res.status(200).send({
        status: false,
        message: "This salon does not accept online card payment.",
      });
    }

    // Calculate commission that will be deducted from customer wallet
    // Use customerCommissionPercent from settings (or 0 if not set)
    const expectedCustomerCommission = customerCommissionPercent > 0 ? (customerCommissionPercent * totalServicePriceForCheck) / 100 : 0;
    // Customer needs: minimum balance + booking amount + commission
    // Note: req.body.amount is the final amount (with tax, minus discount), which is what will be deducted
    const requiredCustomerBalance = minUserWalletBalance + parseFloat(req.body.amount) + expectedCustomerCommission;
    
    // Check if customer has minimum wallet balance + booking amount + commission (WALLET payment only)
    if (isWalletPayment && userWalletBalance < requiredCustomerBalance) {
      const currencySymbol = global.settingJSON?.currencySymbol || "";
      const deficit = requiredCustomerBalance - userWalletBalance;
      
      // Send SMS and Email notification to customer about insufficient wallet balance
      setImmediate(async () => {
        try {
          // SMS Notification
          if (user.mobile && user.mobile.trim() !== "") {
            try {
              const smsMessage = getMessage('customerInsufficientWalletSMS', userLanguage);

              const smsResult = await sendSMS(user.mobile, smsMessage);
              if (smsResult.success) {
                console.log(`[Customer Wallet Alert] SMS sent successfully to user ${user.fname} ${user.lname} (${user.mobile})`);
              } else {
                console.error(`[Customer Wallet Alert] Failed to send SMS to user ${user.fname} ${user.lname}:`, smsResult.error);
              }
            } catch (smsError) {
              console.error(`[Customer Wallet Alert] Error sending SMS to user ${user.fname} ${user.lname}:`, smsError.message);
            }
          }

          // Email Notification
          if (user.email && user.email.trim() !== "" && process.env.SENDGRID_API_KEY) {
            try {
              const websiteLink = process.env.WEBSITE_URL || "https://skedisy.com";
              const supportEmail = process.env.SUPPORT_EMAIL || "support@skedisy.com";
              const contactNumber = process.env.CONTACT_NUMBER || "+33 7 66 16 03 94";

              const emailHtml = `
              <!DOCTYPE html>
              <html lang="${userLanguage}">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                  .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
                  h2 { color: #d32f2f; }
                  .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h2>${getMessage('customerEmailTitle', userLanguage)}</h2>
                  
                  <div class="alert-box">
                    <p><strong>${getMessage('customerEmailGreeting', userLanguage)}</strong></p>
                    <p>${getMessage('customerInsufficientWallet', userLanguage)}</p>
                  </div>
                  
                  <div class="footer">
                    <p>${getMessage('customerEmailFooter', userLanguage)}</p>
                  </div>
                </div>
              </body>
              </html>
            `;

              const msg = {
                to: user.email.trim(),
                from: process.env.EMAIL || "noreply@skedisy.com",
                subject: getMessage('customerEmailSubject', userLanguage),
                html: emailHtml,
              };

              await sgMail.send(msg);
              console.log(`[Customer Wallet Alert] Email sent successfully to user ${user.fname} ${user.lname} (${user.email})`);
            } catch (emailError) {
              console.error(`[Customer Wallet Alert] Error sending email to user ${user.fname} ${user.lname}:`, emailError.message);
            }
          }
        } catch (notificationError) {
          console.error("[Customer Wallet Alert] Error in notification process:", notificationError.message);
        }
      });

      return res.status(200).send({
        status: false,
        message: getMessage('customerInsufficientWallet', userLanguage),
        insufficientWallet: true, // Flag to identify this specific error in frontend
        currentBalance: userWalletBalance,
        requiredBalance: requiredCustomerBalance,
        deficit: deficit,
      });
    }

    const isTimeAlreadyBooked = await Booking.exists({
      $and: [
        { date: req.body.date },
        { expertId: expert._id },
        { status: { $eq: "pending" } },
        {
          time: {
            $elemMatch: { $in: timeArray },
          },
        },
      ],
    });

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `One or more selected time slots are already booked for Date ${req.body.date} for Expert ${expert.fname + " " + expert.lname}`,
      });
    }

    // services is already declared above (line 332) for wallet check, reuse it
    // Convert expert.serviceId (ObjectIds) to strings for comparison
    const expertServiceIdStrings = expert.serviceId.map(id => id.toString());
    const expertServices = services.every((service) => {
      const serviceIdStr = service.trim();
      return expertServiceIdStrings.includes(serviceIdStr);
    });

    if (!expertServices) {
      return res.status(200).send({
        status: false,
        message: "One or more provided serviceIds are not valid for the expert",
      });
    }

    const bookingDates = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = bookingDates.format("dddd");
    const salonTime = salon.salonTime.find((time) => time.day == dayOfWeek);

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon time not found" });
    }

    const salonOpenTime = moment(salonTime.openTime, "hh:mm A");
    const salonCloseTime = moment(salonTime.closedTime, "hh:mm A");
    const breakStartTime = moment(salonTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(salonTime.breakEndTime, "hh:mm A");

    const isWithinSalonHours = timeArray.every((time) => {
      const bookingStartTime = moment(String(time).trim(), "hh:mm A");
      return (
        bookingStartTime.isValid() &&
        bookingStartTime.isSameOrAfter(salonOpenTime) &&
        bookingStartTime.isSameOrBefore(salonCloseTime)
      );
    });

    if (
      !isWithinSalonHours ||
      timeArray.some((time) => {
        const bookingStartTime = moment(String(time).trim(), "hh:mm A");
        return (
          !bookingStartTime.isValid() ||
          bookingStartTime.isSameOrBefore(salonOpenTime) ||
          bookingStartTime.isSameOrAfter(salonCloseTime) ||
          (bookingStartTime.isSameOrAfter(breakStartTime) && bookingStartTime.isSameOrBefore(breakEndTime))
        );
      })
    ) {
      return res.status(200).send({
        status: false,
        message: "One or more booking times are outside salon hours or during the break",
      });
    }

    booking = new Booking();

    const globalAutoConfirm = global.settingJSON?.autoConfirmBookings !== false;
    const salonAutoConfirm = salon.autoConfirmBookings !== false;
    booking.status = globalAutoConfirm && salonAutoConfirm ? "confirm" : "pending";

    booking.userId = user._id;
    booking.expertId = expert._id;
    booking.startTime = timeArray[0];

    const bookingDate = moment(req.body.date, "YYYY-MM-DD");
    booking.date = bookingDate.format("YYYY-MM-DD");

    booking.salonId = salon._id;
    booking.atPlace = req?.body?.atPlace;
    booking.address = req?.body?.address || "";
    booking.withoutTax = req.body.withoutTax;
    booking.serviceId = services;

    const servicesData = await Service.find({ _id: { $in: services } });

    // Convert service IDs to strings for proper comparison (serviceIdStrings is already defined above)
    const matchedServices = salon.serviceIds.filter((service) => {
      // Convert ObjectId to string and check if it's in the requested services array
      return service.id && service.id._id && serviceIdStrings.includes(service.id._id.toString());
    });

    let totalServicePrice = 0;
    let totalDuration = 0;
    servicesData.forEach((service) => {
      totalDuration += service.duration;
    });

    matchedServices.forEach((service) => {
      totalServicePrice += parseInt(service.price);
    });

    const totalSlots = Math.ceil(totalDuration / 15);
    const resultOfGreater = totalDuration / totalSlots;
    const result = totalDuration / timeArray.length;

    if (result > 15 || result < 1 || resultOfGreater !== result) {
      return res.status(200).send({ status: false, message: "Slots not correctly booked" });
    }
    const servicePrice = totalServicePrice.toFixed(2);

    console.log("totalServicePrice      ", totalServicePrice);
    console.log("servicePrice           ", servicePrice);
    console.log("req.body.withoutTax    ", req.body.withoutTax);

    if (servicePrice !== req.body.withoutTax.toFixed(2)) {
      return res.status(200).send({ status: false, message: "Invalid Service Price" });
    }

    let coupon, discountAmount, totalAmount;

    const taxAmount = (req.body.withoutTax * global.settingJSON.tax) / 100;
    const withTaxAmount = (taxAmount + req.body.withoutTax).toFixed(2);
    const bookingAmount = req?.body?.amount.toFixed(2);

    console.log("withTaxAmount         ", withTaxAmount);
    console.log("bookingAmount         ", bookingAmount);
    console.log("taxAmount             ", taxAmount);

    totalAmount = withTaxAmount;

    if (req.body.couponId) {
      const couponObjId = new mongoose.Types.ObjectId(req.body.couponId);

      coupon = await Coupon.findOne({ _id: couponObjId, isActive: true, type: 2, expiryDate: { $gte: today } });

      if (!coupon) {
        return res.status(200).json({
          status: false,
          message: "Invalid or inactive coupon. Please try with a valid coupon or remove it.",
        });
      }

      const alreadyUsed = coupon.usedBy && coupon.usedBy.some((entry) => entry.userId.toString() === user._id.toString() && entry.usageType === 2);
      console.log("alreadyUsed", alreadyUsed);

      if (alreadyUsed) {
        return res.status(200).json({
          status: false,
          message: "Coupon has already been used by this customer for the specified type.",
        });
      }

      if (coupon.discountType == 1) {
        discountAmount = coupon.maxDiscount;
      } else if (coupon.discountType == 2) {
        // FIX: Use parseFloat instead of parseInt to preserve decimals
        // This matches the validateCoupon API calculation which uses parseInt(amount) from query string
        // Since frontend sends integer to validateCoupon, we should use integer here too
        // But to be safe and match frontend calculation, use parseFloat and round to integer
        const withoutTaxInt = Math.floor(parseFloat(req.body.withoutTax));
        const discount = (withoutTaxInt * coupon.discountPercent) / 100;
        const formatedDiscount = parseFloat(discount.toFixed(2));

        discountAmount = formatedDiscount > coupon.maxDiscount ? coupon.maxDiscount : formatedDiscount;
      }

      if (!alreadyUsed) {
        coupon.usedBy.push({
          userId: user._id,
          usageType: coupon.type,
        });
      }

      // FIX: Convert withTaxAmount (STRING) to NUMBER before subtraction to avoid precision issues
      // withTaxAmount is a string from .toFixed(2), need to convert to number for accurate calculation
      totalAmount = parseFloat(withTaxAmount) - discountAmount;
    }

    console.log("totalAmount after add tax and deduct the discount (if any)", totalAmount);
    console.log("totalAmount type:", typeof totalAmount);
    console.log("withTaxAmount:", withTaxAmount, "type:", typeof withTaxAmount);
    console.log("discountAmount:", discountAmount, "type:", typeof discountAmount);

    // Convert totalAmount to string with 2 decimal places for comparison
    // This ensures both sides are strings and can be compared correctly
    // CRITICAL: Ensure both are numbers first, then convert to string
    const totalAmountNum = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount;
    const bookingAmountNum = typeof bookingAmount === 'string' ? parseFloat(bookingAmount) : parseFloat(bookingAmount);
    
    const totalAmountString = totalAmountNum.toFixed(2);
    const bookingAmountString = bookingAmountNum.toFixed(2);
    
    // Enhanced logging for debugging
    console.log("=== AMOUNT COMPARISON DEBUG ===");
    console.log("req.body.withoutTax:", req.body.withoutTax, "type:", typeof req.body.withoutTax);
    console.log("req.body.amount:", req.body.amount, "type:", typeof req.body.amount);
    console.log("req.body.couponId:", req.body.couponId);
    console.log("taxAmount:", taxAmount);
    console.log("withTaxAmount (string):", withTaxAmount, "type:", typeof withTaxAmount);
    console.log("discountAmount:", discountAmount, "type:", typeof discountAmount);
    console.log("totalAmount (raw):", totalAmount, "type:", typeof totalAmount);
    console.log("totalAmountNum:", totalAmountNum);
    console.log("bookingAmount (raw):", bookingAmount, "type:", typeof bookingAmount);
    console.log("bookingAmountNum:", bookingAmountNum);
    console.log("totalAmountString:", totalAmountString);
    console.log("bookingAmountString:", bookingAmountString);
    console.log("Comparison:", totalAmountString, "!== ", bookingAmountString, "=", totalAmountString !== bookingAmountString);
    console.log("Difference:", Math.abs(totalAmountNum - bookingAmountNum));
    console.log("=== END AMOUNT COMPARISON DEBUG ===");

    // CRITICAL FIX: Use numeric comparison with tolerance for floating point errors
    // Instead of strict string comparison, compare the numeric values
    // Allow for very small differences due to floating point precision (0.01 cent tolerance)
    const amountDifference = Math.abs(totalAmountNum - bookingAmountNum);
    const tolerance = 0.01; // Allow 1 cent difference due to floating point precision
    
    if (amountDifference > tolerance) {
      console.log("❌ AMOUNT MISMATCH DETECTED:");
      console.log("  Expected (backend):", totalAmountString);
      console.log("  Received (frontend):", bookingAmountString);
      console.log("  Difference:", amountDifference);
      console.log("  Tolerance:", tolerance);
      
      return res.status(200).json({
        status: false,
        message: `book failed - Amount mismatch. Expected: ${totalAmountString}, Received: ${bookingAmountString}`,
      });
    }
    
    // Log successful match
    console.log("✅ AMOUNT MATCH - Booking can proceed");

    booking.amount = req.body.amount;
    booking.tax = taxAmount.toFixed(2);

    // Calculate salon commission (from settings or salon.platformFee as fallback)
    const platformFee = (salonCommissionPercent * req.body.withoutTax) / 100;
    booking.platformFee = parseInt(platformFee);
    booking.platformFeePercent = salonCommissionPercent.toFixed(2);
    
    // Calculate and store customer commission (from settings)
    const customerCommission = customerCommissionPercent > 0 ? (customerCommissionPercent * req.body.withoutTax) / 100 : 0;
    booking.customerCommission = parseInt(customerCommission);
    booking.customerCommissionPercent = customerCommissionPercent.toFixed(2);

    const salonCommission = ((req.body.withoutTax - platformFee) * expert.commission) / 100;
    booking.salonCommission = salonCommission.toFixed(2);
    booking.salonCommissionPercent = expert.commission;

    booking.salonEarning = parseInt(req.body.withoutTax - platformFee).toFixed(2);
    booking.expertEarning = (req.body.withoutTax - (platformFee + salonCommission)).toFixed(2);
    booking.duration = totalDuration;
    booking.time = timeArray;

    booking.coupon = coupon
      ? {
          title: coupon.title,
          description: coupon.description,
          code: coupon.code,
          discountType: coupon.discountType,
          maxDiscount: coupon.maxDiscount,
          minAmountToApply: coupon.minAmountToApply,
        }
      : {};

    const uniqueBookingId = await generateUniqueBookingId();
    booking.bookingId = uniqueBookingId;

    // Save booking first to get a valid _id
    await booking.save();

    // Deduct platform commission from salon wallet (cash / wallet / MTN — not Stripe Connect)
    const commissionAmount = parseFloat(platformFee.toFixed(2));

    if (commissionAmount > 0 && shouldDebitSalonWalletForCommission(setting)) {
      // Deduct commission from salon wallet
      salon.wallet = (salon.wallet || 0) - commissionAmount;
      await salon.save();

      // Create wallet history entry using SalonExpertWalletHistory (correct model)
      const uniqueIdForSalonWallet = await generateUniqueIdentifier();
      await new SalonExpertWalletHistory({
        salon: salon._id,
        booking: booking._id,
        amount: commissionAmount,
        type: SALON_EXPERT_WALLET_TYPE.DEBIT_PLATFORM_COMMISSION, // Type 3: amount debited for platform commission
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm a"),
        uniqueId: uniqueIdForSalonWallet,
      }).save();
    }

    const bookingDateFormat = moment().format("YYYY-MM-DD");
    
    // Create unique strings with duplicate handling
    const uniqueStrings = await Promise.all(
      timeArray.map(async (time) => {
        const uniqueStringValue = `${bookingDateFormat}-${expert._id}-${time}`;
        
        try {
          // Try to create the unique string
          return await UString.create({
            string: uniqueStringValue,
            bookingId: booking._id,
          });
        } catch (error) {
          // Handle duplicate key error
          if (error.code === 11000) {
            // Check if the existing unique string is associated with this booking
            const existingUniqueString = await UString.findOne({ string: uniqueStringValue });
            
            if (existingUniqueString && existingUniqueString.bookingId.toString() === booking._id.toString()) {
              // Same booking, return the existing unique string
              return existingUniqueString;
            }
            
            // Check if it's associated with a valid pending booking
            if (existingUniqueString) {
              const existingBooking = await Booking.findById(existingUniqueString.bookingId);
              
              if (existingBooking && existingBooking.status === 'pending') {
                // Time slot is already booked, delete this booking and throw error
                if (booking && booking._id) {
                  await Booking.deleteOne({ _id: booking._id });
                }
                throw new Error(`Time slot ${time} is already booked for this date and expert`);
              } else {
                // Old booking doesn't exist or is not pending, delete the unique string and retry
                await UString.deleteOne({ _id: existingUniqueString._id });
                return await UString.create({
                  string: uniqueStringValue,
                  bookingId: booking._id,
                });
              }
            }
          }
          
          // Re-throw if it's not a duplicate key error
          throw error;
        }
      })
    );

    res.status(200).send({
      status: true,
      message: "Booking Created!",
      data: booking,
      firstBookingCashback: isFirstBookingCashback,
    });

    if (coupon) {
      await coupon.save();
    }

    // Only deduct from customer wallet when payment is via WALLET.
    // For Stripe, MTN MoMo, Cash on service - payment is done externally, no wallet deduction.
    if (isWalletPayment) {
    // Calculate customer commission amount (separate from salon commission)
    const customerCommissionAmount = customerCommissionPercent > 0 ? parseFloat((customerCommissionPercent * req.body.withoutTax / 100).toFixed(2)) : 0;
    
    // Total amount to deduct from customer wallet = booking amount + commission (if any)
    const totalDeductionAmount = parseFloat(totalAmount) + customerCommissionAmount;

    // Check if customer has sufficient wallet balance for booking + commission (if commission > 0)
    if (customerCommissionAmount > 0 && user.amount < totalDeductionAmount) {
      return res.status(200).send({
        status: false,
        message: `Insufficient wallet balance. Required: ${totalDeductionAmount.toFixed(2)} (booking: ${totalAmount.toFixed(2)} + commission: ${customerCommissionAmount.toFixed(2)}), Current: ${user.amount.toFixed(2)}. Please recharge your wallet.`,
      });
    } else if (user.amount < parseFloat(totalAmount)) {
      return res.status(200).send({
        status: false,
        message: `Insufficient wallet balance. Required: ${totalAmount.toFixed(2)}, Current: ${user.amount.toFixed(2)}. Please recharge your wallet.`,
      });
    }

    // Prepare wallet history promises
    const walletHistoryPromises = [
      // Deduct booking amount from customer wallet
      User.updateOne(
        { _id: user._id, amount: { $gte: totalDeductionAmount } },
        {
          $inc: {
            amount: -totalDeductionAmount, // Deduct booking amount + commission
          },
        }
      ),
      // Wallet history for booking payment
      new UserWalletHistory({
        user: user._id,
        amount: totalAmount,
        type: USER_WALLET_TYPE.DEBIT_BOOKING, // Type 2: amount deduct at the time of booking
        date: moment().format("YYYY-MM-DD"),
        time: moment().format("HH:mm a"),
        uniqueId: uniqueIdForWalletHistory,
        booking: booking._id,
        couponAmount: discountAmount,
        coupon: coupon
          ? {
              title: coupon.title,
              description: coupon.description,
              code: coupon.code,
              discountType: coupon.discountType,
              maxDiscount: coupon.maxDiscount,
              minAmountToApply: coupon.minAmountToApply,
            }
          : {},
      }).save(),
    ];

    // Add commission wallet history only if commission > 0
    if (customerCommissionAmount > 0) {
      const uniqueIdForCustomerCommission = await generateUniqueIdentifier();
      walletHistoryPromises.push(
        new UserWalletHistory({
          user: user._id,
          amount: customerCommissionAmount,
          type: USER_WALLET_TYPE.DEBIT_COMMISSION, // Type 6: amount deduct for platform commission
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm a"),
          uniqueId: uniqueIdForCustomerCommission,
          booking: booking._id,
        }).save()
      );
    }

    await Promise.all(walletHistoryPromises);
    }

    if (expert && expert.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: expert.fcmToken,
        notification: {
          body: `Your Booking Is Confirm On ${booking.date} At ${booking.startTime}.`,
          title: "New Booking Request.",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);

          const notification = new Notification();
          notification.expertId = expert._id;
          notification.title = "New Booking Request";
          notification.image = req.file ? process.env.baseURL + req.file.path : "";
          notification.message = `Your Booking Is Confirm On ${booking.date} At ${booking.startTime}.`;
          notification.notificationType = 1;
          notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await notification.save();
        })
        .catch((error) => {
          console.log("Error sending message: ", error);
        });
    }

    setImmediate(() => {
      sendAdminNewBookingEmail(booking._id).catch((err) =>
        console.error("[Admin Booking Email] send failed:", err.message)
      );
    });
  } catch (error) {
    console.log(error);
    
    // Clean up: If booking was created but process failed, delete it and associated unique strings
    if (booking && booking._id) {
      try {
        await Promise.all([
          Booking.deleteOne({ _id: booking._id }),
          UString.deleteMany({ bookingId: booking._id })
        ]);
      } catch (cleanupError) {
        console.log("Error during cleanup:", cleanupError);
      }
    }
    
    // Handle "time slot already booked" error specifically
    if (error.message && error.message.includes("is already booked")) {
      return res.status(200).send({ 
        status: false, 
        message: error.message 
      });
    }
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(200).send({ 
        status: false, 
        message: "This time slot is already booked. Please try a different time." 
      });
    }
    
    return res.status(500).send({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.checkSlots = async (req, res, next) => {
  try {
    if (!req.body.serviceId || !req.body.userId || !req.body.expertId || !req.body.date || !req.body.time || !req.body.amount || !req.body.withoutTax || !req.body.salonId) {
      return res.status(200).send({ status: false, message: "Invalid Details!!" });
    }

    let timeSlots = Array.isArray(req.body.time) ? req.body.time : [req.body.time];
    const bookingSlots = timeSlots[0].split(",");
    const timeArray = bookingSlots.map((time) => time.trim());

    const [user, expert, salon, setting, isTimeAlreadyBooked] = await Promise.all([
      User.findOne({ _id: req.body.userId }),
      Expert.findOne({ _id: req.body.expertId }),
      Salon.findOne({ _id: req.body.salonId }),
      global.settingJSON,
      Booking.exists({
        $and: [
          { date: req.body.date },
          { expertId: req.body.expertId },
          { status: { $eq: "pending" } },
          {
            time: {
              $elemMatch: { $in: timeArray },
            },
          },
        ],
      }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: "You Are blocked. Please contact admin",
      });
    }

    if (!expert || expert.isBlock) {
      return res.status(200).send({ status: false, message: "Expert not found" });
    }

    if (!salon || !salon.isActive) {
      return res.status(200).send({ status: false, message: "Salon not found" });
    }

    if (isTimeAlreadyBooked) {
      return res.status(200).send({
        status: false,
        message: `One or more selected time slots are already booked for Date ${req.body.date} for Expert ${expert.fname + " " + expert.lname}`,
      });
    }

    const services = req.body.serviceId.split(",").map(s => s.trim());
    
    // Convert expert.serviceId (ObjectIds) to strings for comparison
    const expertServiceIdStrings = expert.serviceId.map(id => id.toString());
    const expertServices = services.every((service) => {
      return expertServiceIdStrings.includes(service);
    });

    if (!expertServices) {
      return res.status(200).send({
        status: false,
        message: "One or more provided serviceIds are not valid for the expert",
      });
    }

    const bookingDates = moment(req.body.date, "YYYY-MM-DD");
    const dayOfWeek = bookingDates.format("dddd");
    const salonTime = salon.salonTime.find((time) => time.day == dayOfWeek);

    if (!salonTime) {
      return res.status(200).send({ status: false, message: "Salon time not found" });
    }

    const salonOpenTime = moment(salonTime.openTime, "hh:mm A");
    const salonCloseTime = moment(salonTime.closedTime, "hh:mm A");

    const breakStartTime = moment(salonTime.breakStartTime, "hh:mm A");
    const breakEndTime = moment(salonTime.breakEndTime, "hh:mm A");
    const isWithinSalonHours = timeArray.every((time) => {
      const bookingStartTime = moment(time, "hh:mm:ss A");
      return bookingStartTime.isSameOrAfter(salonOpenTime) && bookingStartTime.isSameOrBefore(salonCloseTime);
    });

    if (
      !isWithinSalonHours ||
      timeArray.some((time) => {
        const bookingStartTime = moment(time, "hh:mm A");
        return (
          bookingStartTime.isSameOrBefore(salonOpenTime) ||
          bookingStartTime.isSameOrAfter(salonCloseTime) ||
          (bookingStartTime.isSameOrAfter(breakStartTime) && bookingStartTime.isSameOrBefore(breakEndTime))
        );
      })
    ) {
      return res.status(200).send({
        status: false,
        message: "One or more booking times are outside salon hours or during the break",
      });
    }

    const servicesData = await Service.find({ _id: { $in: services } });

    // Convert service IDs to strings for proper comparison
    const serviceIdStringsForCheck = services.map(id => id.toString());
    const matchedServices = salon.serviceIds.filter((service) => {
      // Convert ObjectId to string and check if it's in the requested services array
      return service.id && service.id._id && serviceIdStringsForCheck.includes(service.id._id.toString());
    });

    let totalServicePrice = 0;
    let totalDuration = 0;
    servicesData.forEach((service) => {
      totalDuration += service.duration;
    });

    matchedServices.forEach((service) => {
      totalServicePrice += parseInt(service.price);
    });

    const totalSlots = Math.ceil(totalDuration / 15);
    const resultOfGreater = totalDuration / totalSlots;
    const result = totalDuration / timeArray.length;

    if (result > 15 || result < 1 || resultOfGreater !== result) {
      return res.status(200).send({ status: false, message: "Slots not correctly booked" });
    }

    const servicePrice = totalServicePrice.toFixed(2);

    console.log("totalServicePrice", totalServicePrice);
    console.log("servicePrice", servicePrice);
    console.log("req.body.withoutTax", req.body.withoutTax);

    if (servicePrice !== req.body.withoutTax.toFixed(2)) {
      return res.status(200).send({ status: false, message: "Invalid Service Price" });
    }

    const taxAmount = (req.body.withoutTax * global.settingJSON.tax) / 100;
    const withTaxAmount = (taxAmount + req.body.withoutTax).toFixed(2);
    const bookingAmount = req?.body?.amount.toFixed(2);

    console.log("withTaxAmount", withTaxAmount);
    console.log("bookingAmount", bookingAmount);
    console.log("taxAmount", taxAmount);
    console.log(typeof taxAmount);

    if (withTaxAmount !== bookingAmount) {
      return res.status(200).send({ status: false, message: "Invalid Amount" });
    }

    return res.status(200).send({
      status: true,
      message: "Slots Checked Successfully!!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.bookingForUser = async (req, res) => {
  try {
    if (!req?.query?.userId || !req?.query?.status) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const status = req.query.status.trim();
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = start * limit;

    const searchString = req.query.search || "";

    const pipeline = [
      { $match: { userId: user._id } },
      { $match: getStatusFilter(status) },

      { $sort: { date: 1, time: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          as: "expert",
        },
      },
      { $unwind: "$expert" },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $match: {
          $or: [{ "service.name": { $regex: new RegExp(searchString, "i") } }, { "service.name": { $exists: false } }],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "service.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          updatedAt: 1,
          status: 1,
          date: 1,
          time: 1,
          amount: 1,
          bookingId: 1,
          checkInTime: 1,
          checkOutTime: 1,
          isReview: 1,
          cancel: 1,
          user: { _id: 1, fname: 1, lname: 1, image: 1 },
          expert: { _id: 1, fname: 1, lname: 1, image: 1 },
          service: 1,
          category: { _id: 1, name: 1, image: 1 },
          isReviewed: 1,
        },
      },
      {
        $sort: { date: -1, time: 1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const [bookings, total] = await Promise.all([Booking.aggregate(pipeline), Booking.countDocuments({ userId: user._id, ...getStatusFilter(status) })]);

    return res.status(200).send({ status: true, message: "Success", data: bookings });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

exports.cancelBookingByUser = async (req, res) => {
  try {
    if (!req?.body?.bookingId || !req.body.reason || !req.body.person) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const booking = await Booking.findById(req?.body?.bookingId);
    if (!booking) {
      return res.status(200).send({ status: false, message: "data not found" });
    }

    const [user, expert] = await Promise.all([User.findById(booking.userId), Expert.findById(booking.expertId)]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User not found" });
    }

    if (!expert) {
      return res.status(200).send({ status: false, message: "Expert not found Of this booking" });
    }

    if (booking.status == "cancel") {
      return res.status(200).send({ status: false, message: "Booking is already cancel" });
    }

    if (booking.status == "confirm") {
      return res.status(200).send({
        status: false,
        message: "You are already checked In.Cancellation is not allowed after checkIn.Contact Salon for more details",
      });
    }

    booking.status = "cancel";
    booking.cancel.reason = req.body.reason;
    booking.cancel.time = moment().format("hh:mm A");
    booking.cancel.date = moment().format("YYYY-MM-DD");
    booking.cancel.person = "user";
    await booking.save();

    setImmediate(() => {
      sendAdminCustomerCancelledBookingEmail(booking._id).catch((err) =>
        console.error("[Admin Booking Email] customer cancel notify failed:", err.message)
      );
    });

    res.status(200).send({
      status: true,
      message: "Booking Cancelled successfully!!",
      booking,
    });

    await Promise.all([
      User.updateOne(
        { _id: user._id, amount: { $gt: 0 } },
        {
          $inc: {
            amount: booking.amount,
          },
        }
      ),
      Notification.create({
        expertId: expert._id,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
      UString.deleteMany({ bookingId: booking._id }),
      UserWalletHistory.findOneAndDelete({ booking: booking._id }),
    ]);

    if (expert && expert.fcmToken !== null) {
      const adminPromise = await admin;

      const payload = {
        token: expert?.fcmToken,
        notification: {
          body: `Your Booking with Id ${booking.bookingId} is cancelled By ${user.fname} ${user.lname}`,
          title: "Booking Cancel",
        },
      };

      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message:           ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.bookingInfo = async (req, res) => {
  try {
    const { bookingId } = req.query;
    if (!bookingId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("expertId userId")
      .populate({
        path: "salonId",
        select: "name addressDetails locationCoordinates mobile",
      })
      .populate({
        path: "serviceId",
        populate: {
          path: "categoryId",
        },
      });

    if (!booking) {
      return res.status(200).send({ status: false, message: "Booking Not Found" });
    }

    return res.status(200).send({ status: true, message: "Success", booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

function getStatusFilter(status) {
  switch (status) {
    case "pending":
      return { status: { $in: ["pending", "confirm"] } };
    case "ALL":
      return {};
    default:
      return { status };
  }
}

async function generateUniqueBookingId() {
  let newBookingId;

  do {
    newBookingId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await Booking.exists({ bookingId: newBookingId }));

  return newBookingId;
}