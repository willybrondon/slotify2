const Salon = require("../../models/salon.model");
const Expert = require("../../models/expert.model");
const SalonSettlement = require("../../models/salonSettlement.model");
const ExpertSettlement = require("../../models/expertSettlement.model");
const Setting = require("../../models/setting.model");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { generateInvoicePDF } = require("../../services/invoice.service");
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is configured
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

exports.allSalonSettlement = async (req, res) => {
  try {
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const type = parseInt(req.query.type) || "ALL";

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
    }

    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: {
          ...typeFilter,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                mainImage: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const [settlement, total] = await Promise.all([
      SalonSettlement.aggregate(pipeline),
      SalonSettlement.countDocuments({
        ...typeFilter,
        ...dateFilter,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      services: settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.ParticularSalonSettlement = async (req, res) => {
  try {
    if (!req.query.salonId) {
      return res.status(200).json({ status: false, message: "Invalid Details" });
    }
    const salon = await Salon.findById(req.query.salonId);
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;
    const type = parseInt(req.query.type) || "ALL";

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
    }

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: {
          salonId: salon._id,
          ...dateFilter,
          ...typeFilter,
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                mainImage: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const [settlement, total] = await Promise.all([
      SalonSettlement.aggregate(pipeline),
      SalonSettlement.countDocuments({
        salonId: salon._id,
        ...typeFilter,
        ...dateFilter,
      }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Data found",
      total: total ? total : 0,
      services: settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getParticularExpertSettlement = async (req, res) => {
  try {
    if (!req.query.expertId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const expert = await Expert.findById(req.query.expertId);

    if (!expert) {
      return res.status(200).send({ status: false, message: "expert not found" });
    }
    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const settlement = await ExpertSettlement.aggregate([
      {
        $match: {
          expertId: expert._id,
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                _id: 1,
                image: 1,
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $sort: { createdAt: 1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: settlement.length,
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.salonExpertSettlement = async (req, res) => {
  try {
    const salon = await Salon.findById(req.salon._id);
    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }
    let typeFilter;
    if (type !== "ALL") {
      typeFilter = {
        $match: { statusOfTransaction: type },
      };
    }
    if (!salon) {
      return res.status(200).json({ status: false, message: "Salon does not Exist" });
    }

    let dateFilter;
    const startDate = req.query.startDate || "ALL";
    const endDate = req.query.endDate || "ALL";
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const pipeline = [
      {
        $match: {
          salonId: salon._id,
          ...dateFilter,
          ...typeFilter,
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                mainImage: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                _id: 1,
                image: 1,
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      { $skip: skipAmount },
      { $limit: limit },
    ];

    const [settlement, total] = await Promise.all([ExpertSettlement.aggregate(pipeline), ExpertSettlement.countDocuments({ salonId: salon._id, ...typeFilter, ...dateFilter })]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: total ? total : 0,
      services: settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.getExpertSettlement = async (req, res) => {
  try {
    let dateFilter;
    const startDate = req.query.startDate || 0;
    const endDate = req.query.endDate || 20;
    const type = req.query.type;
    if (startDate != "ALL" && endDate != "ALL") {
      dateFilter = {
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    let typeFilter;
    if (type !== "ALL") {
      typeFilter = { statusOfTransaction: type };
    }
    
    const settlement = await ExpertSettlement.aggregate([
      {
        $match: {
          ...dateFilter,
          ...typeFilter,
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                _id: 1,
                mainImage: 1,
              },
            },
          ],
          as: "salon",
        },
      },
      {
        $unwind: "$salon",
      },
      {
        $lookup: {
          from: "experts",
          localField: "expertId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                fname: 1,
                lname: 1,
                _id: 1,
                image: 1,
              },
            },
          ],
          as: "expert",
        },
      },
      {
        $unwind: "$expert",
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Services found",
      total: settlement.length,
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.bonusPenalty = async (req, res) => {
  try {
    console.log("req.body", req.body);
    if (!req.query.settlementId || !req.body.bonus) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res.status(200).send({ status: false, message: "settlement not found" });
    }

    const salon = await Salon.findById(settlement.salonId);

    if (!salon) {
      return res.status(200).send({ status: false, message: "salon not found" });
    }

    settlement.bonus = parseInt(req.body.bonus);
    settlement.finalAmount = settlement.salonEarning + parseInt(req.body.bonus);
    settlement.note = req.body.note;
    await settlement.save();

    return res.status(200).json({
      status: true,
      message: "Bonus/Penalty updated Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.salonPayment = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId);
    if (!settlement) {
      return res.status(200).send({ status: false, message: "settlement not found" });
    }

    const salon = await Salon.findById(settlement.salonId);

    if (!salon) {
      return res.status(200).send({ status: false, message: "salon not found" });
    }

    settlement.statusOfTransaction = 1;

    settlement.paymentDate = moment().format("YYYY-MM-DD");
    await settlement.save();

    return res.status(200).json({
      status: true,
      message: "Salon paid Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.salonSettlementInfo = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await SalonSettlement.findById(req.query.settlementId)
      .populate({
        path: "bookingId",
        populate: {
          path: "expertId",
          select: "fname lname image _id",
        },
        populate: {
          path: "userId",
          select: "fname lname image _id",
        },
      })
      .populate({
        path: "salonId",
        select: "name",
      });

    return res.status(200).json({
      status: true,
      message: "data fetch Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

exports.expertSettlementInfo = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const settlement = await ExpertSettlement.findById(req.query.settlementId)
      .populate({
        path: "bookingId",
        populate: {
          path: "expertId",
          select: "fname lname image _id",
        },
        populate: {
          path: "userId",
          select: "fname lname image",
        },
      })
      .populate({
        path: "salonId",
        select: "name",
      });

    return res.status(200).json({
      status: true,
      message: "data fetch Successfully",
      settlement,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

/**
 * Generate and download PDF invoice for salon settlement
 * GET /api/admin/settlement/salon-invoice?settlementId=xxx
 */
exports.generateSalonInvoice = async (req, res) => {
  try {
    if (!req.query.settlementId) {
      return res.status(200).json({
        status: false,
        message: "Settlement ID is required"
      });
    }

    // Get settlement with populated salon
    const settlement = await SalonSettlement.findById(req.query.settlementId)
      .populate({
        path: "salonId",
        select: "name email mobile addressDetails"
      })
      .populate({
        path: "bookingId",
        select: "bookingId date amount salonEarning salonCommission"
      });

    if (!settlement) {
      return res.status(200).json({
        status: false,
        message: "Settlement not found"
      });
    }

    console.log(`[Invoice] Generating PDF invoice for settlement ${settlement._id}`);

    // Get currency from settings
    const setting = await Setting.findOne().select("currencyName currencySymbol").sort({ createdAt: -1 });
    const currencyCode = (setting?.currencyName || "EUR").toUpperCase();
    const currencySymbol = setting?.currencySymbol || (currencyCode === "XAF" ? "xaf" : currencyCode === "USD" ? "$" : "€");

    // Generate PDF
    const pdfPath = await generateInvoicePDF(settlement, settlement.bookingId || [], currencyCode, currencySymbol);

    // Send PDF as download
    const filename = path.basename(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('end', () => {
      // Optionally delete the file after sending (or keep for records)
      // fs.unlinkSync(pdfPath);
      console.log(`[Invoice] PDF sent successfully: ${filename}`);
    });

    fileStream.on('error', (error) => {
      console.error('[Invoice] Error streaming PDF:', error);
      res.status(500).json({
        status: false,
        error: "Error generating invoice"
      });
    });

  } catch (error) {
    console.error('[Invoice] Error generating invoice:', error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error"
    });
  }
};

/**
 * Send invoice via email to salon
 * POST /api/admin/settlement/send-salon-invoice
 * Body: { settlementId }
 */
exports.sendSalonInvoice = async (req, res) => {
  try {
    const { settlementId } = req.body;

    if (!settlementId) {
      return res.status(200).json({
        status: false,
        message: "Settlement ID is required"
      });
    }

    // Check SendGrid configuration
    if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL) {
      console.error('[Invoice] SendGrid not configured');
      return res.status(200).json({
        status: false,
        message: "Email service not configured. Please set SENDGRID_API_KEY and EMAIL in .env"
      });
    }

    // Get settlement with populated salon
    const settlement = await SalonSettlement.findById(settlementId)
      .populate({
        path: "salonId",
        select: "name email mobile addressDetails"
      })
      .populate({
        path: "bookingId",
        select: "bookingId date amount salonEarning salonCommission"
      });

    if (!settlement) {
      return res.status(200).json({
        status: false,
        message: "Settlement not found"
      });
    }

    // Get salon data (handle both populate and aggregation formats)
    let salon = null;
    if (settlement.salon) {
      salon = Array.isArray(settlement.salon) && settlement.salon.length > 0 
        ? settlement.salon[0] 
        : settlement.salon;
    } else if (settlement.salonId && typeof settlement.salonId === 'object') {
      salon = settlement.salonId;
    }
    
    if (!salon || !salon.email) {
      return res.status(200).json({
        status: false,
        message: "Salon email not found"
      });
    }

    console.log(`[Invoice] Generating and sending invoice to ${salon.email}`);

    // Get currency from settings
    const setting = await Setting.findOne().select("currencyName currencySymbol").sort({ createdAt: -1 });
    const currencyCode = (setting?.currencyName || "EUR").toUpperCase();
    const currencySymbol = setting?.currencySymbol || (currencyCode === "XAF" ? "xaf" : currencyCode === "USD" ? "$" : "€");

    // Generate PDF
    const pdfPath = await generateInvoicePDF(settlement, settlement.bookingId || [], currencyCode, currencySymbol);

    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    const filename = path.basename(pdfPath);

    // Prepare email
    const invoiceNumber = `INV-${settlement._id.toString().substring(0, 8).toUpperCase()}`;
    const settlementDate = moment(settlement.date || settlement.createdAt).format('MM/YYYY');

    const msg = {
      to: salon.email,
      from: process.env.EMAIL,
      subject: `Facture Skedisy - ${settlementDate} - ${invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Facture Skedisy</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${salon.name}</strong>,</p>
              
              <p>Veuillez trouver ci-joint votre facture pour la période de <strong>${settlementDate}</strong>.</p>
              
              <div class="invoice-details">
                <p><strong>Numéro de facture:</strong> ${invoiceNumber}</p>
                <p><strong>Période:</strong> ${settlementDate}</p>
                <p><strong>Montant total:</strong> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(settlement.finalAmount || 0)}</p>
                <p><strong>Statut:</strong> ${settlement.statusOfTransaction === 1 ? 'Payé' : 'En attente'}</p>
              </div>
              
              <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
              
              <p>Cordialement,<br>L'équipe Skedisy</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          content: pdfBase64,
          filename: filename,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send email
    await sgMail.send(msg);

    console.log(`[Invoice] Invoice sent successfully to ${salon.email}`);

    return res.status(200).json({
      status: true,
      message: "Invoice sent successfully via email",
      email: salon.email,
      invoiceNumber: invoiceNumber
    });

  } catch (error) {
    console.error('[Invoice] Error sending invoice:', error);
    
    // More detailed error message
    if (error.response) {
      console.error('[Invoice] SendGrid error details:', error.response.body);
    }

    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
      details: error.response?.body || null
    });
  }
};
