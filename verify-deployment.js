#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Farm Connect - Deployment Verification\n');

// Check if required files exist
const requiredFiles = [
    'vercel.json',
    'package.json',
    'client/src/pages/admin-login.tsx',
    'client/src/pages/admin-dashboard.tsx',
    'dist/public/index.html'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

// Check vercel.json configuration
console.log('\n⚙️  Checking Vercel configuration...');
try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // Check if SPA routing is configured
    const hasAdminRoutes = vercelConfig.routes.some(route => 
        route.src === '/admin-login' || route.src === '/admin-dashboard'
    );
    
    const hasFallbackRoute = vercelConfig.routes.some(route => 
        route.dest === '/dist/public/index.html' && route.src === '/(.*)'
    );
    
    if (hasAdminRoutes) {
        console.log('✅ Admin routes configured');
    } else {
        console.log('❌ Admin routes missing');
    }
    
    if (hasFallbackRoute) {
        console.log('✅ SPA fallback route configured');
    } else {
        console.log('❌ SPA fallback route missing');
    }
    
} catch (error) {
    console.log('❌ Error reading vercel.json:', error.message);
    allFilesExist = false;
}

// Check build output
console.log('\n🏗️  Checking build output...');
const buildFiles = [
    'dist/public/index.html',
    'dist/public/assets',
    'dist/index.js'
];

buildFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - Run 'npm run build' first`);
    }
});

// Check admin components
console.log('\n🔐 Checking admin components...');
try {
    const adminLoginContent = fs.readFileSync('client/src/pages/admin-login.tsx', 'utf8');
    const adminDashboardContent = fs.readFileSync('client/src/pages/admin-dashboard.tsx', 'utf8');
    
    if (adminLoginContent.includes('admin') && adminLoginContent.includes('123456')) {
        console.log('✅ Admin login credentials configured');
    } else {
        console.log('❌ Admin login credentials not found');
    }
    
    if (adminDashboardContent.includes('adminAuth') && adminDashboardContent.includes('sessionStorage')) {
        console.log('✅ Admin dashboard authentication configured');
    } else {
        console.log('❌ Admin dashboard authentication not configured');
    }
    
} catch (error) {
    console.log('❌ Error checking admin components:', error.message);
}

// Final status
console.log('\n📊 Deployment Status:');
if (allFilesExist) {
    console.log('✅ Ready for deployment!');
    console.log('\n🚀 Next steps:');
    console.log('1. git add .');
    console.log('2. git commit -m "Fix admin page 404 - Update Vercel config"');
    console.log('3. git push origin main');
    console.log('\n🌐 After deployment, test:');
    console.log('https://farm-connect-aecvk58jc-vivek-bukkas-projects.vercel.app/admin-login');
} else {
    console.log('❌ Issues found - please fix before deployment');
}

console.log('\n🔑 Admin Credentials:');
console.log('Username: admin');
console.log('Password: 123456');
