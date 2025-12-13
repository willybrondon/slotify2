/**
 * Recovery script to restore soft-deleted salons
 * This will set isDelete: false for salons that were accidentally soft-deleted
 * 
 * Usage: node recover_deleted_salons.js
 */

const { MongoClient } = require('mongodb');
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

async function recoverDeletedSalons() {
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

    // Find all soft-deleted salons
    const deletedSalons = await salonsCollection.find({ isDelete: true }).toArray();

    console.log(`\n📊 Found ${deletedSalons.length} soft-deleted salons`);

    if (deletedSalons.length === 0) {
      console.log('✅ No soft-deleted salons found. All salons are active!');
      return;
    }

    console.log('\n📋 Soft-deleted salons:');
    deletedSalons.forEach((salon, index) => {
      console.log(`   ${index + 1}. ${salon.name} (${salon.email}) - Claimed: ${salon.isClaimed || false}`);
    });

    // Ask for confirmation (in production, you might want to add readline for interactive confirmation)
    console.log('\n⚠️  WARNING: This will restore all soft-deleted salons.');
    console.log('   To restore specific salons only, modify this script.');
    console.log('\n   Restoring all soft-deleted salons...\n');

    // Restore all soft-deleted salons
    const result = await salonsCollection.updateMany(
      { isDelete: true },
      { $set: { isDelete: false } }
    );

    console.log(`✅ Successfully restored ${result.modifiedCount} salons`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);

    // Also restore associated experts
    const expertsCollection = db.collection('experts');
    const expertResult = await expertsCollection.updateMany(
      { isDelete: true },
      { $set: { isDelete: false } }
    );

    if (expertResult.modifiedCount > 0) {
      console.log(`\n✅ Also restored ${expertResult.modifiedCount} soft-deleted experts`);
    }

    console.log('\n✅ Recovery complete!');
    console.log('   Please check your admin dashboard to verify data is restored.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run recovery
recoverDeletedSalons();

