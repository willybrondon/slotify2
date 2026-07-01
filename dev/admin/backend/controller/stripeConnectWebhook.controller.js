const Salon = require("../models/salon.model");
const { syncConnectAccountStatus } = require("../services/stripeConnect.service");

exports.handleConnectWebhook = async (req, res) => {
  const stripe = require("stripe");
  const secretKey = (global.settingJSON?.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "").trim();
  const webhookSecret = (process.env.STRIPE_CONNECT_WEBHOOK_SECRET || "").trim();

  if (!secretKey || !webhookSecret) {
    return res.status(500).send("Stripe webhook not configured.");
  }

  const stripeClient = stripe(secretKey);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error("[stripeConnectWebhook] signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "account.updated") {
      const account = event.data.object;
      const salon = await Salon.findOne({ "stripeConnect.accountId": account.id });
      if (salon) {
        await syncConnectAccountStatus(salon);
        console.log(`[stripeConnectWebhook] Synced salon ${salon._id} account ${account.id}`);
      }
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("[stripeConnectWebhook]", error);
    return res.status(500).send("Webhook handler failed.");
  }
};
