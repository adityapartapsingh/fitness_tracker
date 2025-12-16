#!/usr/bin/env node

/**
 * Quick Test Script for Email Verification
 * 
 * This script tests the email verification flow locally.
 * Make sure the backend is running on http://localhost:5000
 * 
 * Usage: node test-email-verification.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

let testOTP = null;

/**
 * Make HTTP request
 */
function makeRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Test functions
 */
async function testSignup() {
  console.log('\n📝 TEST 1: Signup');
  console.log('─'.repeat(50));

  const body = {
    name: TEST_NAME,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  };

  console.log(`Sending: POST /api/auth/signup`);
  console.log(`Body:`, JSON.stringify(body, null, 2));

  try {
    const response = await makeRequest('POST', '/api/auth/signup', body);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 201) {
      console.log('✅ Signup successful!');
      return true;
    } else {
      console.log('❌ Signup failed!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('⚠️  Make sure the backend is running on http://localhost:5000');
    return false;
  }
}

async function testVerifyOTPInvalid() {
  console.log('\n🔐 TEST 2: Verify OTP (Invalid)');
  console.log('─'.repeat(50));

  const body = {
    email: TEST_EMAIL,
    otp: '000000',
  };

  console.log(`Sending: POST /api/auth/verify-otp`);
  console.log(`Body:`, JSON.stringify(body, null, 2));

  try {
    const response = await makeRequest('POST', '/api/auth/verify-otp', body);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.message.includes('Invalid OTP')) {
      console.log('✅ Invalid OTP correctly rejected!');
      return true;
    } else {
      console.log('❌ Unexpected response!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testResendOTP() {
  console.log('\n🔄 TEST 3: Resend OTP');
  console.log('─'.repeat(50));

  const body = {
    email: TEST_EMAIL,
  };

  console.log(`Sending: POST /api/auth/resend-otp`);
  console.log(`Body:`, JSON.stringify(body, null, 2));

  try {
    const response = await makeRequest('POST', '/api/auth/resend-otp', body);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ OTP resent successfully!');
      return true;
    } else {
      console.log('❌ Resend failed!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testLoginUnverified() {
  console.log('\n🚫 TEST 4: Login (Unverified)');
  console.log('─'.repeat(50));

  const body = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  };

  console.log(`Sending: POST /api/auth/login`);
  console.log(`Body:`, JSON.stringify(body, null, 2));

  try {
    const response = await makeRequest('POST', '/api/auth/login', body);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.message.includes('not verified')) {
      console.log('✅ Unverified user correctly blocked from login!');
      return true;
    } else {
      console.log('❌ Unexpected response!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testPasswordStrength() {
  console.log('\n🔒 TEST 5: Password Strength Validation');
  console.log('─'.repeat(50));

  const weakPassword = 'weak';
  const body = {
    name: 'Test User',
    email: `test-weak-${Date.now()}@example.com`,
    password: weakPassword,
  };

  console.log(`Sending: POST /api/auth/signup with weak password`);
  console.log(`Password: "${weakPassword}"`);

  try {
    const response = await makeRequest('POST', '/api/auth/signup', body);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.message.includes('Password')) {
      console.log('✅ Weak password correctly rejected!');
      return true;
    } else {
      console.log('❌ Unexpected response!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n🏥 TEST 6: Health Check');
  console.log('─'.repeat(50));

  console.log(`Sending: GET /api/health`);

  try {
    const response = await makeRequest('GET', '/api/health');
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ Server is healthy!');
      return true;
    } else {
      console.log('❌ Server returned error!');
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('⚠️  Make sure the backend is running on http://localhost:5000');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  Email Verification Test Suite                   ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  console.log(`\nTest Email: ${TEST_EMAIL}`);
  console.log(`Test Password: ${TEST_PASSWORD}`);
  console.log(`Backend URL: ${BASE_URL}`);

  const results = [];

  // Run tests
  results.push(await testHealthCheck());
  results.push(await testSignup());
  results.push(await testVerifyOTPInvalid());
  results.push(await testResendOTP());
  results.push(await testLoginUnverified());
  results.push(await testPasswordStrength());

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`Passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('✅ All tests passed!');
    console.log('\nℹ️  Note: OTP verification test uses invalid OTP.');
    console.log('   To test successful verification, you need to:');
    console.log('   1. Check the email for the actual OTP');
    console.log('   2. Use that OTP to verify');
  } else {
    console.log('❌ Some tests failed!');
    console.log('\nℹ️  Make sure:');
    console.log('   1. Backend is running: npm start');
    console.log('   2. MongoDB is connected');
    console.log('   3. .env is configured (or using Ethereal default)');
  }

  console.log('\n');
}

// Run tests
runTests().catch(console.error);
