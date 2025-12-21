# Debug Commands: Cash Service with Coupon Failure Logs

## Quick Command (Real-time Monitoring)
```bash
# Watch logs in real-time and filter for cash service + coupon failures
pm2 logs backend --lines 0 | grep -iE "cash|coupon|book failed|booking|amount mismatch|discount"
```

## Detailed Commands

### 1. Real-time Log Monitoring (Filtered)
```bash
# Monitor all backend logs and filter for relevant entries
pm2 logs backend --lines 0 | grep -iE "cashAfterService|coupon|book failed|Amount mismatch|discount|selectedCouponId"
```

### 2. View Recent Error Logs
```bash
# View last 200 lines of error log filtered for booking/coupon issues
tail -n 200 ~/.pm2/logs/backend-error.log | grep -iE "book failed|coupon|cash|booking|amount"
```

### 3. Search for Specific Error Messages
```bash
# Search for "book failed" errors
grep -i "book failed" ~/.pm2/logs/backend-error.log | tail -20

# Search for "Amount mismatch" errors
grep -i "amount mismatch\|Amount mismatch" ~/.pm2/logs/backend-error.log | tail -20

# Search for coupon-related errors
grep -i "coupon" ~/.pm2/logs/backend-error.log | tail -20
```

### 4. View Complete Request/Response for Failed Bookings
```bash
# View all logs (both error and output) for booking API calls
grep -iE "newBooking|create.*booking|POST.*booking" ~/.pm2/logs/backend-out.log | tail -50
```

### 5. Monitor Specific API Endpoint
```bash
# Watch logs for booking creation endpoint
pm2 logs backend --lines 0 | grep -iE "/api/user/newBooking|newBooking"
```

### 6. Save Filtered Logs to File
```bash
# Save last 500 lines filtered for cash service + coupon to a file
pm2 logs backend --lines 500 --nostream | grep -iE "cash|coupon|book failed|booking|amount" > cash_coupon_failure.log

# Then view the file
cat cash_coupon_failure.log
```

### 7. View Logs with Timestamps
```bash
# View logs with timestamps (PM2 includes timestamps by default)
pm2 logs backend --lines 100 --timestamp

# Or view raw log files with timestamps
tail -f ~/.pm2/logs/backend-out.log
```

### 8. Search for Specific User/Booking ID
```bash
# If you have a specific booking ID or user ID
grep "USER_ID_OR_BOOKING_ID" ~/.pm2/logs/backend-error.log
grep "USER_ID_OR_BOOKING_ID" ~/.pm2/logs/backend-out.log
```

## Most Useful Command for Debugging

```bash
# This command shows real-time logs filtered for cash service + coupon failures
pm2 logs backend --lines 100 | grep -iE "cashAfterService|coupon|book failed|Amount mismatch|discount|selectedCouponId|createBooking"
```

## Alternative: View All Logs and Filter Manually

```bash
# View all recent logs (you can scroll and search)
pm2 logs backend --lines 200

# Then press Ctrl+F and search for:
# - "book failed"
# - "Amount mismatch"
# - "coupon"
# - "cashAfterService"
```

## Check Frontend Logs (if available on server)

If you have access to frontend logs:
```bash
# Check Flutter/Dart logs if running on server
# Or check browser console logs if accessible
```

## MongoDB Logs (if booking is partially created)

```bash
# Check MongoDB logs for database errors
sudo tail -f /var/log/mongodb/mongod.log | grep -i "error\|booking"
```

