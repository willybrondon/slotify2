/**
 * Plain-text line for iOS Mail / Android autofill (Security Code format).
 * @see https://developer.apple.com/documentation/security/securing_logins_with_automatic_strong_passwords
 */
function otpAutofillPlainLine(code) {
  const appName = process.env.projectName || "Skedisy";
  const domain = (process.env.OTP_AUTOFILL_DOMAIN || "skedisy.com").replace(/^@/, "");
  return `${code} is your ${appName} verification code.\n@${domain} #${code}`;
}

/** Subject line with code first — visible in mobile notification preview. */
function otpEmailSubject(code) {
  const appName = process.env.projectName || "Skedisy";
  return `${code} — ${appName}`;
}

function wrapOtpEmailHtml({ title, bodyHtml, code }) {
  const autofill = otpAutofillPlainLine(code);
  const preheader = otpEmailSubject(code);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; }
    .code { font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 0 0 16px; color: #111; }
    .muted { color: #666; font-size: 13px; }
    .autofill { color: #888; font-size: 11px; margin-top: 20px; white-space: pre-line; }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#ffffff;">${preheader}</div>
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">${autofill.replace(/\n/g, " ")}</div>
  <div class="container">
    <p class="code">${code}</p>
    ${title ? `<h2 style="margin-top:0;color:#111">${title}</h2>` : ""}
    ${bodyHtml}
    <p class="muted">${autofill.replace(/\n/g, "<br>")}</p>
    <p class="autofill">${autofill}</p>
  </div>
</body>
</html>`;
}

module.exports = { otpAutofillPlainLine, otpEmailSubject, wrapOtpEmailHtml };
