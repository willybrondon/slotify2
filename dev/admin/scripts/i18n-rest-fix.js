/**
 * Corrige les libellés EN restants (audit vague 3).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
function norm(p) { return p.replace(/\\/g, "/"); }

const LABELS_BLOCK = `
  labels: {
    bookingType: "Type de réservation",
    selectDate: "Choisir une date",
    selectMonth: "Choisir un mois",
    paymentDate: "Date de paiement",
    addNew: "Ajouter",
    addCategory: "Ajouter une catégorie",
    addProductCategory: "Ajouter une catégorie produit",
    category: "Catégories",
    products: "Produits",
    addProducts: "Ajouter un produit",
    productCategory: "Catégorie produit",
    newHoliday: "Nouveau congé",
    todayPendingTitle: "Réservations en attente (aujourd'hui)",
    yearlyPayment: "Historique paiements par année",
    salonPayment: "Paiements salon",
    salonEarnings: "Revenus salon",
    salonOrders: "Commandes salon",
    walletHistory: "Historique portefeuille",
    expertEarningsDetail: "Détail gains pro",
    staffAttendanceData: "Détail des présences",
    selectMonthLabel: "Mois",
    bookingFeeDeduction: "Frais de réservation déduits",
    bookingComplete: "Réservation terminée",
    withdrawPending: "Retrait en attente",
    withdrawApproved: "Retrait validé",
    withdrawDeclined: "Retrait refusé",
    editOrder: "Modifier la commande",
    selectStatus: "Choisir le statut",
    cancelOrderChargesNote: "Frais d'annulation :",
    cannotCancelOrder: "Annulation impossible : le sous-total est inférieur aux frais d'annulation.",
    priceRequired: "Le prix est requis.",
    imagePathRequired: "Le chemin image est requis.",
    imageRequired: "L'image est requise.",
    openTimeRequired: "L'heure d'ouverture est requise.",
    dayRequired: "Le jour est requis.",
    closeTimeRequired: "L'heure de fermeture est requise.",
    dayRequiredBang: "Le jour est requis.",
    slotTimeRequired: "Le créneau est requis.",
    minWithdrawLabel: "Montant minimum de demande de retrait",
    cancelOrderChargesPct: "Frais annulation commande (%)",
    stripeSecretLabel: "Clé secrète Stripe",
    newItems: "Nouveaux articles",
    updatedItems: "Articles mis à jour",
    updateBtn: "Mettre à jour",
    salonBookingsTitle: "Réservations du salon",
    expertsTitle: "Coiffeur·se·s / pros",
    servicesTitle: "Prestations",
    salonTimeTitle: "Horaires salon",
    withdrawMoneyTitle: "Retrait",
    salonWithdrawRequest: "Demandes de retrait salon",
    paymentHistoryTitle: "Historique des paiements",
  },
`;

function injectLabels(copyPath) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (c.includes("labels: {")) return;
  c = c.replace(/\n};\s*$/, LABELS_BLOCK + "\n};\n");
  fs.writeFileSync(copyPath, c);
  console.log("labels injected", path.basename(copyPath));
}

injectLabels(path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"));
injectLabels(path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"));

// Add paymentDate to table if missing
for (const copyPath of [
  path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"),
  path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"),
]) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (!c.includes("paymentDate:") && c.includes("paymentDate: \"Date paiement\"")) {
    /* already as paymentDate in table */
  }
  if (c.includes("paymentDate: \"Date paiement\"")) {
    /* ok */
  } else if (c.includes("paymentMode:") && !c.match(/table:[\s\S]*paymentDate:/)) {
    c = c.replace(
      /(paymentDate: "Date paiement",)/,
      "$1"
    );
    if (!c.includes('paymentDate: "Date de paiement"')) {
      c = c.replace(
        /(paymentMode: "[^"]+",)/,
        '$1\n    paymentDateCol: "Date de paiement",'
      );
    }
  }
}

const SHARED = [
  ["Booking type", "{ui.labels.bookingType}"],
  ["Select date", "{ui.labels.selectDate}"],
  ["Select Month", "{ui.labels.selectMonth}"],
  ["Select month", "{ui.labels.selectMonth}"],
  ["Header: `Payment Date`", "Header: col.paymentDate"],
  ["text={`Add New`}", "text={ui.labels.addNew}"],
  ['text={`Add category`}', "text={ui.labels.addCategory}"],
  ['text={`Add Product Category`}', "text={ui.labels.addProductCategory}"],
  ['text={`Add Products`}', "text={ui.labels.addProducts}"],
  ['text={`Add Expert`}', "text={ui.pages.addExpert}"],
  ['text={`New holiday`}', "text={ui.actions.newHoliday}"],
  ["Title name={` Today's Pending Bookings`}", "Title name={ui.pages.todayPending}"],
  ['Title name="Year Wise Payment history"', "Title name={ui.labels.yearlyPayment}"],
  ['Title name="Salon payment"', "Title name={ui.labels.salonPayment}"],
  ['Title name="Salon earnings"', "Title name={ui.labels.salonEarnings}"],
  ['Title name={"Salon Orders"}', "Title name={ui.labels.salonOrders}"],
  ['Title name="Wallet History"', "Title name={ui.labels.walletHistory}"],
  ['Title name="Product Category"', "Title name={ui.labels.productCategory}"],
  ['Title name="Category"', "Title name={ui.nav.category}"],
  ['Title name="Experts"', "Title name={ui.pages.experts}"],
  ['Title name="Services"', "Title name={ui.pages.services}"],
  ['Title name="Salon time"', "Title name={ui.pages.salonTime}"],
  ['Title name="Withdraw Money"', "Title name={ui.withdraw.title}"],
  ['Title name="Salon Withdrawal Request"', "Title name={ui.labels.salonWithdrawRequest}"],
  ['Title name="Staff attendance data"', "Title name={ui.pages.staffAttendanceData}"],
  ['Title name={"Expert Earnings Details"}', "Title name={ui.labels.expertEarningsDetail}"],
  ["Booking Fee Deduction", "{ui.labels.bookingFeeDeduction}"],
  ["Booking Complete", "{ui.labels.bookingComplete}"],
  ['"Withdraw Pending"', "ui.labels.withdrawPending"],
  ['"Withdraw Approve"', "ui.labels.withdrawApproved"],
  ['"Withdraw Declined"', "ui.labels.withdrawDeclined"],
  ['row?.payoutStatus === 1 && "Withdraw Pending"', "row?.payoutStatus === 1 && ui.labels.withdrawPending"],
  ['row?.payoutStatus === 2 && "Withdraw Approve"', "row?.payoutStatus === 2 && ui.labels.withdrawApproved"],
  ['row?.payoutStatus === 3 && "Withdraw Declined"', "row?.payoutStatus === 3 && ui.labels.withdrawDeclined"],
  ['if (!price) error.price = "Price is Required"', "if (!price) error.price = ui.dialog.priceRequired"],
  ['error.imagePath = "Image Path is Required"', "error.imagePath = ui.dialog.imagePathRequired"],
  ['image: "Image is Required"', "image: ui.dialog.imageRequiredCategory"],
  ['errorMessage={`Image is required`}', "errorMessage={ui.dialog.imageRequiredCategory}"],
  ['<h2 className="text-theme m0">Edit Order</h2>', '<h2 className="text-theme m0">{ui.labels.editOrder}</h2>'],
  ['statusData === "Select status"', 'statusData === ui.labels.selectStatus'],
  ['setStatusData("Select status")', 'setStatusData(ui.labels.selectStatus)'],
  ['setStatusData(dialogueData?.item?.status || "Select status")', 'setStatusData(dialogueData?.item?.status || ui.labels.selectStatus)'],
  ["Your Cancel Order Charges", "ui.labels.cancelOrderChargesNote"],
  ["You cannot cancel the order as the SubTotal is less than the Cancel Order Charges", "ui.labels.cannotCancelOrder"],
  ['if (!openTime) error.openTime = "Open time is required"', "if (!openTime) error.openTime = ui.settings.openTimeRequired"],
  ['if (!day) error.day = "Day is required"', "if (!day) error.day = ui.labels.dayRequired"],
  ['if (!closeTime) error.closeTime = "Close time is required"', "if (!closeTime) error.closeTime = ui.settings.closeTimeRequired"],
  ['day: "Day is Required !"', "day: ui.labels.dayRequiredBang"],
  ['slotTime: "slotTime is Required !"', "slotTime: ui.labels.slotTimeRequired"],
  ['text={`New Items`}', "text={ui.labels.newItems}"],
  ['text={`Updated Items`}', "text={ui.labels.updatedItems}"],
  ['text={`Update`}', "text={ui.labels.updateBtn}"],
  ["Cancel Order Charges (%)", "{ui.labels.cancelOrderChargesPct}"],
  ["Minimum Withdrawal request amount", "{ui.labels.minWithdrawLabel}"],
  ["Stripe secret key", "{ui.settings.stripeSecretLabel}"],
  ['name: ` Name Is Required`', "name: ui.dialog.nameRequiredBang"],
];

const SETTING_INLINE = [
  ["stripePublishableKey: ` stripePublishableKey Is Required`", "stripePublishableKey: ui.settings.stripePublishableRequired"],
  ["stripeSecretKey: ` Stripe Secret Key Is Required`", "stripeSecretKey: ui.settings.stripeSecretRequired"],
  ["mtnMomoSubscriptionKey: ` MTN MoMo Subscription Key Is Required`", "mtnMomoSubscriptionKey: ui.settings.mtnSubscriptionRequired"],
  ["mtnMomoApiUserId: ` MTN MoMo API User ID Is Required`", "mtnMomoApiUserId: ui.settings.mtnApiUserRequired"],
  ["mtnMomoApiKey: ` MTN MoMo API Key Is Required`", "mtnMomoApiKey: ui.settings.mtnApiKeyRequired"],
  ["razorSecretKey: ` Razorpay Secret Key Is Required`", "razorSecretKey: ui.settings.razorSecretRequired"],
  ["razorPayId: ` razorPay Id Is Required`", "razorPayId: ui.settings.razorIdRequired"],
  ["flutterWaveKey: `FlutterWave Key Is Required`", "flutterWaveKey: ui.settings.flutterWaveRequired"],
  ["privacyPolicyLink: ` privacyPolicyLink Is Required`", "privacyPolicyLink: ui.settings.privacyPolicyRequired"],
  ["tnc: ` Terms And Condition Is Required`", "tnc: ui.settings.tncRequired"],
  ["tax: ` tax Is Required`", "tax: ui.settings.taxRequired"],
  ["cancelOrderCharges: ` Cancel Order Charges Is Required`", "cancelOrderCharges: ui.settings.cancelOrderRequired"],
  ["adminCommissionCharges: ` Admin Commission Is Required`", "adminCommissionCharges: ui.settings.adminCommissionRequired"],
  ["customerCommissionCharges: ` Customer Commission Charge Is Required`", "customerCommissionCharges: ui.settings.customerCommissionRequired"],
  ["salonCommissionCharges: ` Salon Commission Charge Is Required`", "salonCommissionCharges: ui.settings.salonCommissionRequired"],
  ["currencyName: ` currency Name Is Required`", "currencyName: ui.settings.currencyNameRequired"],
  ["currencySymbol: ` Currency Symbol Is Required`", "currencySymbol: ui.settings.currencySymbolRequired"],
  ["razorSecretKey: `WithdrawalRequestedAmount Key Is Required`", "minWithdrawalRequestedAmount: ui.settings.minWithdrawRequired"],
];

// Add missing settings keys for MTN
for (const copyPath of [path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js")]) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (!c.includes("mtnSubscriptionRequired")) {
    c = c.replace(
      "stripeSecretLabel: \"Clé secrète Stripe\",",
      `stripeSecretLabel: "Clé secrète Stripe",
    mtnSubscriptionRequired: "La clé d'abonnement MTN MoMo est requise.",
    mtnApiUserRequired: "L'API User ID MTN MoMo est requis.",
    mtnApiKeyRequired: "La clé API MTN MoMo est requise.",`
    );
    fs.writeFileSync(copyPath, c);
  }
}

for (const [app, key] of [
  ["salon", "SKEDISY_SALON_UI"],
  ["frontend", "SKEDISY_ADMIN_UI"],
]) {
  const importLine = `import { ${key} as ui } from "../../../constants/skedisyUiCopy";\n`;
  const comp = path.join(root, app, "src", "component");
  function walk(d, a = []) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p, a);
      else if (f.endsWith(".js")) a.push(p);
    }
    return a;
  }
  for (const f of walk(comp)) {
    let c = fs.readFileSync(f, "utf8");
    let changed = false;
    const maps = [...SHARED];
    if (norm(f).includes("setting/Setting.js")) maps.push(...SETTING_INLINE);
    for (const [from, to] of maps) {
      if (c.includes(from)) {
        c = c.split(from).join(to);
        changed = true;
      }
    }
    if (!changed) continue;
    if (!c.includes("skedisyUiCopy")) {
      const rel = path
        .relative(path.dirname(f), path.join(root, app, "src", "constants", "skedisyUiCopy.js"))
        .replace(/\\/g, "/")
        .replace(/\.js$/, "");
      const line = `import { ${key} as ui } from "${rel}";\n`;
      const m = c.match(/^import .+;\r?\n/m);
      if (m) {
        const idx = c.indexOf(m[0]) + m[0].length;
        c = c.slice(0, idx) + line + c.slice(idx);
      }
    }
    fs.writeFileSync(f, c);
    console.log(app, path.relative(comp, f));
  }
}

// dialog keys
for (const copyPath of [
  path.join(root, "salon", "src", "constants", "skedisyUiCopy.js"),
  path.join(root, "frontend", "src", "constants", "skedisyUiCopy.js"),
]) {
  let c = fs.readFileSync(copyPath, "utf8");
  if (!c.includes("imagePathRequired")) {
    c = c.replace(
      /priceRequired: "[^"]+",/,
      (m) =>
        m +
        '\n    imagePathRequired: "Le chemin de l\'image est requis.",'
    );
  }
  fs.writeFileSync(copyPath, c);
}

console.log("rest fix done");
