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
 * Send SMS using Twilio
 * @param {string} to - Phone number to send SMS to (E.164 format)
 * @param {string} message - Message body
 * @returns {Promise<Object>} - Twilio message response
 */
async function sendSMS(to, message) {
  try {
    // Validate Twilio credentials
    if (!client || !process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error("Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables.");
      return { success: false, error: "SMS service not configured" };
    }

    // Validate phone number
    if (!to || to.trim() === "") {
      console.error("Phone number is required");
      return { success: false, error: "Phone number is required" };
    }

    // Format phone number to E.164 format if needed
    let formattedPhone = to.trim();
    if (!formattedPhone.startsWith("+")) {
      // If no country code, assume it needs one (you may need to adjust this based on your requirements)
      console.warn(`Phone number ${formattedPhone} may need country code prefix (e.g., +1 for US)`);
    }

    // Send SMS
    const messageResponse = await client.messages.create({
      body: message,
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
    console.error(`Error sending SMS to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
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
      booking.salonId.name ? booking.salonId : Salon.findById(booking.salonId),
    ]);

    if (!user || !user.mobile || user.mobile.trim() === "") {
      console.log(`User ${user?._id} does not have a mobile number. Skipping SMS reminder.`);
      return { success: false, error: "User mobile number not found" };
    }

    if (!salon) {
      return { success: false, error: "Salon not found" };
    }

    // Format appointment date and time
    const appointmentDate = booking.date;
    const appointmentTime = booking.startTime || booking.time[0] || "";
    const customerName = user.fname || "Customer";
    const salonName = salon.name || "Salon";
    const bookingId = booking.bookingId || "";

    // Create message based on reminder type
    let message = "";
    if (reminderType === "24h") {
      message = `Hi ${customerName}! Reminder: You have an appointment at ${salonName} tomorrow (${appointmentDate}) at ${appointmentTime}. Booking ID: ${bookingId}. We look forward to seeing you!`;
    } else if (reminderType === "2h") {
      message = `Hi ${customerName}! Reminder: Your appointment at ${salonName} is in 2 hours (${appointmentDate} at ${appointmentTime}). Booking ID: ${bookingId}. See you soon!`;
    } else {
      message = `Hi ${customerName}! Reminder: You have an appointment at ${salonName} on ${appointmentDate} at ${appointmentTime}. Booking ID: ${bookingId}.`;
    }

    // Send SMS
    const result = await sendSMS(user.mobile, message);
    return result;
  } catch (error) {
    console.error("Error in sendAppointmentReminder:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSMS,
  sendAppointmentReminder,
};

