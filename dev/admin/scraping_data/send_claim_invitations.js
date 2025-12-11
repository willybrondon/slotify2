/**
 * Script to send claim invitations to salons
 * 
 * Usage:
 *   node send_claim_invitations.js --single <salonId> [--method email|sms|both]
 *   node send_claim_invitations.js --bulk [--limit 50] [--department 75] [--method email|sms|both]
 * 
 * Examples:
 *   node send_claim_invitations.js --single 507f1f77bcf86cd799439011
 *   node send_claim_invitations.js --bulk --limit 100 --method both
 *   node send_claim_invitations.js --bulk --department 75 --method sms
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load .env from backend directory
const backendEnvPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(backendEnvPath)) {
  require('dotenv').config({ path: backendEnvPath });
} else {
  require('dotenv').config();
}

const BASE_URL = process.env.baseURL || 'http://localhost:5000/';
const SECRET_KEY = process.env.secretKey || process.env.SECRET_KEY || '';

// Get admin token (you'll need to set this)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

if (!SECRET_KEY) {
  console.error('❌ Error: secretKey not found in .env file');
  console.error('   Please add: secretKey = your_secret_key');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const isSingle = args.includes('--single');
const isBulk = args.includes('--bulk');
const methodIndex = args.indexOf('--method');
const method = methodIndex !== -1 && args[methodIndex + 1] ? args[methodIndex + 1] : 'email';
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 && args[limitIndex + 1] ? parseInt(args[limitIndex + 1]) : 50;
const departmentIndex = args.indexOf('--department');
const department = departmentIndex !== -1 && args[departmentIndex + 1] ? args[departmentIndex + 1] : null;

// Get salonId for single send
let salonId = null;
if (isSingle) {
  const salonIdIndex = args.indexOf('--single');
  salonId = salonIdIndex !== -1 && args[salonIdIndex + 1] ? args[salonIdIndex + 1] : null;
}

async function sendSingleInvitation(salonId, method) {
  try {
    console.log(`📧 Sending ${method} invitation to salon ${salonId}...`);
    
    const response = await axios.post(
      `${BASE_URL}admin/salon/send-claim-invitation`,
      { salonId, method },
      {
        headers: {
          'key': SECRET_KEY,
          'Authorization': ADMIN_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      console.log(`✅ Success: ${response.data.message}`);
      console.log(`   Salon: ${response.data.data.salonName}`);
      console.log(`   Email: ${response.data.data.email}`);
      if (response.data.data.results) {
        console.log(`   Email: ${response.data.data.results.email?.success ? '✅' : '❌'}`);
        console.log(`   SMS: ${response.data.data.results.sms?.success ? '✅' : '❌'}`);
      }
    } else {
      console.log(`❌ Failed: ${response.data.message || response.data.error}`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data?.error || error.message);
  }
}

async function sendBulkInvitations(limit, department, method) {
  try {
    console.log(`📧 Sending bulk ${method} invitations...`);
    console.log(`   Limit: ${limit}`);
    if (department) {
      console.log(`   Department: ${department}`);
    }
    
    const payload = { limit, method };
    if (department) {
      payload.department = department;
    }

    const response = await axios.post(
      `${BASE_URL}admin/salon/bulk-send-invitations`,
      payload,
      {
        headers: {
          'key': SECRET_KEY,
          'Authorization': ADMIN_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      console.log(`✅ Bulk sending completed!`);
      console.log(`   Total: ${response.data.total}`);
      console.log(`   ✅ Sent: ${response.data.sent}`);
      console.log(`   ❌ Failed: ${response.data.failed}`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        console.log(`\n   Errors:`);
        response.data.errors.slice(0, 5).forEach(err => {
          console.log(`   - ${err.salonName}: ${err.error}`);
        });
        if (response.data.errors.length > 5) {
          console.log(`   ... and ${response.data.errors.length - 5} more errors`);
        }
      }
    } else {
      console.log(`❌ Failed: ${response.data.error || response.data.message}`);
    }
  } catch (error) {
    console.error(`❌ Error:`, error.response?.data?.error || error.message);
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('Skedisy Claim Invitation Sender');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Method: ${method}`);
  console.log('');

  if (!ADMIN_TOKEN) {
    console.error('⚠️  Warning: ADMIN_TOKEN not set in .env');
    console.error('   You can either:');
    console.error('   1. Add ADMIN_TOKEN = your_token to .env file');
    console.error('   2. Or login to admin panel and copy the token from browser');
    console.error('');
  }

  if (isSingle && salonId) {
    await sendSingleInvitation(salonId, method);
  } else if (isBulk) {
    await sendBulkInvitations(limit, department, method);
  } else {
    console.error('❌ Invalid usage!');
    console.error('');
    console.error('Usage:');
    console.error('  Single salon:');
    console.error('    node send_claim_invitations.js --single <salonId> [--method email|sms|both]');
    console.error('');
    console.error('  Bulk send:');
    console.error('    node send_claim_invitations.js --bulk [--limit 50] [--department 75] [--method email|sms|both]');
    console.error('');
    console.error('Examples:');
    console.error('    node send_claim_invitations.js --single 507f1f77bcf86cd799439011');
    console.error('    node send_claim_invitations.js --bulk --limit 100 --method both');
    console.error('    node send_claim_invitations.js --bulk --department 75 --method email');
    process.exit(1);
  }
}

main();

