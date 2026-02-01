const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Generate PDF invoice for salon settlement
 * @param {Object} settlement - Settlement data with populated salon
 * @param {Array} bookings - Array of booking details (optional)
 * @param {String} currencyCode - Currency code (EUR, USD, XAF, etc.) - optional, defaults to EUR
 * @param {String} currencySymbol - Currency symbol (€, $, xaf, etc.) - optional
 * @returns {Promise<String>} - Path to generated PDF file
 */
exports.generateInvoicePDF = async (settlement, bookings = [], currencyCode = 'EUR', currencySymbol = '€') => {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, '../storage/invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate invoice filename
      const invoiceNumber = `INV-${settlement._id.toString().substring(0, 8).toUpperCase()}`;
      const filename = `invoice-${invoiceNumber}-${moment().format('YYYYMMDD')}.pdf`;
      const filePath = path.join(invoicesDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Get salon data (populated or direct)
      // Handle both aggregation result (salon array) and populate result (salonId object)
      let salon = null;
      if (settlement.salon) {
        // From aggregation (array) or single object
        salon = Array.isArray(settlement.salon) && settlement.salon.length > 0 
          ? settlement.salon[0] 
          : settlement.salon;
      } else if (settlement.salonId && typeof settlement.salonId === 'object') {
        // From populate (object)
        salon = settlement.salonId;
      }
      
      const salonName = salon?.name || 'Salon';
      const salonEmail = salon?.email || '';
      const salonAddress = salon?.addressDetails || {};
      const salonMobile = salon?.mobile || '';

      // Header
      doc.fontSize(24)
         .fillColor('#667eea')
         .text('SKEDISY', 50, 50, { align: 'left' });
      
      doc.fontSize(10)
         .fillColor('#666')
         .text('Plateforme de réservation de services de beauté', 50, 80);

      // Invoice title
      doc.fontSize(20)
         .fillColor('#000')
         .text('FACTURE', 50, 120, { align: 'left' });

      // Invoice details
      doc.fontSize(10)
         .fillColor('#333')
         .text(`Numéro de facture: ${invoiceNumber}`, 400, 120)
         .text(`Date: ${moment(settlement.date || settlement.createdAt).format('DD/MM/YYYY')}`, 400, 140)
         .text(`Période: ${settlement.date || moment(settlement.createdAt).format('MM/YYYY')}`, 400, 160);

      // Salon information
      doc.fontSize(12)
         .fillColor('#000')
         .text('Facturé à:', 50, 200)
         .fontSize(10)
         .fillColor('#333')
         .text(salonName, 50, 220);

      if (salonEmail) {
        doc.text(`Email: ${salonEmail}`, 50, 240);
      }
      if (salonMobile) {
        doc.text(`Téléphone: ${salonMobile}`, 50, 260);
      }
      if (salonAddress.addressLine1) {
        doc.text(`Adresse: ${salonAddress.addressLine1}`, 50, 280);
        if (salonAddress.city) {
          doc.text(`${salonAddress.city}${salonAddress.state ? ', ' + salonAddress.state : ''}`, 50, 300);
        }
      }

      // Settlement details table header
      let yPosition = 350;
      doc.fontSize(11)
         .fillColor('#000')
         .text('Détails du règlement', 50, yPosition);

      yPosition += 30;
      
      // Table header
      doc.fontSize(9)
         .fillColor('#fff')
         .rect(50, yPosition, 500, 25)
         .fill('#667eea');
      
      doc.text('Description', 60, yPosition + 8)
         .text('Montant', 450, yPosition + 8, { align: 'right' });

      yPosition += 30;

      // Settlement items
      doc.fillColor('#000');
      
      // Salon Earnings
      doc.rect(50, yPosition, 500, 20)
         .fill('#f5f5f5')
         .fillColor('#000')
         .text('Gains du salon', 60, yPosition + 6)
         .text(`${formatCurrency(settlement.salonEarning || 0, currencyCode, currencySymbol)}`, 450, yPosition + 6, { align: 'right' });
      yPosition += 25;

      // Commission
      if (settlement.salonCommission && settlement.salonCommission > 0) {
        doc.rect(50, yPosition, 500, 20)
           .fill('#fff')
           .fillColor('#000')
           .text(`Commission (${settlement.salonCommissionPercent || 0}%)`, 60, yPosition + 6)
           .text(`-${formatCurrency(settlement.salonCommission, currencyCode, currencySymbol)}`, 450, yPosition + 6, { align: 'right' });
        yPosition += 25;
      }

      // Bonus
      if (settlement.bonus && settlement.bonus > 0) {
        doc.rect(50, yPosition, 500, 20)
           .fill('#f5f5f5')
           .fillColor('#000')
           .text('Bonus', 60, yPosition + 6)
           .text(`+${formatCurrency(settlement.bonus, currencyCode, currencySymbol)}`, 450, yPosition + 6, { align: 'right' });
        yPosition += 25;
      }

      // Total line
      yPosition += 10;
      doc.fontSize(11)
         .fillColor('#000')
         .lineWidth(2)
         .moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 15;
      doc.fontSize(12)
         .fillColor('#667eea')
         .text('Montant total', 60, yPosition)
         .text(formatCurrency(settlement.finalAmount || 0, currencyCode, currencySymbol), 450, yPosition, { align: 'right' });

      // Payment status
      yPosition += 40;
      const statusText = getStatusText(settlement.statusOfTransaction);
      const statusColor = getStatusColor(settlement.statusOfTransaction);
      
      doc.fontSize(10)
         .fillColor(statusColor)
         .text(`Statut: ${statusText}`, 50, yPosition);

      if (settlement.paymentDate) {
        doc.text(`Date de paiement: ${moment(settlement.paymentDate).format('DD/MM/YYYY')}`, 50, yPosition + 20);
      }

      // Notes
      if (settlement.note) {
        yPosition += 50;
        doc.fontSize(9)
           .fillColor('#666')
           .text('Notes:', 50, yPosition)
           .text(settlement.note, 50, yPosition + 15, { width: 500 });
      }

      // Footer
      const pageHeight = doc.page.height;
      doc.fontSize(8)
         .fillColor('#999')
         .text('Merci pour votre confiance!', 50, pageHeight - 80, { align: 'center' })
         .text('Pour toute question, contactez-nous à support@skedisy.com', 50, pageHeight - 60, { align: 'center' })
         .text(`Généré le ${moment().format('DD/MM/YYYY à HH:mm')}`, 50, pageHeight - 40, { align: 'center' });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Format currency amount
 * @param {Number} amount - Amount to format
 * @param {String} currencyCode - Currency code (EUR, USD, XAF, etc.)
 * @param {String} currencySymbol - Currency symbol (€, $, xaf, etc.)
 */
function formatCurrency(amount, currencyCode = 'EUR', currencySymbol = '€') {
  // For XAF, use custom formatting since it doesn't have a standard symbol
  if (currencyCode.toUpperCase() === 'XAF') {
    return `${currencySymbol} ${(amount || 0).toFixed(2)}`;
  }
  
  // For other currencies, use Intl.NumberFormat
  try {
    // Map currency codes to locale
    const localeMap = {
      'EUR': 'fr-FR',
      'USD': 'en-US',
      'GBP': 'en-GB',
    };
    
    const locale = localeMap[currencyCode.toUpperCase()] || 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase()
    }).format(amount || 0);
  } catch (error) {
    // Fallback to simple formatting
    return `${currencySymbol} ${(amount || 0).toFixed(2)}`;
  }
}

/**
 * Get status text in French
 */
function getStatusText(status) {
  const statusMap = {
    0: 'En attente',
    1: 'Payé',
    2: 'En cours',
    3: 'Annulé'
  };
  return statusMap[status] || 'Inconnu';
}

/**
 * Get status color
 */
function getStatusColor(status) {
  const colorMap = {
    0: '#ff9800', // Orange for pending
    1: '#4caf50', // Green for paid
    2: '#2196f3', // Blue for processing
    3: '#f44336'  // Red for cancelled
  };
  return colorMap[status] || '#666';
}

