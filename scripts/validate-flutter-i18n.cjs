#!/usr/bin/env node
/**
 * Validation script for Flutter app i18n JSON files
 * Checks: UTF-8 encoding, JSON syntax, key parity between EN and AR
 */

const fs = require('fs');
const path = require('path');

function validateFlutterI18n(appPath, appName) {
  console.log(`\n=== Validating ${appName} i18n ===`);
  
  const enPath = path.join(appPath, 'assets/lang/en.json');
  const arPath = path.join(appPath, 'assets/lang/ar.json');

  // Check files exist
  if (!fs.existsSync(enPath)) {
    console.error(`❌ ${appName}: en.json not found at ${enPath}`);
    return false;
  }
  if (!fs.existsSync(arPath)) {
    console.error(`❌ ${appName}: ar.json not found at ${arPath}`);
    return false;
  }

  // Read and parse files
  let enData, arData;
  try {
    const enContent = fs.readFileSync(enPath, 'utf8');
    enData = JSON.parse(enContent);
    console.log(`✅ ${appName}: en.json is valid JSON`);
  } catch (err) {
    console.error(`❌ ${appName}: en.json parsing failed:`, err.message);
    return false;
  }

  try {
    const arContent = fs.readFileSync(arPath, 'utf8');
    arData = JSON.parse(arContent);
    console.log(`✅ ${appName}: ar.json is valid JSON`);
  } catch (err) {
    console.error(`❌ ${appName}: ar.json parsing failed:`, err.message);
    return false;
  }

  // Get keys
  const enKeys = Object.keys(enData).sort();
  const arKeys = Object.keys(arData).sort();

  console.log(`📊 ${appName}: EN keys: ${enKeys.length}, AR keys: ${arKeys.length}`);

  // Check key parity
  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));

  if (missingInAr.length > 0) {
    console.error(`❌ ${appName}: ${missingInAr.length} keys missing in AR:`, missingInAr);
  }
  if (missingInEn.length > 0) {
    console.error(`❌ ${appName}: ${missingInEn.length} keys missing in EN:`, missingInEn);
  }

  if (missingInAr.length === 0 && missingInEn.length === 0) {
    console.log(`✅ ${appName}: Key parity OK`);
  }

  // Check for English fallback in AR (basic heuristic)
  const suspiciousAr = [];
  for (const key of arKeys) {
    const arValue = arData[key];
    if (typeof arValue === 'string' && arValue.length > 0) {
      // Check if string is mostly ASCII (likely English)
      const asciiCount = arValue.split('').filter(c => c.charCodeAt(0) < 128).length;
      const ratio = asciiCount / arValue.length;
      if (ratio > 0.8 && arValue.length > 10) {
        suspiciousAr.push(key);
      }
    }
  }

  if (suspiciousAr.length > 0) {
    console.warn(`⚠️  ${appName}: ${suspiciousAr.length} potentially untranslated keys in AR (mostly ASCII)`);
    console.warn(`   Sample: ${suspiciousAr.slice(0, 5).join(', ')}`);
  } else {
    console.log(`✅ ${appName}: No obvious English fallbacks detected in AR`);
  }

  const allValid = missingInAr.length === 0 && missingInEn.length === 0;
  return allValid;
}

// Main execution
const rootPath = path.resolve(__dirname, '..');

const flutterFounderPath = path.join(rootPath, 'Flutter_Founder');
const flutterPartnerPath = path.join(rootPath, 'Flutter_Partner');

let allPassed = true;

if (fs.existsSync(flutterFounderPath)) {
  const result1 = validateFlutterI18n(flutterFounderPath, 'Flutter_Founder');
  allPassed = allPassed && result1;
} else {
  console.warn(`⚠️  Flutter_Founder not found at ${flutterFounderPath}`);
}

if (fs.existsSync(flutterPartnerPath)) {
  const result2 = validateFlutterI18n(flutterPartnerPath, 'Flutter_Partner');
  allPassed = allPassed && result2;
} else {
  console.warn(`⚠️  Flutter_Partner not found at ${flutterPartnerPath}`);
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All Flutter i18n validations passed');
  process.exit(0);
} else {
  console.log('❌ Flutter i18n validation failed');
  process.exit(1);
}
