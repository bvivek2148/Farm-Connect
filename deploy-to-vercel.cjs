#!/usr/bin/env node

/**
 * Deployment script for Farm Connect to Vercel
 * This script ensures proper build and deployment configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Farm Connect deployment to Vercel...\n');

// Step 1: Verify build files exist
console.log('📦 Checking build files...');
const requiredFiles = [
  'dist/public/index.html',
  'dist/public/assets',
  'dist/index.js',
  'vercel.json',
  'package.json'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}
console.log('✅ All required files present\n');

// Step 2: Verify Vercel configuration
console.log('⚙️  Checking Vercel configuration...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

// Check if all required routes are present
const requiredRoutes = [
  '/admin-login',
  '/admin-dashboard', 
  '/farmer-dashboard',
  '/sign-in',
  '/sign-up'
];

const routeSources = vercelConfig.routes.map(route => route.src);
for (const route of requiredRoutes) {
  if (!routeSources.includes(route)) {
    console.error(`❌ Missing route in vercel.json: ${route}`);
    process.exit(1);
  }
}
console.log('✅ Vercel configuration is correct\n');

// Step 3: Check environment variables
console.log('🔐 Checking environment variables...');
if (!fs.existsSync('.env')) {
  console.warn('⚠️  No .env file found - make sure to set environment variables in Vercel dashboard');
} else {
  console.log('✅ Environment file found\n');
}

// Step 4: Verify package.json scripts
console.log('📋 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!packageJson.scripts['vercel-build']) {
  console.error('❌ Missing vercel-build script in package.json');
  process.exit(1);
}
console.log('✅ Package.json scripts are correct\n');

// Step 5: Test build locally
console.log('🔨 Running local build test...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Local build successful\n');
} catch (error) {
  console.error('❌ Local build failed');
  process.exit(1);
}

// Step 6: Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  // Check if vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch (error) {
    console.log('📦 Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Deploy to Vercel
  console.log('🌐 Starting deployment...');
  execSync('vercel --prod', { stdio: 'inherit' });
  
  console.log('\n✅ Deployment completed successfully!');
  console.log('\n🎉 Your Farm Connect application is now live!');
  console.log('\n📋 Test the following URLs:');
  console.log('   • Admin Login: https://your-domain.vercel.app/admin-login');
  console.log('   • Admin Dashboard: https://your-domain.vercel.app/admin-dashboard');
  console.log('   • Farmer Dashboard: https://your-domain.vercel.app/farmer-dashboard');
  console.log('\n🔑 Admin Credentials:');
  console.log('   • Username: admin');
  console.log('   • Password: 123456');
  console.log('\n💡 To create a farmer account:');
  console.log('   • Sign up with a username containing "farmer" (e.g., "farmer1", "johnfarmer")');
  
} catch (error) {
  console.error('❌ Deployment failed');
  console.error('Please check the error above and try again');
  process.exit(1);
}
