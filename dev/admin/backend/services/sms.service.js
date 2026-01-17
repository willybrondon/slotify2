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
      console.log(`[SMS Reminder] User ${user?._id || booking.userId} does not have a mobile number. Skipping SMS reminder for booking ${booking.bookingId || booking._id}.`);
      return { success: false, error: "User mobile number not found" };
    }

    console.log(`[SMS Reminder] Attempting to send ${reminderType} reminder to user ${user._id} (mobile: ${user.mobile}) for booking ${booking.bookingId || booking._id}`);

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
    
    if (result.success) {
      console.log(`[SMS Reminder] Successfully sent ${reminderType} reminder to ${user.mobile} for booking ${booking.bookingId || booking._id}`);
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
};

