# MultisalonEcommerce-backend

## SMS Reminders Feature

The application now supports automated SMS reminders for appointments using Twilio.

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Add the following variables to your `.env` file:
   ```env
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number in E.164 format
   ```

3. **Get Twilio Credentials**
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get your Account SID and Auth Token from the Twilio Console
   - Purchase a phone number or use a trial number

### Features

- **24-Hour Reminders**: Automatically sends SMS reminders 24 hours before appointments
- **2-Hour Reminders**: Automatically sends SMS reminders 2 hours before appointments
- **Duplicate Prevention**: Tracks sent reminders to avoid sending multiple times
- **Error Handling**: Gracefully handles errors and logs them for debugging

### Cron Jobs

- **24-Hour Reminder**: Runs every hour at minute 0
- **2-Hour Reminder**: Runs every 15 minutes

### SMS Message Format

- **24-Hour Reminder**: "Hi [Name]! Reminder: You have an appointment at [Salon] tomorrow ([Date]) at [Time]. Booking ID: [ID]. We look forward to seeing you!"
- **2-Hour Reminder**: "Hi [Name]! Reminder: Your appointment at [Salon] is in 2 hours ([Date] at [Time]). Booking ID: [ID]. See you soon!"

### Notes

- SMS reminders are only sent to users who have a valid mobile number
- Reminders are only sent for bookings with status "pending" or "confirm"
- The system automatically tracks which reminders have been sent to prevent duplicates