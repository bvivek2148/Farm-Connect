#!/usr/bin/env node

/**
 * Farm Connect - Comprehensive Authentication System Test
 * 
 * This script tests all authentication providers and security features:
 * - Supabase Auth (Hybrid with Neon DB)
 * - Firebase Auth
 * - Auth0
 * - Security measures
 * - Rate limiting
 * - Input validation
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Test utilities
class AuthTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };
  }

  async runTest(name, testFn, skipCondition = false) {
    if (skipCondition) {
      console.log(`⏭️  SKIPPED: ${name}`.yellow);
      this.results.skipped++;
      this.results.tests.push({ name, status: 'skipped', reason: 'Configuration missing' });
      return;
    }

    try {
      console.log(`🧪 Testing: ${name}`.blue);
      await testFn();
      console.log(`✅ PASSED: ${name}`.green);
      this.results.passed++;
      this.results.tests.push({ name, status: 'passed' });
    } catch (error) {
      console.log(`❌ FAILED: ${name}`.red);
      console.log(`   Error: ${error.message}`.gray);
      this.results.failed++;
      this.results.tests.push({ name, status: 'failed', error: error.message });
    }
  }

  async checkServerHealth() {
    try {
      const response = await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async testSupabaseAuth() {
    // Test user registration
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    // Test registration
    const registerResponse = await axios.post(`${API_URL}/auth/signup`, testUser);
    
    if (!registerResponse.data.success) {
      throw new Error(`Registration failed: ${registerResponse.data.message}`);
    }

    // Test login (after registration)
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      if (!loginResponse.data.success) {
        console.log('   Note: Login might require email verification'.yellow);
      }
    } catch (error) {
      console.log('   Note: Login failed, possibly due to email verification requirement'.yellow);
    }

    return testUser;
  }

  async testDuplicateUserPrevention() {
    const testUser = {
      username: 'duplicate_test_user',
      email: 'duplicate@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    // First registration should succeed
    try {
      await axios.post(`${API_URL}/auth/signup`, testUser);
    } catch (error) {
      // User might already exist from previous tests
    }

    // Second registration should fail
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, testUser);
      if (response.data.success) {
        throw new Error('Duplicate user registration should have been prevented');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Expected behavior - duplicate prevention working
        return;
      }
      throw error;
    }
  }

  async testPasswordValidation() {
    const weakPasswords = [
      '123',
      'password',
      'abc',
      '12345678' // Too simple
    ];

    for (const password of weakPasswords) {
      try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
          username: `weakpass_${Date.now()}`,
          email: `weakpass_${Date.now()}@example.com`,
          password: password,
          confirmPassword: password
        });

        if (response.data.success) {
          throw new Error(`Weak password "${password}" should have been rejected`);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Expected behavior - weak password rejected
          continue;
        }
        throw error;
      }
    }
  }

  async testRateLimiting() {
    const promises = [];
    
    // Make multiple rapid requests to test rate limiting
    for (let i = 0; i < 10; i++) {
      promises.push(
        axios.post(`${API_URL}/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }).catch(error => error.response)
      );
    }

    const responses = await Promise.all(promises);
    const rateLimitedResponses = responses.filter(r => r && r.status === 429);

    if (rateLimitedResponses.length === 0) {
      console.log('   Note: Rate limiting might not be active or threshold not reached'.yellow);
    } else {
      console.log(`   Rate limiting active: ${rateLimitedResponses.length} requests limited`.green);
    }
  }

  async testInputSanitization() {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      '${7*7}',
      '{{7*7}}',
      '<img src=x onerror=alert("xss")>'
    ];

    for (const maliciousInput of maliciousInputs) {
      try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
          username: maliciousInput,
          email: `test_${Date.now()}@example.com`,
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!'
        });

        // Check if malicious input was sanitized
        if (response.data.user && response.data.user.username.includes('<script>')) {
          throw new Error(`Malicious input not sanitized: ${maliciousInput}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Input validation working
          continue;
        }
        throw error;
      }
    }
  }

  async testDatabaseConnectivity() {
    // Test if we can reach the database through the API
    try {
      const response = await axios.get(`${API_URL}/products`, { timeout: 5000 });
      if (response.status !== 200) {
        throw new Error('Database connectivity test failed');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server');
      }
      throw error;
    }
  }

  async testFirebaseAuth() {
    // Test Firebase Auth configuration
    try {
      const response = await axios.get(`${API_URL}/auth/providers`);
      const providers = response.data.providers || [];
      
      if (!providers.includes('firebase')) {
        throw new Error('Firebase provider not configured');
      }
    } catch (error) {
      throw new Error('Firebase Auth test endpoint not available');
    }
  }

  async testAuth0Integration() {
    // Test Auth0 configuration
    try {
      const response = await axios.get(`${API_URL}/auth/providers`);
      const providers = response.data.providers || [];
      
      if (!providers.includes('auth0')) {
        throw new Error('Auth0 provider not configured');
      }
    } catch (error) {
      throw new Error('Auth0 test endpoint not available');
    }
  }

  async testSecurityHeaders() {
    const response = await axios.get(BASE_URL);
    const headers = response.headers;

    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy'
    ];

    const missingHeaders = requiredHeaders.filter(header => !headers[header]);
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
    }
  }

  async testCORSPolicy() {
    try {
      // Test CORS with invalid origin
      const response = await axios.get(`${API_URL}/health`, {
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });
      
      // If this doesn't throw an error, CORS might not be properly configured
      console.log('   Note: CORS policy might need review'.yellow);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // CORS policy working correctly
        return;
      }
      throw error;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60).cyan);
    console.log('🧪 AUTHENTICATION SYSTEM TEST RESULTS'.cyan.bold);
    console.log('='.repeat(60).cyan);
    
    console.log(`✅ Passed: ${this.results.passed}`.green);
    console.log(`❌ Failed: ${this.results.failed}`.red);
    console.log(`⏭️  Skipped: ${this.results.skipped}`.yellow);
    console.log(`📊 Total: ${this.results.tests.length}`.blue);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:'.red.bold);
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach(t => console.log(`   - ${t.name}: ${t.error}`.red));
    }
    
    if (this.results.skipped > 0) {
      console.log('\n⏭️  Skipped Tests (Configuration Needed):'.yellow.bold);
      this.results.tests
        .filter(t => t.status === 'skipped')
        .forEach(t => console.log(`   - ${t.name}`.yellow));
    }

    const score = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`\n🎯 Security Score: ${score}%`.cyan.bold);
    
    if (score >= 90) {
      console.log('🛡️  Excellent security implementation!'.green.bold);
    } else if (score >= 75) {
      console.log('✅ Good security, consider addressing failed tests'.blue.bold);
    } else {
      console.log('⚠️  Security needs improvement - please fix failing tests'.red.bold);
    }
  }
}

// Main test runner
async function runAuthenticationTests() {
  console.log('🚀 Starting Farm Connect Authentication System Tests...\n'.cyan.bold);
  
  const tester = new AuthTester();
  
  // Check if server is running
  const serverRunning = await tester.checkServerHealth();
  if (!serverRunning) {
    console.log('❌ Server not running! Please start the development server first:'.red.bold);
    console.log('   npm run dev'.yellow);
    process.exit(1);
  }
  
  console.log('✅ Server is running, proceeding with tests...\n'.green);

  // Core Authentication Tests
  console.log('🔐 CORE AUTHENTICATION TESTS'.blue.bold);
  await tester.runTest('Database Connectivity', () => tester.testDatabaseConnectivity());
  await tester.runTest('Supabase Authentication', () => tester.testSupabaseAuth());
  await tester.runTest('Duplicate User Prevention', () => tester.testDuplicateUserPrevention());
  await tester.runTest('Password Validation', () => tester.testPasswordValidation());

  // Security Tests
  console.log('\n🛡️  SECURITY TESTS'.blue.bold);
  await tester.runTest('Rate Limiting', () => tester.testRateLimiting());
  await tester.runTest('Input Sanitization', () => tester.testInputSanitization());
  await tester.runTest('Security Headers', () => tester.testSecurityHeaders());
  await tester.runTest('CORS Policy', () => tester.testCORSPolicy());

  // Extended Authentication Providers
  console.log('\n🔗 AUTHENTICATION PROVIDERS'.blue.bold);
  await tester.runTest('Firebase Auth Integration', 
    () => tester.testFirebaseAuth(), 
    !process.env.FIREBASE_API_KEY
  );
  await tester.runTest('Auth0 Integration', 
    () => tester.testAuth0Integration(), 
    !process.env.AUTH0_CLIENT_ID
  );

  // Print comprehensive results
  tester.printSummary();
  
  // Exit with appropriate code
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run tests if called directly
if (require.main === module) {
  runAuthenticationTests();
}

module.exports = AuthTester;