/**
 * Import scraped salon data to Skedisy database
 * Usage: node import_to_skedisy.js salons_ile_de_france_TIMESTAMP.json
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env from backend directory (where the actual .env file is)
const backendEnvPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  require('dotenv').config({ path: backendEnvPath });
} else {
  // Fallback to current directory
  require('dotenv').config();
}

// MongoDB connection (matches backend configuration)
// Use the connection string directly - if not in .env, use the provided one
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || 'mongodb://admin:dbadmin123@46.101.229.176:27017/slotify';

async function importSalons(jsonFile) {
  let client;
  try {
    // Connect to MongoDB with proper options using native driver
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
    
    // Use native MongoDB driver with proper connection options
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      connectTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      retryWrites: true,
      retryReads: true,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Verify connection with ping
    await client.db().admin().ping();
    console.log('✅ Connection verified and ready');
    
    // Get the database and collection
    const db = client.db();
    const salonsCollection = db.collection('salons');

    // Read JSON file
    const filePath = path.join(__dirname, jsonFile);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const salonsData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📄 Loaded ${salonsData.length} salons from ${jsonFile}`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const salonData of salonsData) {
      try {
        // Validate required fields before any database queries
        if (!salonData.name || !salonData.email || !salonData.password) {
          console.log(`⚠️  Skipping incomplete salon: ${salonData.name || 'Unknown'} (missing name, email, or password)`);
          errors++;
          continue;
        }

        // Ensure addressDetails.addressLine1 is present (required by schema)
        if (!salonData.addressDetails || !salonData.addressDetails.addressLine1) {
          console.log(`⚠️  Skipping incomplete salon: ${salonData.name} (missing addressDetails.addressLine1)`);
          errors++;
          continue;
        }

        // Ensure uniqueId exists, generate if missing
        let uniqueId = salonData.uniqueId;
        if (!uniqueId || uniqueId === 0) {
          uniqueId = Math.floor(Math.random() * 10000000);
        }

        // Check if salon already exists using native MongoDB driver
        const existing = await salonsCollection.findOne({
          $or: [
            { email: salonData.email },
            { 'source_id': salonData.source_id, 'source': salonData.source },
            { uniqueId: uniqueId }
          ]
        }, { maxTimeMS: 10000 }); // 10 second timeout per query

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${salonData.name} (${existing.email || existing.source_id || existing.uniqueId})`);
          skipped++;
          continue;
        }

        // If uniqueId is already taken, generate a new one (max 5 attempts to avoid infinite loop)
        let attempts = 0;
        while (attempts < 5) {
          const existingId = await salonsCollection.findOne(
            { uniqueId: uniqueId },
            { maxTimeMS: 10000 }
          );
          if (!existingId) {
            break; // uniqueId is available
          }
          uniqueId = Math.floor(Math.random() * 10000000);
          attempts++;
        }

        if (attempts >= 5) {
          console.log(`⚠️  Could not generate unique ID for: ${salonData.name}`);
          errors++;
          continue;
        }

        // Prepare salon data with proper structure
        const salonDataWithId = {
          ...salonData,
          uniqueId: uniqueId,
          // Ensure addressDetails structure matches schema
          addressDetails: {
            addressLine1: salonData.addressDetails.addressLine1 || '',
            landMark: salonData.addressDetails.landMark || '',
            city: salonData.addressDetails.city || '',
            state: salonData.addressDetails.state || '',
            country: salonData.addressDetails.country || '',
          },
          // Set defaults for required fields
          isActive: salonData.isActive !== undefined ? salonData.isActive : true,
          isDelete: salonData.isDelete !== undefined ? salonData.isDelete : false,
          isClaimed: salonData.isClaimed !== undefined ? salonData.isClaimed : false,
          // Add timestamps manually (MongoDB native driver doesn't auto-add them)
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Use native MongoDB insertOne (same as manual insert) - this avoids Mongoose buffering issues
        const result = await salonsCollection.insertOne(salonDataWithId, {
          maxTimeMS: 30000 // 30 second timeout for insert
        });
        
        console.log(`✅ Imported: ${salonData.name} (${salonData.addressDetails?.city || 'Unknown'}) - ID: ${uniqueId}, MongoDB ID: ${result.insertedId}`);
        imported++;

      } catch (error) {
        console.error(`❌ Error importing ${salonData.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Import Summary:');
    console.log(`✅ Imported: ${imported}`);
    console.log(`⏭️  Skipped (duplicates): ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));

    await client.close();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    // Ensure client is closed even on error
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
    process.exit(1);
  }
}

// Get filename from command line
const jsonFile = process.argv[2];
if (!jsonFile) {
  console.error('Usage: node import_to_skedisy.js <json_file>');
  console.error('Example: node import_to_skedisy.js salons_ile_de_france_20240101_120000.json');
  process.exit(1);
}

importSalons(jsonFile);

