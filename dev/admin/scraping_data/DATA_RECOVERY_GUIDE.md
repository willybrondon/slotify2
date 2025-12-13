# Data Recovery Guide - Restore Deleted Salons

## Quick Recovery (Recommended)

### Option 1: Use Recovery Script (Easiest)

I've created a script to automatically recover soft-deleted salons:

```bash
cd dev/admin/scraping_data
node recover_deleted_salons.js
```

**What it does:**
- Finds all salons with `isDelete: true` (soft-deleted)
- Restores them by setting `isDelete: false`
- Also restores associated experts
- Shows you what was recovered

**Output example:**
```
✅ Connected to MongoDB
📊 Found 15 soft-deleted salons

📋 Soft-deleted salons:
   1. Salon Name 1 (email1@example.com) - Claimed: true
   2. Salon Name 2 (email2@example.com) - Claimed: false
   ...

✅ Successfully restored 15 salons
   - Matched: 15
   - Modified: 15
```

---

## Manual Recovery Options

### Option 2: MongoDB Shell (Direct Database Access)

If you have direct access to MongoDB:

```javascript
// Connect to MongoDB
use your_database_name

// Check how many salons are soft-deleted
db.salons.countDocuments({ isDelete: true })

// See the deleted salons
db.salons.find({ isDelete: true }).pretty()

// Restore ALL soft-deleted salons
db.salons.updateMany(
  { isDelete: true },
  { $set: { isDelete: false } }
)

// Restore soft-deleted experts
db.experts.updateMany(
  { isDelete: true },
  { $set: { isDelete: false } }
)

// Verify restoration
db.salons.countDocuments({ isDelete: false })
```

### Option 3: Restore Specific Salons Only

If you only want to restore specific salons:

```javascript
// Restore by email
db.salons.updateMany(
  { email: "salon@example.com", isDelete: true },
  { $set: { isDelete: false } }
)

// Restore by salon name
db.salons.updateMany(
  { name: "Salon Name", isDelete: true },
  { $set: { isDelete: false } }
)

// Restore only claimed salons
db.salons.updateMany(
  { isDelete: true, isClaimed: true },
  { $set: { isDelete: false } }
)
```

---

## Database Backup Recovery

### Option 4: Restore from Backup

If you have database backups:

1. **Check your backup location:**
   ```bash
   # Common backup locations
   ls -la /var/backups/mongodb/
   ls -la ~/backups/
   ```

2. **Restore from MongoDB dump:**
   ```bash
   # Restore entire database
   mongorestore --uri="mongodb://localhost:27017/your_database" /path/to/backup/
   
   # Restore specific collection
   mongorestore --uri="mongodb://localhost:27017/your_database" \
     --collection=salons /path/to/backup/salons.bson
   ```

3. **If using MongoDB Atlas:**
   - Go to your Atlas dashboard
   - Click "Backups" tab
   - Select a backup point before deletion
   - Click "Restore" or "Download"

---

## Step-by-Step Recovery Process

### Step 1: Check What Was Deleted

```bash
cd dev/admin/scraping_data
node recover_deleted_salons.js
```

This will show you:
- How many salons are soft-deleted
- Which salons were deleted
- Whether they were claimed or not

### Step 2: Decide Recovery Strategy

**If all salons should be restored:**
- Run the recovery script as-is (it restores all)

**If only specific salons should be restored:**
- Modify the script or use MongoDB shell with filters

**If you have a backup:**
- Restore from backup (safest option)

### Step 3: Execute Recovery

**Using the script:**
```bash
node recover_deleted_salons.js
```

**Or manually via MongoDB:**
```javascript
db.salons.updateMany({ isDelete: true }, { $set: { isDelete: false } })
```

### Step 4: Verify Recovery

1. **Check admin dashboard:**
   - Go to https://skedisy.com/admin
   - Check if salons appear in the list
   - Verify claim metrics are correct

2. **Check database directly:**
   ```javascript
   // Count active salons
   db.salons.countDocuments({ isDelete: false })
   
   // Count claimed salons
   db.salons.countDocuments({ isDelete: false, isClaimed: true })
   ```

3. **Test salon login:**
   - Try logging in with a recovered salon
   - Should work if salon was claimed

---

## Prevention for Future

### 1. Enable Database Backups

**MongoDB Atlas (Cloud):**
- Automatic backups are enabled by default
- Keep backups for at least 7 days

**Self-hosted MongoDB:**
```bash
# Daily backup script
mongodump --uri="mongodb://localhost:27017/your_database" \
  --out=/backups/mongodb/$(date +%Y%m%d)
```

### 2. Add Backup Script

Create `dev/admin/scraping_data/backup_database.js`:

```javascript
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../backups');
const MONGODB_URI = process.env.MONGODB_URI;

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

exec(`mongodump --uri="${MONGODB_URI}" --out="${backupPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    return;
  }
  console.log('✅ Backup completed:', backupPath);
});
```

### 3. Review Delete Operations

The safeguards I added will:
- ✅ Require specific IDs for deletion
- ✅ Log all deletion operations
- ✅ Prevent accidental bulk deletes

---

## Troubleshooting

### Issue: Script can't connect to MongoDB

**Solution:**
1. Check `.env` file has correct `MONGODB_URI`
2. Verify MongoDB is running
3. Check network/firewall settings

### Issue: No salons found to recover

**Possible reasons:**
1. Data was hard-deleted (not soft-deleted)
2. Data is in a different database
3. Data was never deleted (check admin dashboard filters)

**Solution:**
- Check if salons exist: `db.salons.find().count()`
- Check if they're filtered: `db.salons.find({ isDelete: false }).count()`

### Issue: Salons restored but still not showing

**Check:**
1. Admin dashboard filters (`isActive: true`, `isDelete: false`)
2. Salon status (`isActive`, `isClaimed`)
3. Browser cache (try hard refresh: Ctrl+F5)

---

## Quick Commands Reference

```bash
# Run recovery script
cd dev/admin/scraping_data
node recover_deleted_salons.js

# Check MongoDB connection
mongosh "your_mongodb_uri"

# Count deleted salons
mongosh "your_mongodb_uri" --eval "db.salons.countDocuments({ isDelete: true })"

# Restore all deleted salons
mongosh "your_mongodb_uri" --eval "db.salons.updateMany({ isDelete: true }, { \$set: { isDelete: false } })"
```

---

## Need Help?

If recovery doesn't work:
1. Check backend logs for deletion operations
2. Verify MongoDB connection string
3. Check if data exists in database (might be filtering issue)
4. Consider restoring from backup if available

---

## Summary

**Easiest Recovery Method:**
```bash
cd dev/admin/scraping_data
node recover_deleted_salons.js
```

This will automatically restore all soft-deleted salons and experts!

