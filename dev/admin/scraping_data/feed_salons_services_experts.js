/**
 * For every salon (not deleted): attach all catalog services (status=true, isDelete=false).
 * Salons with zero experts get one expert with the same email/password as the salon,
 * all services assigned, and an image (salon mainImage or generated avatar URL).
 *
 * Usage:
 *   node feed_salons_services_experts.js
 *   node feed_salons_services_experts.js --dry-run
 *   node feed_salons_services_experts.js --prices-only   (only refresh serviceIds + prices, no experts)
 *
 * Default price for each salon service when missing, null, or 0: 50 (override with DEFAULT_SERVICE_PRICE or --default-price=75).
 *
 * Requires backend/.env with MONGODB_CONNECTION_STRING or MONGODB_URI (same as import_to_skedisy.js).
 */

const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const backendEnvPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  require('dotenv').config({ path: backendEnvPath });
} else {
  require('dotenv').config();
}

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';
const DRY_RUN = process.argv.includes('--dry-run');
const PRICES_ONLY = process.argv.includes('--prices-only');

let DEFAULT_SERVICE_PRICE = Number(process.env.DEFAULT_SERVICE_PRICE);
if (Number.isNaN(DEFAULT_SERVICE_PRICE) || DEFAULT_SERVICE_PRICE <= 0) {
  DEFAULT_SERVICE_PRICE = 50;
}
const priceArg = process.argv.find((a) => a.startsWith('--default-price='));
if (priceArg) {
  const v = Number(priceArg.split('=')[1]);
  if (!Number.isNaN(v) && v > 0) DEFAULT_SERVICE_PRICE = v;
}

/** @param {string} salonName */
function expertImageUrl(salonName, mainImage) {
  const trimmed = (mainImage && String(mainImage).trim()) || '';
  if (trimmed) return trimmed;
  const name = encodeURIComponent((salonName || 'Expert').slice(0, 40));
  return `https://ui-avatars.com/api/?name=${name}&size=512&background=6366f1&color=fff`;
}

/**
 * If price is missing, null, NaN, or 0, use defaultPrice (non-zero existing prices are kept).
 * @param {unknown} price
 * @param {number} defaultPrice
 */
function normalizeSalonServicePrice(price, defaultPrice) {
  if (price === null || price === undefined || price === '') return defaultPrice;
  const n = Number(price);
  if (Number.isNaN(n) || n === 0) return defaultPrice;
  return n;
}

/**
 * Merge catalog into salon.serviceIds: keep allowCities; normalize prices (0/null → default).
 * @param {any[]} existing
 * @param {{ _id: ObjectId }[]} catalogServices
 * @param {number} defaultPrice
 */
function mergeServiceIds(existing, catalogServices, defaultPrice) {
  const existingById = new Map();
  for (const entry of existing || []) {
    if (!entry || !entry.id) continue;
    const sid = entry.id instanceof ObjectId ? entry.id.toString() : String(entry.id);
    existingById.set(sid, entry);
  }
  const merged = [];
  for (const svc of catalogServices) {
    const sid = svc._id.toString();
    const prev = existingById.get(sid);
    if (prev) {
      merged.push({
        id: svc._id,
        price: normalizeSalonServicePrice(prev.price, defaultPrice),
        allowCities: Array.isArray(prev.allowCities) ? prev.allowCities : [],
      });
    } else {
      merged.push({ id: svc._id, price: defaultPrice, allowCities: [] });
    }
  }
  return merged;
}

async function reserveUniqueExpertId(expertsCollection) {
  let uid = Math.floor(Math.random() * 9000000) + 1000000;
  for (let attempt = 0; attempt < 20; attempt++) {
    const clash = await expertsCollection.findOne({ uniqueId: uid }, { projection: { _id: 1 } });
    if (!clash) return uid;
    uid = Math.floor(Math.random() * 9000000) + 1000000;
  }
  return Math.floor(Date.now() % 9000000) + 1000000;
}

async function main() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_CONNECTION_STRING / MONGODB_URI in environment.');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 120000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
  });

  await client.connect();
  const db = client.db();
  const salonsCol = db.collection('salons');
  const servicesCol = db.collection('services');
  const expertsCol = db.collection('experts');

  const catalog = await servicesCol
    .find({ isDelete: { $ne: true }, status: true })
    .project({ _id: 1 })
    .toArray();

  if (catalog.length === 0) {
    console.error('No services found (isDelete: false, status: true). Aborting.');
    await client.close();
    process.exit(1);
  }

  console.log(`Catalog: ${catalog.length} services. Default service price: ${DEFAULT_SERVICE_PRICE}.`);
  if (PRICES_ONLY) console.log('Mode: --prices-only (services/prices only, no expert creation).');
  if (DRY_RUN) console.log('DRY RUN — no writes.\n');

  const serviceObjectIds = catalog.map((s) => s._id);
  let salonsUpdated = 0;
  let expertsCreated = 0;
  let skippedExpertNoCreds = 0;

  const salonCursor = salonsCol.find({ isDelete: { $ne: true } });

  for await (const salon of salonCursor) {
    const salonId = salon._id;
    const name = salon.name || 'Salon';

    const merged = mergeServiceIds(salon.serviceIds, catalog, DEFAULT_SERVICE_PRICE);

    if (!DRY_RUN) {
      await salonsCol.updateOne(
        { _id: salonId },
        { $set: { serviceIds: merged, updatedAt: new Date() } }
      );
    }
    salonsUpdated++;

    const expertCount = await expertsCol.countDocuments({
      salonId: salonId,
      isDelete: { $ne: true },
    });

    if (PRICES_ONLY || expertCount > 0) continue;

    const salonEmail = salon.email && String(salon.email).trim();
    const salonPassword = salon.password;
    const hasLoginCreds =
      salonEmail &&
      salonPassword != null &&
      String(salonPassword) !== '';

    if (!hasLoginCreds) {
      console.log(
        `  Skip expert for "${name}": need non-empty email and password (services still updated).`
      );
      skippedExpertNoCreds++;
      continue;
    }

    let expertEmail = salonEmail;
    const other = await expertsCol.findOne({
      email: expertEmail,
      salonId: { $ne: salonId },
    });
    if (other) {
      expertEmail = `staff-${salon.uniqueId || salonId.toString().slice(-8)}@skedisy-temp.com`;
      console.log(
        `  Note: email collision for salon "${name}" — expert uses ${expertEmail} (salon login unchanged).`
      );
    }

    const uniqueId = await reserveUniqueExpertId(expertsCol);
    const img = expertImageUrl(name, salon.mainImage);

    const doc = {
      fname: 'Staff',
      lname: name.length > 40 ? name.slice(0, 40) : name,
      email: expertEmail,
      age: 30,
      image: img,
      mobile: salon.mobile || '',
      gender: 'Other',
      fcmToken: '',
      isBlock: false,
      password: String(salonPassword),
      isDelete: false,
      isAttend: false,
      showDialog: false,
      uniqueId,
      salonId: salonId,
      serviceId: serviceObjectIds,
      commission: 0,
      earning: 0,
      bookingCount: 0,
      totalBookingCount: 0,
      review: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!DRY_RUN) {
      await expertsCol.insertOne(doc);
    }
    expertsCreated++;
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}Expert for "${name}": ${expertEmail}, services: ${serviceObjectIds.length}`);
  }

  await client.close();

  console.log('\n--- Summary ---');
  console.log(`Salons updated (service list): ${salonsUpdated}`);
  console.log(`Experts created: ${expertsCreated}`);
  console.log(`Experts skipped (missing email/password): ${skippedExpertNoCreds}`);
  if (DRY_RUN) console.log('Dry run: no database changes were applied.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
