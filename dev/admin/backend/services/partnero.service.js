/**
 * Partnero — affiliation Ambassadeurs Skedisy.
 * Phase 1: customers (signup)
 * Phase 2: transactions (sales) via API — sans brancher l'app Stripe Partnero.
 */

const https = require("https");

function isConfigured() {
  return Boolean(String(process.env.PARTNERO_PROGRAM_ID || "").trim());
}

function getProgramId() {
  return String(process.env.PARTNERO_PROGRAM_ID || "").trim();
}

function hasApiKey() {
  return Boolean(String(process.env.PARTNERO_API_KEY || "").trim());
}

function postJson(pathname, body, apiKey) {
  const payload = JSON.stringify(body);
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.partnero.com",
        path: pathname,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 12000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let data = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch (_) {
            data = { raw };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );
    req.on("error", (err) => resolve({ status: 0, data: { message: err.message } }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, data: { message: "timeout" } });
    });
    req.write(payload);
    req.end();
  });
}

function deleteJson(pathname, apiKey) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.partnero.com",
        path: pathname,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        timeout: 12000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let data = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch (_) {
            data = { raw };
          }
          resolve({ status: res.statusCode || 0, data });
        });
      }
    );
    req.on("error", (err) => resolve({ status: 0, data: { message: err.message } }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 0, data: { message: "timeout" } });
    });
    req.end();
  });
}

/**
 * Create / link referred customer after salon self-register.
 */
async function createReferredCustomer({
  partnerKey,
  customerKey,
  email,
  name,
}) {
  const apiKey = String(process.env.PARTNERO_API_KEY || "").trim();
  const key = String(customerKey || "").trim();
  if (!apiKey || !key) {
    return {
      ok: false,
      skipped: true,
      reason: !apiKey ? "no_api_key" : "no_customer_key",
    };
  }

  const body = {
    key,
    email: String(email || "").trim().toLowerCase() || undefined,
    name: String(name || "").trim().slice(0, 100) || undefined,
  };
  const partner = String(partnerKey || "").trim();
  if (partner) {
    body.partner = { key: partner };
  }

  const res = await postJson("/v1/customers", body, apiKey);
  if (!res.status || res.status >= 400) {
    console.warn(
      "[partnero] customers create failed",
      res.status,
      res.data?.message || res.data
    );
    return { ok: false, status: res.status, data: res.data };
  }
  return { ok: true, data: res.data };
}

/**
 * Record a paid sale for commission (subscription invoice / checkout).
 * Idempotent if `key` (e.g. Stripe invoice id) already exists.
 */
async function createSaleTransaction({
  customerKey,
  customerEmail,
  partnerKey,
  transactionKey,
  amount,
  currency,
  productId,
  productType,
}) {
  const apiKey = String(process.env.PARTNERO_API_KEY || "").trim();
  const cKey = String(customerKey || "").trim();
  const txnKey = String(transactionKey || "").trim();
  const amt = Number(amount);
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "no_api_key" };
  }
  if (!cKey && !customerEmail) {
    return { ok: false, skipped: true, reason: "no_customer" };
  }
  if (!txnKey || !(amt > 0)) {
    return { ok: false, skipped: true, reason: "invalid_txn" };
  }

  const body = {
    key: txnKey,
    amount: amt,
    amount_units: String(currency || "EUR").toUpperCase(),
    action: "sale",
    customer: {},
  };
  if (cKey) body.customer.key = cKey;
  if (customerEmail) body.customer.email = String(customerEmail).toLowerCase();
  if (productId) body.product_id = String(productId);
  if (productType) body.product_type = String(productType);

  const partner = String(partnerKey || "").trim();
  if (partner) {
    body.partner = { key: partner };
    body.options = { create_customer: true };
    if (!body.customer.name && body.customer.email) {
      body.customer.name = body.customer.email.split("@")[0];
    }
  }

  const res = await postJson("/v1/transactions", body, apiKey);
  // Duplicate key = already recorded → treat as success (idempotent)
  if (res.status === 400 && /duplicate/i.test(String(res.data?.message || ""))) {
    return { ok: true, duplicate: true, data: res.data };
  }
  if (!res.status || res.status >= 400) {
    console.warn(
      "[partnero] transaction create failed",
      res.status,
      res.data?.message || res.data
    );
    return { ok: false, status: res.status, data: res.data };
  }
  return { ok: true, data: res.data };
}

/**
 * Reverse a sale (refund) by transaction key when supported.
 */
async function deleteSaleTransaction(transactionKey) {
  const apiKey = String(process.env.PARTNERO_API_KEY || "").trim();
  const key = encodeURIComponent(String(transactionKey || "").trim());
  if (!apiKey || !key) {
    return { ok: false, skipped: true };
  }
  const res = await deleteJson(`/v1/transactions/${key}`, apiKey);
  if (!res.status || res.status >= 400) {
    console.warn(
      "[partnero] transaction delete failed",
      res.status,
      res.data?.message || res.data
    );
    return { ok: false, status: res.status, data: res.data };
  }
  return { ok: true, data: res.data };
}

/**
 * Inject PartneroJS + config flag before </head>.
 */
function injectTrackingSnippet(html) {
  const programId = getProgramId();
  if (!programId || typeof html !== "string") return html;
  if (
    html.includes("__partnerObject") ||
    html.includes("app.partnero.com/js/universal.js")
  ) {
    return html;
  }

  const snippet = `
<!-- PartneroJS (Skedisy Ambassadeurs) -->
<script>
(function(p,t,n,e,r,o){p['__partnerObject']=r;function f(){var c={a:arguments,q:[]};var r=this.push(c);return "number"!=typeof r?r:f.bind(c.q);}
f.q=f.q||[];p[r]=p[r]||f.bind(f.q);p[r].q=p[r].q||f.q;o=t.createElement(n);var _=t.getElementsByTagName(n)[0];o.async=1;
o.src=e+'?v'+(~~(new Date().getTime()/1e6));_.parentNode.insertBefore(o,_);})(window,document,'script','https://app.partnero.com/js/universal.js','po');
po('program', ${JSON.stringify(programId)}, 'load');
</script>
<script>window.SKEDISY_PARTNERO={enabled:true,programId:${JSON.stringify(programId)}};</script>
<!-- End PartneroJS -->
`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${snippet}</head>`);
  }
  return snippet + html;
}

module.exports = {
  isConfigured,
  getProgramId,
  hasApiKey,
  createReferredCustomer,
  createSaleTransaction,
  deleteSaleTransaction,
  injectTrackingSnippet,
};
