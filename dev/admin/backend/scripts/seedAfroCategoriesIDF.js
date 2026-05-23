/**
 * Upsert les 5 catégories beauté afro IDF (voir authenticite/CATEGORIES_SERVICES_AFRO_IDF.md).
 *
 * Usage (depuis dev/admin/backend) :
 *   node scripts/seedAfroCategoriesIDF.js
 *
 * Variables d'environnement : même connexion Mongo que le backend (MONGODB_CONNECTION).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/category.model");

const CATEGORIES_IDF = [
  { name: "Tresses", nameEn: "Braids", nameFr: "Tresses", namePt: "Tranças" },
  { name: "Locks", nameEn: "Locks", nameFr: "Locks", namePt: "Locks" },
  { name: "Perruques", nameEn: "Wigs", nameFr: "Perruques", namePt: "Perucas" },
  { name: "Homme", nameEn: "Men", nameFr: "Homme", namePt: "Homem" },
  { name: "Esthétique", nameEn: "Glam", nameFr: "Esthétique", namePt: "Estética" },
];

async function run() {
  const uri = process.env.MONGODB_CONNECTION || process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_CONNECTION manquant dans .env");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("Connecté à MongoDB");

  for (const cat of CATEGORIES_IDF) {
    const result = await Category.findOneAndUpdate(
      { nameFr: cat.nameFr },
      {
        $set: {
          name: cat.name,
          nameEn: cat.nameEn,
          nameFr: cat.nameFr,
          namePt: cat.namePt,
          status: true,
          isDelete: false,
        },
      },
      { upsert: true, new: true }
    );
    console.log("OK:", result.nameFr, "→", result._id.toString());
  }

  const active = await Category.find({ isDelete: false, status: true }).select("nameFr nameEn");
  console.log("\nCatégories actives:", active.map((c) => c.nameFr).join(", "));
  console.log(
    "\nRappel : rattachez les services existants à ces catégories dans l'admin salon si besoin."
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
