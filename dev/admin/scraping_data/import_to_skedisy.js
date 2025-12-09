/**
 * Import scraped salon data to Skedisy database
 * Usage: node import_to_skedisy.js salons_ile_de_france_TIMESTAMP.json
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import salon model (adjust path as needed)
const Salon = require('../backend/models/salon.model');

// MongoDB connection (matches backend configuration)
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || 'mongodb://localhost:27017/skedisy';

async function importSalons(jsonFile) {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

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
        // Check if salon already exists (by email or source_id)
        const existing = await Salon.findOne({
          $or: [
            { email: salonData.email },
            { 'source_id': salonData.source_id, 'source': salonData.source },
            { uniqueId: salonData.uniqueId }
          ]
        });

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${salonData.name} (${existing.email || existing.source_id})`);
          skipped++;
          continue;
        }

        // Ensure required fields are present
        if (!salonData.name || !salonData.email || !salonData.password) {
          console.log(`⚠️  Skipping incomplete salon: ${salonData.name || 'Unknown'} (missing required fields)`);
          errors++;
          continue;
        }

        // Ensure uniqueId is unique (regenerate if needed)
        let uniqueId = salonData.uniqueId;
        let isUniqueId = false;
        let attempts = 0;
        while (!isUniqueId && attempts < 10) {
          const existingId = await Salon.findOne({ uniqueId: uniqueId });
          if (!existingId) {
            isUniqueId = true;
          } else {
            uniqueId = Math.floor(Math.random() * 10000000);
            attempts++;
          }
        }

        if (!isUniqueId) {
          console.log(`⚠️  Could not generate unique ID for: ${salonData.name}`);
          errors++;
          continue;
        }

        // Create salon with updated uniqueId
        const salonDataWithId = { ...salonData, uniqueId };
        const salon = new Salon(salonDataWithId);
        await salon.save();
        
        console.log(`✅ Imported: ${salonData.name} (${salonData.addressDetails?.city || 'Unknown'}) - ID: ${uniqueId}`);
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

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Fatal error:', error);
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

