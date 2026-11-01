/**
 * Platform Stripe Billing webhook (SaaS subscriptions + Partnero sales via Skedisy API).
 * Configure endpoint: POST /stripe/subscription/webhook
 * Env: STRIPE_SUBSCRIPTION_WEBHOOK_SECRET (or STRIPE_WEBHOOK_SECRET)
 */

const billing = require("../services/subscriptionBilling.service");

exports.handleSubscriptionWebhook = async (req, res) => {
  const stripe = require("stripe");
  const secretKey = (
    global.settingJSON?.stripeSecretKey ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  ).trim();
  const webhookSecret = (
    process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    ""
  ).trim();

  if (!secretKey || !webhookSecret) {
    return res.status(500).send("Stripe subscription webhook not configured.");
  }

  const stripeClient = stripe(secretKey);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("[stripeSubscriptionWebhook] signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;
    switch (event.type) {
      case "checkout.session.completed":
        await billing.handleCheckoutSessionCompleted(obj);
        break;
      case "invoice.paid":
        await billing.handleInvoicePaid(obj);
        break;
      case "customer.subscription.updated":
        await billing.handleSubscriptionUpdated(obj);
        break;
      case "customer.subscription.deleted":
        await billing.handleSubscriptionDeleted(obj);
        break;
      case "charge.refunded":
      case "invoice.payment_failed":
        // refunded: reverse Partnero sale when possible
        if (event.type === "charge.refunded") {
          await billing.handleInvoiceRefundedOrChargeRefunded(obj);
        }
        break;
      default:
        break;
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("[stripeSubscriptionWebhook]", error);
    return res.status(500).send("Webhook handler failed.");
  }
};
