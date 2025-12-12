const Salon = require("../../models/salon.model");
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid only if API key is configured
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[Claim Controller] SendGrid initialized with API key');
} else {
  console.error('[Claim Controller] ⚠️  WARNING: SENDGRID_API_KEY not found in environment variables');
  console.error('[Claim Controller] Email sending will fail. Please add SENDGRID_API_KEY to .env file');
}

const { sendSMS } = require("../../services/sms.service");

/**
 * Claim salon profile using token and email
 * POST /api/salon/claim
 */
exports.claimSalon = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(200).json({
        status: false,
        message: "Token, email, and password are required"
      });
    }

    // Find salon by email and claim token
    const salon = await Salon.findOne({
      email: email.trim(),
      claimToken: token.trim(),
      isDelete: false
    });

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Invalid claim token or email. Please check your invitation email."
      });
    }

    // Check if already claimed
    if (salon.isClaimed) {
      return res.status(200).json({
        status: false,
        message: "This salon profile has already been claimed."
      });
    }

    // Update salon: claim profile, set password, activate
    salon.isClaimed = true;
    salon.isActive = true;
    salon.password = password;
    salon.claimToken = ""; // Clear token after claiming
    await salon.save();

    return res.status(200).json({
      status: true,
      message: "Salon profile claimed successfully!",
      data: {
        salonId: salon._id,
        name: salon.name,
        email: salon.email,
        isActive: salon.isActive,
        isClaimed: salon.isClaimed
      }
    });
  } catch (error) {
    console.error("Claim salon error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * Send claim invitation email and/or SMS to salon
 * Used by admin to send invitation
 * Supports: email (default), sms, or both
 */
exports.sendClaimInvitation = async (req, res) => {
  try {
    const { salonId, method = 'email' } = req.body; // method: 'email', 'sms', or 'both'

    if (!salonId) {
      return res.status(200).json({
        status: false,
        message: "Salon ID is required"
      });
    }

    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(200).json({
        status: false,
        message: "Salon not found"
      });
    }

    if (salon.isClaimed) {
      return res.status(200).json({
        status: false,
        message: "This salon has already been claimed"
      });
    }

    // Generate claimToken if it doesn't exist or is empty
    if (!salon.claimToken || salon.claimToken.trim() === '') {
      const crypto = require('crypto');
      salon.claimToken = crypto.randomBytes(32).toString('hex');
      await salon.save();
      console.log(`[Claim Invitation] ✅ Generated new claimToken for salon ${salon.name} (ID: ${salon._id})`);
      console.log(`[Claim Invitation] Token length: ${salon.claimToken.length} characters`);
    } else {
      console.log(`[Claim Invitation] Using existing claimToken for salon ${salon.name}`);
    }

    // Verify token is not empty before generating link
    if (!salon.claimToken || salon.claimToken.trim() === '') {
      console.error(`[Claim Invitation] ❌ ERROR: claimToken is still empty after generation!`);
      return res.status(200).json({
        status: false,
        message: "Failed to generate claim token. Please try again."
      });
    }

    // Generate claim link - ensure baseURL doesn't have trailing slash (we add it)
    let baseURL = process.env.baseURL || '';
    if (baseURL && !baseURL.endsWith('/')) {
      baseURL = baseURL + '/';
    }
    const claimLink = `${baseURL}salon/claim?token=${salon.claimToken}&email=${encodeURIComponent(salon.email)}`;
    
    console.log(`[Claim Invitation] Generated claim link for ${salon.name}:`);
    console.log(`   Token: ${salon.claimToken.substring(0, 10)}... (length: ${salon.claimToken.length})`);
    console.log(`   Email: ${salon.email}`);
    console.log(`   Link: ${claimLink}`);
    
    // Verify link is correct
    if (claimLink.includes('token=&') || claimLink.includes('token=') && !salon.claimToken) {
      console.error(`[Claim Invitation] ❌ ERROR: Generated link has empty token!`);
      console.error(`[Claim Invitation] Link: ${claimLink}`);
      return res.status(200).json({
        status: false,
        message: "Failed to generate valid claim link. Please try again."
      });
    }

    const results = {
      email: null,
      sms: null
    };

    // Send email if method is 'email' or 'both'
    if (method === 'email' || method === 'both') {
      // Validate email configuration first
      if (!process.env.SENDGRID_API_KEY) {
        console.error("[Claim Invitation] ❌ ERROR: SENDGRID_API_KEY not configured in .env");
        results.email = { success: false, error: "SendGrid API key not configured" };
      } else if (!process.env.EMAIL) {
        console.error("[Claim Invitation] ❌ ERROR: EMAIL (from address) not configured in .env");
        results.email = { success: false, error: "Email from address not configured" };
      } else if (!salon.email || salon.email.trim() === '') {
        console.error(`[Claim Invitation] ❌ ERROR: Salon ${salon.name} (ID: ${salon._id}) does not have an email address`);
        results.email = { success: false, error: "Salon email address not found" };
      } else {
        // Create email template
        const emailHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
            h2 { color: #333; }
            p { color: #666; line-height: 1.6; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #0056b3; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Votre salon a été ajouté sur Skedisy</h2>
            <p>Bonjour,</p>
            <p>Votre salon <strong>${salon.name}</strong> a été ajouté sur Skedisy, la plateforme de réservation de services de beauté.</p>
            
            <p><strong>Réclamez votre profil pour:</strong></p>
            <ul>
              <li>Gérer vos réservations en ligne</li>
              <li>Augmenter votre visibilité</li>
              <li>Recevoir de nouveaux clients</li>
              <li>Suivre vos revenus et commissions</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${claimLink}" class="button">Réclamer mon profil</a>
            </p>
            
            <p>Ou copiez ce lien dans votre navigateur:</p>
            <p style="word-break: break-all; color: #007bff;">${claimLink}</p>
            
            <div class="footer">
              <p>Cordialement,<br>L'équipe Skedisy</p>
              <p style="font-size: 0.8em; color: #999;">Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

        const msg = {
          to: salon.email.trim(),
          from: process.env.EMAIL.trim(),
          subject: "Votre salon a été ajouté sur Skedisy - Réclamez votre profil",
          html: emailHtml,
        };

        try {
          console.log(`[Claim Invitation] 📧 Attempting to send email:`);
          console.log(`   To: ${salon.email}`);
          console.log(`   From: ${process.env.EMAIL}`);
          console.log(`   Salon: ${salon.name} (ID: ${salon._id})`);
          console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
          
          const emailResponse = await sgMail.send(msg);
          
          console.log(`[Claim Invitation] ✅ Email sent successfully!`);
          console.log(`   Status Code: ${emailResponse[0]?.statusCode}`);
          console.log(`   Response Headers:`, emailResponse[0]?.headers);
          
          results.email = { success: true, message: "Email sent successfully" };
        } catch (error) {
          console.error(`[Claim Invitation] ❌ Email send FAILED:`);
          console.error(`   To: ${salon.email}`);
          console.error(`   Error Message: ${error.message}`);
          console.error(`   Error Code: ${error.code}`);
          if (error.response?.body) {
            console.error(`   SendGrid Response:`, JSON.stringify(error.response.body, null, 2));
            if (error.response.body.errors) {
              error.response.body.errors.forEach((err, idx) => {
                console.error(`   Error ${idx + 1}: ${err.message} (field: ${err.field})`);
              });
            }
          }
          
          // Extract detailed error message
          let errorMessage = error.message || "Failed to send email";
          if (error.response?.body?.errors && error.response.body.errors.length > 0) {
            errorMessage = error.response.body.errors.map(e => e.message).join('; ');
          }
          
          results.email = { success: false, error: errorMessage };
        }
      }
    }

    // Send SMS if method is 'sms' or 'both'
    if (method === 'sms' || method === 'both') {
      if (!salon.mobile || salon.mobile.trim() === '') {
        console.log(`[Claim Invitation] ⚠️  Salon ${salon.name} (ID: ${salon._id}) does not have a mobile number`);
        results.sms = { success: false, error: "Salon mobile number not found" };
      } else {
        console.log(`[Claim Invitation] Attempting to send SMS to: ${salon.mobile} for salon: ${salon.name}`);
        const smsMessage = `Bonjour! Votre salon ${salon.name} a été ajouté sur Skedisy. Réclamez votre profil: ${claimLink}`;
        const smsResult = await sendSMS(salon.mobile, smsMessage);
        results.sms = smsResult;
        
        if (smsResult.success) {
          console.log(`[Claim Invitation] ✅ SMS sent successfully to ${salon.mobile}`);
        } else {
          console.error(`[Claim Invitation] ❌ SMS failed for ${salon.mobile}:`, smsResult.error);
        }
      }
    }

    // Return results - consider it success if at least one method succeeded
    const hasSuccess = (method === 'email' && results.email?.success) ||
                      (method === 'sms' && results.sms?.success) ||
                      (method === 'both' && (results.email?.success || results.sms?.success));

    let message = "Claim invitation sent successfully";
    if (method === 'both') {
      if (results.email?.success && results.sms?.success) {
        message = "Claim invitation sent via email and SMS";
      } else if (results.email?.success) {
        message = "Claim invitation sent via email (SMS failed or not configured)";
      } else if (results.sms?.success) {
        message = "Claim invitation sent via SMS (Email failed)";
      } else {
        message = "Failed to send invitation via email and SMS";
      }
    }

    return res.status(200).json({
      status: hasSuccess,
      message: message,
      data: {
        salonId: salon._id,
        salonName: salon.name,
        email: salon.email,
        mobile: salon.mobile,
        method: method,
        results: results
      }
    });
  } catch (error) {
    console.error("Send invitation error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * Bulk send claim invitations
 * POST /api/admin/salon/bulk-send-invitations
 */
exports.bulkSendInvitations = async (req, res) => {
  try {
    const { department, limit = 50 } = req.body;

    // Build query filter
    const filter = {
      isClaimed: false,
      isDelete: false
    };

    // Add department filter if provided (from metadata)
    if (department) {
      filter['metadata.department'] = department;
    }

    // Get unclaimed salons
    const salons = await Salon.find(filter)
      .limit(parseInt(limit))
      .select('_id name email claimToken metadata');

    if (salons.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No unclaimed salons found",
        sent: 0,
        failed: 0
      });
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    // Send invitations in batches
    for (const salon of salons) {
      try {
        const claimLink = `${process.env.baseURL}salon/claim?token=${salon.claimToken}&email=${encodeURIComponent(salon.email)}`;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); }
              h2 { color: #333; }
              p { color: #666; line-height: 1.6; }
              .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button:hover { background-color: #0056b3; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Votre salon a été ajouté sur Skedisy</h2>
              <p>Bonjour,</p>
              <p>Votre salon <strong>${salon.name}</strong> a été ajouté sur Skedisy, la plateforme de réservation de services de beauté.</p>
              
              <p><strong>Réclamez votre profil pour:</strong></p>
              <ul>
                <li>Gérer vos réservations en ligne</li>
                <li>Augmenter votre visibilité</li>
                <li>Recevoir de nouveaux clients</li>
                <li>Suivre vos revenus et commissions</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="${claimLink}" class="button">Réclamer mon profil</a>
              </p>
              
              <p>Ou copiez ce lien dans votre navigateur:</p>
              <p style="word-break: break-all; color: #007bff;">${claimLink}</p>
              
              <div class="footer">
                <p>Cordialement,<br>L'équipe Skedisy</p>
                <p style="font-size: 0.8em; color: #999;">Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const msg = {
          to: salon.email,
          from: process.env.EMAIL,
          subject: "Votre salon a été ajouté sur Skedisy - Réclamez votre profil",
          html: emailHtml,
        };

        await sgMail.send(msg);
        sent++;
        
        // Rate limiting: wait 1 second between emails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
        errors.push({
          salonId: salon._id,
          salonName: salon.name,
          error: error.message
        });
        console.error(`Failed to send invitation to ${salon.email}:`, error.message);
      }
    }

    return res.status(200).json({
      status: true,
      message: `Bulk invitation sending completed`,
      sent,
      failed,
      total: salons.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Bulk send invitations error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

