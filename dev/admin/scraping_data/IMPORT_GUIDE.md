# Import Scraped Salons to Skedisy Database - Complete Guide

## 📋 Overview

After scraping salon data and generating JSON/CSV files, you need to import them into the Skedisy database. This guide walks you through the complete process.

## 🎯 What Happens After Import

Once imported, salons will be:
- ✅ **Visible in Salon Panel** (but inactive until claimed)
- ✅ **Visible on Customer App** (but inactive until claimed)
- ✅ **Visible on Skedisy.com web pages** (but inactive until claimed)
- ⚠️ **Status**: `isActive: false` and `isClaimed: false` (salons must claim their profile first)

## 📝 Prerequisites

1. ✅ JSON file generated from scraper (e.g., `salons_ile_de_france_20251207_180758.json`)
2. ✅ MongoDB database running and accessible
3. ✅ Node.js installed
4. ✅ Backend dependencies installed

## 🔧 Step 1: Configure Database Connection

### Option A: Use Environment Variable (Recommended)

1. Create or edit `.env` file in `dev/admin/backend/` directory:
```env
MONGODB_URI=mongodb://localhost:27017/skedisy
# OR for remote MongoDB:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skedisy
```

### Option B: Update Import Script Directly

Edit `scraping_data/import_to_skedisy.js` and update line 15:
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skedisy';
```

## 🚀 Step 2: Run the Import Script

### From the project root:

```bash
cd scraping_data
node import_to_skedisy.js salons_ile_de_france_20251207_180758.json
```

### What the script does:

1. ✅ Connects to MongoDB
2. ✅ Reads the JSON file
3. ✅ Checks for duplicates (by email or source_id)
4. ✅ Creates salon records with:
   - Generated unique ID
   - Default password (salon will change when claiming)
   - Default opening hours
   - `isActive: false` (inactive until claimed)
   - `isClaimed: false` (not yet claimed)
   - Source information (google_places, etc.)
5. ✅ Shows import summary

## 📊 Step 3: Verify Import

### Check in MongoDB:

```bash
# Connect to MongoDB
mongo skedisy

# Count imported salons
db.salons.countDocuments({ source: "google_places" })

# View sample salon
db.salons.findOne({ source: "google_places" })
```

### Check via Backend API:

```bash
# Get all salons (including inactive)
curl http://localhost:5000/api/admin/salon/getAll?start=0&limit=10

# Check specific salon
curl http://localhost:5000/api/admin/salon/getSalonById?salonId=SALON_ID
```

## 🌐 Step 4: Verify Visibility

### 1. **Salon Panel** (`/salonpanel/`)
- Salons will appear in the admin panel
- Status: Inactive (grayed out)
- Admin can activate manually or wait for salon to claim

### 2. **Customer App**
- Salons will appear in search results
- Status: Inactive (won't accept bookings)
- Users can see salon details but can't book

### 3. **Web Pages** (`skedisy.com`)
- Salons will appear on category/service pages
- Status: Inactive (won't accept bookings)
- "Book Your Appointment" button will show "Inactive" or redirect to app

## ⚙️ Step 5: Activate Salons (Two Options)

### Option A: Manual Activation (Admin)

1. Go to Admin Panel → Salons
2. Find imported salons
3. Click "Activate" for each salon
4. Salon becomes active and can receive bookings

### Option B: Claim System (Recommended)

1. **Send Claim Invitations** to salons via email/SMS
2. Salon clicks claim link with `claimToken`
3. Salon creates account and claims profile
4. Salon automatically becomes active (`isActive: true`, `isClaimed: true`)

## 🔍 Troubleshooting

### Error: "Cannot find module 'mongoose'"
```bash
cd dev/admin/backend
npm install
```

### Error: "Connection refused"
- Check MongoDB is running: `mongod` or check service status
- Verify connection string in `.env` file
- Check firewall/network settings

### Error: "Duplicate key error"
- Script automatically skips duplicates
- Check if salon already exists in database

### Error: "Validation error"
- Check JSON file structure matches salon model
- Ensure required fields are present: `name`, `email`, `password`, `addressDetails`

### Salons not visible
- Check `isActive` status (should be `false` initially)
- Check `isDelete` status (should be `false`)
- Verify database query filters

## 📈 Import Statistics

After import, you'll see:
```
============================================================
Import Summary:
✅ Imported: 120
⏭️  Skipped (duplicates): 5
❌ Errors: 0
============================================================
```

## 🎯 Next Steps After Import

1. **Review Imported Data**
   - Check CSV file for data quality
   - Verify addresses, phone numbers, images

2. **Send Claim Invitations** (if using claim system)
   - Generate claim links with `claimToken`
   - Send via email/SMS to salons
   - Track claim rate

3. **Monitor Activation**
   - Track how many salons claim their profiles
   - Follow up with unclaimed salons
   - Manually activate high-value salons

4. **Update Salon Information**
   - Add missing services
   - Update opening hours
   - Add more images
   - Verify contact information

## 🔐 Security Notes

- ⚠️ Default passwords are randomly generated
- ⚠️ Salons must change password when claiming
- ⚠️ Inactive salons cannot receive bookings
- ⚠️ Only claimed salons can manage their profiles

## 📞 Support

If you encounter issues:
1. Check MongoDB connection
2. Verify JSON file structure
3. Check backend logs
4. Review salon model requirements

---

**Ready to import?** Run:
```bash
cd scraping_data
node import_to_skedisy.js salons_ile_de_france_20251207_180758.json
```

