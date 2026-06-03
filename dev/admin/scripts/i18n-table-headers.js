/**
 * Remplace Header: "..." par Header: col.key et ajoute import { col }.
 * Met à jour skedisyUiCopy.table avec les clés manquantes (FR).
 */
const fs = require("fs");
const path = require("path");

const EN_TO_KEY = {
  No: "no",
  "SR NO": "srNo",
  Image: "image",
  "Expert Image": "expertImage",
  "Salon Image": "salonImage",
  "User Image": "userImage",
  Name: "name",
  "Expert Name": "expertName",
  "Salon Name": "salonName",
  "User Name": "userName",
  "First Name": "firstName",
  "Last Name": "lastName",
  Date: "date",
  Info: "info",
  Accept: "accept",
  Reject: "reject",
  Action: "action",
  "Is Active": "isActive",
  Details: "details",
  "Created At": "createdAt",
  CreatedAt: "createdAt",
  CreatedDate: "createdAt",
  Product: "product",
  "Product Code": "productCode",
  "Shipping Charges": "shipping",
  "Shipping Charge": "shipping",
  "Create Status": "createStatus",
  "Order ID": "orderId",
  "User Info": "userInfo",
  Items: "items",
  Price: "price",
  "Admin Commission": "adminCommission",
  Status: "status",
  Service: "service",
  Tax: "tax",
  Reason: "reason",
  Day: "day",
  "Open Time": "openTime",
  "Close Time": "closeTime",
  "Closed Time": "closedTime",
  "Salon Break Start Time": "breakStart",
  "Salon Break End Time": "breakEnd",
  Edit: "edit",
  "BookingId": "bookingId",
  "Booking Id": "bookingId",
  User: "user",
  Review: "review",
  Rating: "rating",
  Expert: "expert",
  Category: "category",
  "Category Name": "categoryName",
  Duration: "duration",
  Time: "time",
  Present: "present",
  Absent: "absent",
  Pay: "pay",
  Email: "email",
  "Mobile No": "mobile",
  Country: "country",
  "Platform Fee (%)": "platformFee",
  Active: "active",
  "Best Seller": "bestSeller",
  Schedule: "schedule",
  Booking: "booking",
  Order: "order",
  Delete: "delete",
  Brand: "brand",
  Mrp: "mrp",
  "Is OutOfStock": "outOfStock",
  "Is Trending": "trending",
  "Is New Collection": "newCollection",
  Block: "block",
  About: "about",
  Commission: "commission",
  "Salon Commission": "salonCommission",
  "Salon Commission (%)": "salonCommissionPct",
  "Expert Earning": "expertEarning",
  "Admin Earning": "adminEarning",
  Earning: "earning",
  Earnings: "earnings",
  "Earnings (Expert)": "earningsExpert",
  "Earnings (Admin)": "earningsAdmin",
  Amount: "amount",
  "Payout Month": "payoutMonth",
  "Payment Status": "paymentStatus",
  "Settlement Type": "settlementType",
  "Settlement Date": "settlementDate",
  "Payment Date": "paymentDate",
  "First Slot": "firstSlot",
  "Total Bookings": "totalBookings",
  "Paid Payment": "paidPayment",
  "Service Earning": "serviceEarning",
  "Bonus/Penalty": "bonusPenalty",
  "Bonus-Penalty": "bonusPenalty",
  "Settlement Month": "settlementMonth",
  "Payment Mode": "paymentMode",
  "Transaction Type": "transactionType",
  "Transaction Completed": "transactionCompleted",
  "Transaction Details": "transactionDetails",
  UniqueId: "uniqueId",
  "Unique ID": "uniqueId",
  "Unique Id": "uniqueId",
  Credit: "credit",
  Debit: "debit",
  Quantity: "quantity",
  Month: "month",
  "Month Year": "monthYear",
  Note: "note",
  Notification: "notification",
  Total: "total",
  "Total Experts": "totalExperts",
  "Total Days": "totalDays",
  "Total Earning": "totalEarning",
  "Total Price": "totalPrice",
  "Total Revenue": "totalRevenue",
  "Total revenue": "totalRevenue",
  "Total Completed Bookings": "totalCompletedBookings",
  "Total Payment (To Expert)": "totalPaymentToExpert",
  "No. Booking": "noBooking",
  "No. Experts": "noExperts",
  "Service Amount": "serviceAmount",
  "Services Amount +": "servicesAmountPlus",
  "Admin Earning +": "adminEarningPlus",
  "Expert Earning +": "expertEarningPlus",
  "Salon Earning +": "salonEarningPlus",
  "Tax =": "taxEquals",
  " Tax ": "tax",
  " Tax +": "taxPlus",
  "+": "plus",
  "=": "eq",
  "Delivered Service": "deliveredService",
  "Item Detail": "itemDetail",
  "Booked At": "bookedAt",
  Cities: "cities",
  "Absent Days": "absentDays",
  "Available Days": "availableDays",
  "All Attendance Info": "allAttendanceInfo",
  Salon: "salon",
  "Salon ": "salon",
  gender: "gender",
  Gender: "gender",
  "Claim Status": "claimStatus",
  "Expert Info": "expertInfo",
  Title: "title",
  Description: "description",
  Code: "code",
  Invoice: "invoice",
  "Discount (%)": "discountPct",
  "Maximum Discount": "maxDiscount",
  Age: "age",
  isActive: "isActive",
  "Payment Type": "paymentType",
};

const FR_LABELS = {
  no: "N°",
  srNo: "N°",
  image: "Photo",
  expertImage: "Photo pro",
  salonImage: "Photo salon",
  userImage: "Photo cliente",
  name: "Nom",
  expertName: "Nom du pro",
  salonName: "Nom du salon",
  userName: "Nom cliente",
  firstName: "Prénom",
  lastName: "Nom",
  date: "Date",
  info: "Infos",
  accept: "Accepter",
  reject: "Refuser",
  action: "Action",
  isActive: "Actif",
  details: "Détails",
  createdAt: "Créé le",
  product: "Produit",
  productCode: "Code produit",
  shipping: "Livraison",
  createStatus: "Statut création",
  orderId: "N° commande",
  userInfo: "Cliente",
  items: "Articles",
  price: "Prix",
  adminCommission: "Commission plateforme",
  status: "Statut",
  reason: "Motif",
  day: "Jour",
  openTime: "Ouverture",
  closeTime: "Fermeture",
  closedTime: "Fermé à",
  breakStart: "Début pause",
  breakEnd: "Fin pause",
  edit: "Modifier",
  bookingId: "N° réservation",
  user: "Cliente",
  review: "Avis",
  rating: "Note",
  expert: "Pro",
  category: "Catégorie",
  categoryName: "Catégorie",
  duration: "Durée",
  time: "Heure",
  present: "Présent",
  absent: "Absent",
  pay: "Payer",
  email: "Email",
  mobile: "Tél.",
  country: "Pays",
  platformFee: "Frais plateforme (%)",
  active: "Actif",
  bestSeller: "Meilleures ventes",
  schedule: "Planning",
  booking: "Réservation",
  order: "Commande",
  delete: "Supprimer",
  brand: "Marque",
  mrp: "Prix public",
  outOfStock: "Rupture",
  trending: "Tendance",
  newCollection: "Nouveauté",
  block: "Bloquer",
  about: "À propos",
  commission: "Commission",
  salonCommission: "Commission salon",
  salonCommissionPct: "Commission salon (%)",
  expertEarning: "Gains pro",
  adminEarning: "Gains plateforme",
  earning: "Gain",
  earnings: "Gains",
  earningsExpert: "Gains (pro)",
  earningsAdmin: "Gains (plateforme)",
  amount: "Montant",
  payoutMonth: "Mois de paiement",
  paymentStatus: "Statut paiement",
  settlementType: "Type règlement",
  settlementDate: "Date règlement",
  paymentDate: "Date paiement",
  firstSlot: "Créneau",
  totalBookings: "Total réservations",
  paidPayment: "Montant payé",
  serviceEarning: "Gains prestations",
  bonusPenalty: "Bonus / pénalité",
  settlementMonth: "Mois de règlement",
  paymentMode: "Mode de paiement",
  transactionType: "Type",
  transactionCompleted: "Terminé",
  transactionDetails: "Détail transaction",
  uniqueId: "Référence",
  credit: "Crédit",
  debit: "Débit",
  quantity: "Quantité",
  month: "Mois",
  monthYear: "Mois / année",
  note: "Note",
  notification: "Notification",
  total: "Total",
  totalExperts: "Total pros",
  totalDays: "Total jours",
  totalEarning: "Gain total",
  totalPrice: "Prix total",
  totalRevenue: "Revenu total",
  totalCompletedBookings: "Réservations terminées",
  totalPaymentToExpert: "Paiement au pro",
  noBooking: "Nb réservations",
  noExperts: "Nb pros",
  serviceAmount: "Montant prestations",
  servicesAmountPlus: "Prestations +",
  adminEarningPlus: "Gains plateforme +",
  expertEarningPlus: "Gains pro +",
  salonEarningPlus: "Gains salon +",
  taxEquals: "Taxe =",
  tax: "Taxe",
  taxPlus: "Taxe +",
  plus: "+",
  eq: "=",
  deliveredService: "Prestation réalisée",
  itemDetail: "Détail article",
  bookedAt: "Réservé le",
  cities: "Villes",
  absentDays: "Jours d'absence",
  availableDays: "Jours disponibles",
  allAttendanceInfo: "Présences",
  salon: "Salon",
  gender: "Genre",
  claimStatus: "Réclamation fiche",
  expertInfo: "Infos pro",
  title: "Titre",
  description: "Description",
  code: "Code",
  invoice: "Facture",
  discountPct: "Remise (%)",
  maxDiscount: "Remise max.",
  age: "Âge",
  paymentType: "Type de paiement",
  bookings: "Réservations",
  showMore: "Voir plus",
  service: "Prestation",
  confirm: "Confirmer",
};

function walk(d, a = []) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p, a);
    else if (p.endsWith(".js")) a.push(p);
  }
  return a;
}

function mergeTableInCopy(copyPath, exportName) {
  let c = fs.readFileSync(copyPath, "utf8");
  const tableStart = c.indexOf("  table: {");
  const tableEnd = c.indexOf("\n  },", tableStart);
  if (tableStart < 0) return;
  let block = c.slice(tableStart, tableEnd);
  for (const [key, label] of Object.entries(FR_LABELS)) {
    if (block.includes(`${key}:`)) continue;
    block += `\n    ${key}: ${JSON.stringify(label)},`;
  }
  c = c.slice(0, tableStart) + block + c.slice(tableEnd);
  fs.writeFileSync(copyPath, c);
  console.log("merged table keys in", path.basename(copyPath));
}

function processFile(filePath, app, constantsDir) {
  let c = fs.readFileSync(filePath, "utf8");
  if (!/Header:\s*"/.test(c)) return false;

  let changed = false;
  for (const [en, key] of Object.entries(EN_TO_KEY)) {
    const re = new RegExp(`Header:\\s*"${en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g");
    if (re.test(c)) {
      c = c.replace(re, `Header: col.${key}`);
      changed = true;
    }
  }

  if (!changed) return false;

  if (!c.includes("tableHeaders")) {
    const rel = path
      .relative(path.dirname(filePath), path.join(constantsDir, "tableHeaders.js"))
      .replace(/\\/g, "/")
      .replace(/\.js$/, "");
    const importLine = `import { col } from "${rel.startsWith(".") ? rel : "./" + rel}";\n`;
    const m = c.match(/^import .+;\n/m);
    if (m) {
      const idx = c.indexOf(m[0]) + m[0].length;
      c = c.slice(0, idx) + importLine + c.slice(idx);
    } else {
      c = importLine + c;
    }
  }

  fs.writeFileSync(filePath, c);
  return true;
}

const root = path.join(__dirname, "..");
mergeTableInCopy(
  path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"),
  "SKEDISY_SALON_UI"
);
mergeTableInCopy(
  path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"),
  "SKEDISY_ADMIN_UI"
);

let n = 0;
for (const app of ["salon", "frontend"]) {
  const comp = path.join(root, app, "src", "component");
  const constants = path.join(root, app, "src", "constants");
  for (const f of walk(comp)) {
    if (processFile(f, app, constants)) {
      n++;
      console.log(app, path.relative(comp, f));
    }
  }
}
console.log("done", n, "files");
