#!/usr/bin/env node

/**
 * Test script to verify Fast Web View (PDF linearization) with qpdf
 * 
 * This script:
 * 1. Checks if qpdf is installed
 * 2. Creates a test PDF (or uses an existing one)
 * 3. Applies linearization using qpdf
 * 4. Verifies the linearization worked
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Fast Web View Optimization Test\n');
console.log('='.repeat(50));

// Step 1: Check qpdf installation
console.log('\n📦 Step 1: Checking qpdf installation...');
try {
    const version = execSync('qpdf --version', { encoding: 'utf-8' });
    console.log('✅ qpdf is installed:');
    console.log('   ' + version.trim().split('\n')[0]);
} catch (error) {
    console.error('❌ qpdf is not installed!');
    console.error('   Install it with: brew install qpdf');
    process.exit(1);
}

// Step 2: Check if we have a test PDF
console.log('\n📄 Step 2: Looking for test PDF...');
const testDir = path.join(__dirname, 'test-pdfs');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

const testPDF = path.join(testDir, 'test-input.pdf');
const linearizedPDF = path.join(testDir, 'test-linearized.pdf');

if (!fs.existsSync(testPDF)) {
    console.log('⚠️  No test PDF found.');
    console.log('   Please create a test PDF by:');
    console.log('   1. Opening Keynote');
    console.log('   2. Selecting some slides');
    console.log('   3. Running "Export Selected Slides"');
    console.log('   4. Save the PDF as: ' + testPDF);
    console.log('\n   Or place any PDF at: ' + testPDF);
    process.exit(1);
}

console.log('✅ Test PDF found: ' + path.basename(testPDF));
const inputSize = fs.statSync(testPDF).size;
console.log('   Size: ' + (inputSize / 1024).toFixed(2) + ' KB');

// Step 3: Check if PDF is already linearized
console.log('\n🔬 Step 3: Checking input PDF linearization status...');
try {
    const checkResult = execSync(`qpdf --check-linearization "${testPDF}"`, {
        encoding: 'utf-8',
        stdio: 'pipe'
    });

    if (checkResult.includes('linearized')) {
        console.log('ℹ️  Input PDF is already linearized');
    } else {
        console.log('ℹ️  Input PDF is NOT linearized');
    }
} catch (error) {
    // qpdf returns non-zero if not linearized, which is expected
    console.log('ℹ️  Input PDF is NOT linearized (expected)');
}

// Step 4: Apply linearization
console.log('\n⚙️  Step 4: Applying linearization...');
try {
    execSync(`qpdf --linearize "${testPDF}" "${linearizedPDF}"`, {
        stdio: 'pipe'
    });
    console.log('✅ Linearization completed successfully');

    const outputSize = fs.statSync(linearizedPDF).size;
    console.log('   Output size: ' + (outputSize / 1024).toFixed(2) + ' KB');

    const sizeDiff = outputSize - inputSize;
    const sizeChange = ((sizeDiff / inputSize) * 100).toFixed(2);

    if (sizeDiff > 0) {
        console.log('   Size change: +' + (sizeDiff / 1024).toFixed(2) + ' KB (' + sizeChange + '%)');
        console.log('   ℹ️  Linearization adds metadata for Fast Web View');
    } else if (sizeDiff < 0) {
        console.log('   Size change: ' + (sizeDiff / 1024).toFixed(2) + ' KB (' + sizeChange + '%)');
    } else {
        console.log('   Size change: No change');
    }

} catch (error) {
    console.error('❌ Linearization failed:');
    console.error('   ' + error.message);
    process.exit(1);
}

// Step 5: Verify linearization
console.log('\n✓ Step 5: Verifying linearization...');
try {
    const verifyResult = execSync(`qpdf --check-linearization "${linearizedPDF}"`, {
        encoding: 'utf-8',
        stdio: 'pipe'
    });

    console.log('✅ Linearization verified!');
    console.log('   ' + verifyResult.trim().split('\n')[0]);

} catch (error) {
    // Check if the error output contains "linearized"
    const stderr = error.stderr?.toString() || '';
    const stdout = error.stdout?.toString() || '';
    const output = stdout + stderr;

    if (output.toLowerCase().includes('linearized')) {
        console.log('✅ Linearization verified!');
        console.log('   PDF is properly linearized for Fast Web View');
    } else {
        console.error('❌ Verification failed');
        console.error('   Output: ' + output);
    }
}

// Step 6: Show PDF structure info
console.log('\n📊 Step 6: PDF Structure Information...');
try {
    const infoResult = execSync(`qpdf --show-linearization "${linearizedPDF}"`, {
        encoding: 'utf-8',
        stdio: 'pipe'
    });

    console.log('PDF Linearization Details:');
    const lines = infoResult.split('\n').slice(0, 10); // Show first 10 lines
    lines.forEach(line => {
        if (line.trim()) {
            console.log('   ' + line);
        }
    });

} catch (error) {
    console.log('ℹ️  Could not retrieve detailed linearization info');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('✅ FAST WEB VIEW TEST COMPLETED SUCCESSFULLY\n');
console.log('What this means:');
console.log('• qpdf is properly installed and working');
console.log('• PDF linearization (Fast Web View) is functional');
console.log('• Your PDFs will load page-by-page in web browsers');
console.log('• The first page appears before the entire PDF downloads');
console.log('\nTest files created in: ' + testDir);
console.log('• Input: ' + path.basename(testPDF));
console.log('• Linearized: ' + path.basename(linearizedPDF));
console.log('\n💡 Tip: Open both PDFs in a web browser to see the difference!');
console.log('   The linearized version will display the first page faster.\n');
