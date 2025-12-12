/**
 * Update existing salons to add claimToken if missing
 * Run this once to fix existing salons that don't have claimToken
 * 
 * Usage: node update_claim_tokens.js
 */

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Load .env from backend directory
const backendEnvPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  require('dotenv').config({ path: backendEnvPath });
} else {
  require('dotenv').config();
}

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';

function generateClaimToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function updateClaimTokens() {
  let client;
  
  try {
    if (!MONGODB_URI) {
      console.error('❌ MongoDB URI not configured');
      process.exit(1);
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const salonsCollection = db.collection('salons');

    // Find all salons without claimToken or with empty claimToken
    const salonsWithoutToken = await salonsCollection.find({
      $or: [
        { claimToken: { $exists: false } },
        { claimToken: '' },
        { claimToken: null }
      ]
    }).toArray();

    console.log(`\n📊 Found ${salonsWithoutToken.length} salons without claimToken`);

    if (salonsWithoutToken.length === 0) {
      console.log('✅ All salons already have claimToken!');
      return;
    }

    let updated = 0;
    for (const salon of salonsWithoutToken) {
      const newToken = generateClaimToken();
      await salonsCollection.updateOne(
        { _id: salon._id },
        { $set: { claimToken: newToken } }
      );
      updated++;
      console.log(`✅ Updated: ${salon.name} (${salon.email}) - Token: ${newToken.substring(0, 10)}...`);
    }

    console.log(`\n✅ Successfully updated ${updated} salons with claimToken`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateClaimTokens();

