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
const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';

// Get baseURL from environment (for image URLs)
// Ensure baseURL ends with / for proper path concatenation
let BASE_URL = process.env.baseURL || process.env.BASE_URL || '';
if (BASE_URL && !BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL + '/';
}

// Paths for image directories
const SCRAPING_IMAGES_DIR = path.join(__dirname, 'images');
const BACKEND_STORAGE_DIR = path.join(__dirname, '../backend/storage');

/**
 * Copy image from scraping_data/images to backend/storage
 * Returns the new path format: storage/filename.jpg
 */
function copyImageToStorage(imagePath) {
  try {
    // Handle relative paths like "images/filename.jpg"
    let sourcePath;
    if (imagePath.startsWith('images/')) {
      sourcePath = path.join(__dirname, imagePath);
    } else if (path.isAbsolute(imagePath)) {
      sourcePath = imagePath;
    } else {
      // Assume it's relative to scraping_data directory
      sourcePath = path.join(__dirname, imagePath);
    }

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.log(`      ⚠️  Image not found: ${imagePath}`);
      return null;
    }

    // Get filename from path
    const filename = path.basename(sourcePath);
    
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(BACKEND_STORAGE_DIR)) {
      fs.mkdirSync(BACKEND_STORAGE_DIR, { recursive: true });
      console.log(`      📁 Created storage directory: ${BACKEND_STORAGE_DIR}`);
    }

    // Destination path in storage
    const destPath = path.join(BACKEND_STORAGE_DIR, filename);

    // Check if file already exists in storage (skip copy if exists to avoid duplicates)
    if (fs.existsSync(destPath)) {
      // Verify it's the same file by comparing file sizes
      const sourceStats = fs.statSync(sourcePath);
      const destStats = fs.statSync(destPath);
      
      // If file sizes match, assume it's the same file and skip copy
      if (sourceStats.size === destStats.size) {
        // File already exists with same size, skip copy
        return `storage/${filename}`;
      } else {
        // File exists but different size - might be a different file with same name
        // Keep the existing file to avoid overwriting
        console.log(`      ℹ️  File ${filename} already exists in storage with different size, keeping existing`);
        return `storage/${filename}`;
      }
    }

    // Copy file to storage (only if it doesn't exist)
    fs.copyFileSync(sourcePath, destPath);
    return `storage/${filename}`;
  } catch (error) {
    console.log(`      ⚠️  Error copying image ${imagePath}: ${error.message}`);
    return null;
  }
}

/**
 * Process and copy images, returning updated paths with baseURL
 */
function processImages(salonData) {
  const processedImages = {
    mainImage: '',
    image: []
  };

  // Process mainImage
  if (salonData.mainImage) {
    const storagePath = copyImageToStorage(salonData.mainImage);
    if (storagePath) {
      // Format: {baseURL}storage/filename.jpg
      processedImages.mainImage = BASE_URL ? `${BASE_URL}${storagePath}` : storagePath;
    }
  }

  // Process image array
  if (salonData.image && Array.isArray(salonData.image)) {
    for (const imgPath of salonData.image) {
      if (imgPath) {
        const storagePath = copyImageToStorage(imgPath);
        if (storagePath) {
          // Format: {baseURL}storage/filename.jpg
          processedImages.image.push(BASE_URL ? `${BASE_URL}${storagePath}` : storagePath);
        }
      }
    }
  }

  // If no mainImage but we have images, use first image as mainImage
  if (!processedImages.mainImage && processedImages.image.length > 0) {
    processedImages.mainImage = processedImages.image[0];
  }

  return processedImages;
}

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
        if (!salonData.name || !salonData.password) {
          console.log(`⚠️  Skipping incomplete salon: ${salonData.name || 'Unknown'} (missing name or password)`);
          errors++;
          continue;
        }
        
        // Generate temporary email if not provided (salon will update when claiming)
        // Format: temp-{uniqueId}@skedisy-temp.com
        let email = salonData.email;
        if (!email || email.trim() === '') {
          const tempId = salonData.uniqueId || Math.floor(Math.random() * 10000000);
          email = `temp-${tempId}@skedisy-temp.com`;
          console.log(`ℹ️  Generated temporary email for ${salonData.name}: ${email} (salon will update when claiming)`);
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
        // Build query conditions - only check source_id if it's not empty
        const duplicateConditions = [
          { email: salonData.email },
          { uniqueId: uniqueId }
        ];
        
        // Only add source_id check if it's not empty (empty source_id would match all records)
        if (salonData.source_id && salonData.source_id.trim() !== '') {
          duplicateConditions.push({
            'source_id': salonData.source_id,
            'source': salonData.source
          });
        }
        
        const existing = await salonsCollection.findOne({
          $or: duplicateConditions
        }, { maxTimeMS: 10000 }); // 10 second timeout per query

        if (existing) {
          // Update existing salon instead of skipping
          console.log(`🔄 Updating existing salon: ${salonData.name} (${existing.email || existing.source_id || existing.uniqueId})`);
          
          // Process and copy images to storage (in case images changed)
          const processedImages = processImages(salonData);
          
          // Prepare update data
          const updateData = {
            $set: {
              name: salonData.name,
              email: email,  // Use the email (real or temporary)
              mobile: salonData.mobile || existing.mobile,
              about: salonData.about || existing.about,
              mainImage: processedImages.mainImage || existing.mainImage,
              image: processedImages.image.length > 0 ? processedImages.image : existing.image,
              addressDetails: {
                addressLine1: salonData.addressDetails?.addressLine1 || existing.addressDetails?.addressLine1 || '',
                landMark: salonData.addressDetails?.landMark || existing.addressDetails?.landMark || '',
                city: salonData.addressDetails?.city || existing.addressDetails?.city || '',
                state: salonData.addressDetails?.state || existing.addressDetails?.state || '',
                country: salonData.addressDetails?.country || existing.addressDetails?.country || '',
              },
              locationCoordinates: {
                latitude: salonData.locationCoordinates?.latitude || existing.locationCoordinates?.latitude || '',
                longitude: salonData.locationCoordinates?.longitude || existing.locationCoordinates?.longitude || '',
              },
              platformFee: salonData.platformFee !== undefined ? salonData.platformFee : existing.platformFee,
              source: salonData.source || existing.source,
              source_id: salonData.source_id || existing.source_id,
              updatedAt: new Date(),
            }
          };
          
          // Update the salon
          await salonsCollection.updateOne(
            { _id: existing._id },
            updateData,
            { maxTimeMS: 30000 }
          );
          
          console.log(`✅ Updated: ${salonData.name} (${salonData.addressDetails?.city || 'Unknown'}) - ID: ${existing.uniqueId}`);
          imported++;
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

        // Process and copy images to storage
        if (salonData.mainImage || (salonData.image && salonData.image.length > 0)) {
          console.log(`  📸 Processing images for ${salonData.name}...`);
        }
        const processedImages = processImages(salonData);

        // Prepare salon data with proper structure
        const salonDataWithId = {
          ...salonData,
          email: email,  // Use the email (real or temporary)
          uniqueId: uniqueId,
          mainImage: processedImages.mainImage,
          image: processedImages.image,
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
    console.log(`✅ Imported/Updated: ${imported}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(60));
    console.log('Note: "Imported/Updated" includes both new imports and updates to existing salons.');

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

