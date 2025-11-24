require("dotenv").config();
const { sendSMS, sendAppointmentReminder } = require("./services/sms.service");

async function testTwilio() {
  console.log("=== Testing Twilio SMS Configuration ===\n");

  // Check environment variables
  console.log("1. Checking Environment Variables:");
  console.log("   TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✓ Set" : "✗ Missing");
  console.log("   TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✓ Set" : "✗ Missing");
  console.log("   TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER ? `✓ Set (${process.env.TWILIO_PHONE_NUMBER})` : "✗ Missing");
  console.log("");

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error("❌ ERROR: Twilio credentials are not properly configured in .env file");
    console.error("\nPlease ensure your .env file has (replace with your actual credentials):");
    console.error("TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.error("TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    console.error("TWILIO_PHONE_NUMBER=+1234567890");
    console.error("\n⚠️  IMPORTANT: No spaces around = sign, no semicolons at the end!");
    process.exit(1);
  }

  // Test phone number - Update this with your actual phone number
  // Note: French numbers are typically 10 digits after country code (+33)
  // If +337660394 doesn't work, try +3376603940 or your full number
  const testPhoneNumber = "+337660394"; // Your phone number
  
  console.log("2. Testing SMS Send:");
  console.log(`   From: ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`   To: ${testPhoneNumber}`);
  console.log("");

  // Test message
  const testMessage = "Test SMS from Salon Booking System - If you receive this, Twilio is working correctly! 🎉";

  try {
    console.log("3. Sending test SMS...");
    const result = await sendSMS(testPhoneNumber, testMessage);

    if (result.success) {
      console.log("\n✅ SUCCESS! Test SMS sent successfully!");
      console.log(`   Message SID: ${result.messageSid}`);
      console.log(`   Status: ${result.status}`);
      console.log(`\n📱 Check your phone (+337660394) for the test message.`);
    } else {
      console.error("\n❌ FAILED to send SMS:");
      console.error(`   Error: ${result.error}`);
      
      // Common error messages
      if (result.error.includes("not configured")) {
        console.error("\n   → Make sure Twilio credentials are set in .env file");
      } else if (result.error.includes("invalid")) {
        console.error("\n   → Check if the phone number format is correct (E.164 format: +1234567890)");
      } else if (result.error.includes("unverified")) {
        console.error("\n   → This phone number needs to be verified in Twilio trial account");
        console.error("   → Go to Twilio Console > Phone Numbers > Verified Caller IDs");
      }
    }
  } catch (error) {
    console.error("\n❌ ERROR occurred during test:");
    console.error(`   ${error.message}`);
    console.error("\n   Full error:", error);
  }

  console.log("\n=== Test Complete ===");
}

// Run the test
testTwilio()
  .then(() => {
    console.log("\nTest script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nFatal error:", error);
    process.exit(1);
  });

