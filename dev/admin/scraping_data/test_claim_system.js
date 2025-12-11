/**
 * Test script to verify claim system is working
 * 
 * Usage: node test_claim_system.js
 * 
 * This script will:
 * 1. Test claim endpoint connectivity
 * 2. Find an unclaimed salon from database
 * 3. Test sending invitation
 * 4. Test claim flow
 * 5. Check dashboard metrics
 */

const { MongoClient } = require('mongodb');
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

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI || '';
const BASE_URL = process.env.baseURL || 'http://localhost:5000/';
const SECRET_KEY = process.env.secretKey || process.env.SECRET_KEY || '';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

async function testClaimSystem() {
  console.log('='.repeat(60));
  console.log('🧪 Testing Skedisy Claim System');
  console.log('='.repeat(60));
  console.log('');

  let client;
  let testResults = {
    database: false,
    claimEndpoint: false,
    invitationEndpoint: false,
    dashboardEndpoint: false,
    foundSalon: null
  };

  try {
    // Test 1: Database Connection
    console.log('📊 Test 1: Database Connection');
    console.log('─'.repeat(60));
    if (!MONGODB_URI) {
      console.log('❌ MongoDB URI not configured');
      return testResults;
    }

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB');
    testResults.database = true;

    const db = client.db();
    const salonsCollection = db.collection('salons');

    // Find an unclaimed salon for testing
    const unclaimedSalon = await salonsCollection.findOne({
      isClaimed: false,
      isDelete: false
    }, {
      projection: { _id: 1, name: 1, email: 1, mobile: 1, claimToken: 1 }
    });

    if (!unclaimedSalon) {
      console.log('⚠️  No unclaimed salons found in database');
      console.log('   You need to import salons first using:');
      console.log('   node import_to_skedisy.js salons_ile_de_france_*.json');
    } else {
      testResults.foundSalon = unclaimedSalon;
      console.log(`✅ Found test salon: ${unclaimedSalon.name}`);
      console.log(`   ID: ${unclaimedSalon._id}`);
      console.log(`   Email: ${unclaimedSalon.email}`);
      console.log(`   Claim Token: ${unclaimedSalon.claimToken ? '✅ Set' : '❌ Missing'}`);
    }

    console.log('');

    // Test 2: Claim Endpoint
    console.log('🔗 Test 2: Claim Endpoint');
    console.log('─'.repeat(60));
    try {
      // Test endpoint exists (will fail auth but confirms route exists)
      const claimTest = await axios.post(
        `${BASE_URL}salon/claim`,
        { token: 'test', email: 'test@test.com', password: 'test123' },
        {
          headers: {
            'key': SECRET_KEY,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true // Accept any status
        }
      );

      if (claimTest.status === 200 || claimTest.status === 401 || claimTest.status === 403) {
        console.log('✅ Claim endpoint is accessible');
        console.log(`   Status: ${claimTest.status}`);
        if (claimTest.data.message) {
          console.log(`   Response: ${claimTest.data.message}`);
        }
        testResults.claimEndpoint = true;
      } else {
        console.log(`⚠️  Unexpected status: ${claimTest.status}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Cannot connect to server. Is the backend running?');
        console.log(`   Tried: ${BASE_URL}`);
      } else {
        console.log(`⚠️  Error: ${error.message}`);
      }
    }

    console.log('');

    // Test 3: Invitation Endpoint
    console.log('📧 Test 3: Invitation Endpoint');
    console.log('─'.repeat(60));
    if (!ADMIN_TOKEN) {
      console.log('⚠️  ADMIN_TOKEN not set - skipping invitation test');
      console.log('   Add ADMIN_TOKEN to backend/.env to test invitations');
    } else if (unclaimedSalon) {
      try {
        const inviteTest = await axios.post(
          `${BASE_URL}admin/salon/send-claim-invitation`,
          { salonId: unclaimedSalon._id.toString(), method: 'email' },
          {
            headers: {
              'key': SECRET_KEY,
              'Authorization': ADMIN_TOKEN,
              'Content-Type': 'application/json'
            },
            validateStatus: () => true
          }
        );

        if (inviteTest.status === 200) {
          if (inviteTest.data.status) {
            console.log('✅ Invitation endpoint is working');
            console.log(`   Message: ${inviteTest.data.message}`);
            testResults.invitationEndpoint = true;
          } else {
            console.log('⚠️  Invitation failed:', inviteTest.data.message || inviteTest.data.error);
          }
        } else {
          console.log(`⚠️  Status: ${inviteTest.status}`);
          console.log(`   Response: ${JSON.stringify(inviteTest.data)}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Data: ${JSON.stringify(error.response.data)}`);
        }
      }
    } else {
      console.log('⚠️  No unclaimed salon found - cannot test invitation');
    }

    console.log('');

    // Test 4: Dashboard Endpoint
    console.log('📊 Test 4: Dashboard Metrics');
    console.log('─'.repeat(60));
    if (!ADMIN_TOKEN) {
      console.log('⚠️  ADMIN_TOKEN not set - skipping dashboard test');
    } else {
      try {
        const dashboardTest = await axios.get(
          `${BASE_URL}admin/dashboard/allStats`,
          {
            headers: {
              'key': SECRET_KEY,
              'Authorization': ADMIN_TOKEN
            },
            validateStatus: () => true
          }
        );

        if (dashboardTest.status === 200 && dashboardTest.data.status) {
          console.log('✅ Dashboard endpoint is working');
          const data = dashboardTest.data.data;
          console.log(`   Total Salons: ${data.claimMetrics?.totalSalons || 'N/A'}`);
          console.log(`   Claimed: ${data.claimMetrics?.claimedSalons || 'N/A'}`);
          console.log(`   Unclaimed: ${data.claimMetrics?.unclaimedSalons || 'N/A'}`);
          console.log(`   Claim Rate: ${data.claimMetrics?.claimRate || 'N/A'}%`);
          testResults.dashboardEndpoint = true;
        } else {
          console.log(`⚠️  Status: ${dashboardTest.status}`);
          if (dashboardTest.data) {
            console.log(`   Response: ${JSON.stringify(dashboardTest.data)}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }

    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('📋 Test Summary');
    console.log('='.repeat(60));
    console.log(`Database Connection: ${testResults.database ? '✅' : '❌'}`);
    console.log(`Claim Endpoint: ${testResults.claimEndpoint ? '✅' : '❌'}`);
    console.log(`Invitation Endpoint: ${testResults.invitationEndpoint ? '✅' : '⚠️  (requires ADMIN_TOKEN)'}`);
    console.log(`Dashboard Endpoint: ${testResults.dashboardEndpoint ? '✅' : '⚠️  (requires ADMIN_TOKEN)'}`);
    console.log(`Test Salon Found: ${testResults.foundSalon ? '✅' : '❌'}`);
    console.log('');

    if (testResults.foundSalon) {
      console.log('💡 Next Steps:');
      console.log(`   1. Send invitation: node send_claim_invitations.js --single ${testResults.foundSalon._id}`);
      console.log(`   2. Test claim with token: ${testResults.foundSalon.claimToken}`);
      console.log(`   3. Check dashboard: ${BASE_URL}admin/dashboard`);
    }

    if (!testResults.database) {
      console.log('❌ Fix: Add MONGODB_CONNECTION_STRING to backend/.env');
    }
    if (!testResults.claimEndpoint) {
      console.log('❌ Fix: Make sure backend server is running');
    }
    if (!ADMIN_TOKEN) {
      console.log('⚠️  Tip: Add ADMIN_TOKEN to backend/.env to test admin endpoints');
      console.log('   Get token from admin panel after login');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run tests
testClaimSystem();

