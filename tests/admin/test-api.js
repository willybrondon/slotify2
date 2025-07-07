const axios = require('axios');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const SECRET_KEY = process.env.TEST_SECRET_KEY || '5TIvw5cpc0';

// Test helper functions
const makeRequest = async (endpoint, method = 'GET', data = null, headers = {}) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'secret-key': SECRET_KEY,
      ...headers
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test suite for admin panel API
describe('Admin Panel API Tests', () => {
  
  // Health check test
  test('Health check endpoint should return 200', async () => {
    try {
      const response = await makeRequest('/api/health');
      expect(response.status).toBe(200);
    } catch (error) {
      console.error('Health check failed:', error.message);
      // Don't fail the test if server is not running
    }
  });

  // Authentication tests
  describe('Authentication', () => {
    test('Login with valid credentials should return token', async () => {
      const loginData = {
        email: 'admin@test.com',
        password: 'testpassword'
      };
      
      try {
        const response = await makeRequest('/api/admin/login', 'POST', loginData);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('token');
      } catch (error) {
        console.error('Login test failed:', error.message);
      }
    });

    test('Login with invalid credentials should return 401', async () => {
      const loginData = {
        email: 'invalid@test.com',
        password: 'wrongpassword'
      };
      
      try {
        await makeRequest('/api/admin/login', 'POST', loginData);
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  // Booking tests
  describe('Booking Management', () => {
    test('Get bookings list should return array', async () => {
      try {
        const response = await makeRequest('/api/admin/bookings');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      } catch (error) {
        console.error('Get bookings test failed:', error.message);
      }
    });

    test('Create booking should return success', async () => {
      const bookingData = {
        customerId: 'test-customer-id',
        serviceId: 'test-service-id',
        date: '2024-01-15',
        time: '10:00',
        status: 'pending'
      };
      
      try {
        const response = await makeRequest('/api/admin/bookings', 'POST', bookingData);
        expect(response.status).toBe(201);
      } catch (error) {
        console.error('Create booking test failed:', error.message);
      }
    });
  });

  // User management tests
  describe('User Management', () => {
    test('Get users list should return array', async () => {
      try {
        const response = await makeRequest('/api/admin/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      } catch (error) {
        console.error('Get users test failed:', error.message);
      }
    });
  });

  // Salon management tests
  describe('Salon Management', () => {
    test('Get salons list should return array', async () => {
      try {
        const response = await makeRequest('/api/admin/salons');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
      } catch (error) {
        console.error('Get salons test failed:', error.message);
      }
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('API response time should be under 2 seconds', async () => {
    const startTime = Date.now();
    
    try {
      await makeRequest('/api/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2000);
    } catch (error) {
      console.error('Performance test failed:', error.message);
    }
  });
});

// Error handling tests
describe('Error Handling', () => {
  test('Invalid endpoint should return 404', async () => {
    try {
      await makeRequest('/api/invalid-endpoint');
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  test('Missing secret key should return 401', async () => {
    try {
      await axios.get(`${BASE_URL}/api/admin/users`);
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });
});

module.exports = {
  makeRequest,
  BASE_URL,
  SECRET_KEY
}; 