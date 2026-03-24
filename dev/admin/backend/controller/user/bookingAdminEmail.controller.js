const { processEmailAction } = require("../../services/bookingAdminEmail.service");

/**
 * Public GET — no API key. Used from admin email links only.
 * Example: GET /user/booking/public/email-action?token=...&action=accept|reject
 */
exports.handleEmailAction = async (req, res) => {
  try {
    const { token, action } = req.query;
    const result = await processEmailAction(token, action);

    const title = result.ok ? "Success" : "Error";
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui,sans-serif;padding:24px;max-width:560px;margin:0 auto;">
<h1 style="font-size:1.25rem;">${title}</h1>
<p>${result.message}</p>
<p><a href="${process.env.baseURL || "https://skedisy.com"}">Back to Skedisy</a></p>
</body></html>`;
    res.status(result.ok ? 200 : 400).setHeader("Content-Type", "text/html; charset=utf-8").send(html);
  } catch (error) {
    console.error("[bookingAdminEmail] handleEmailAction:", error);
    res.status(500).send("<html><body><p>Server error. Please try again later.</p></body></html>");
  }
};
