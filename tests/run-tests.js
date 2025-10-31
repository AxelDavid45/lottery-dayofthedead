#!/usr/bin/env node

// Test runner for Lotería del Mictlán
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
  'test-room-functionality.js',
  'test-host-reassignment.js', 
  'test-validation.js'
];

console.log('🎮 Lotería del Mictlán - Test Suite');
console.log('=====================================\n');

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`🧪 Running ${testFile}...`);
    
    const child = spawn('node', [join(__dirname, testFile)], {
      stdio: 'pipe'
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} passed\n`);
      } else {
        console.log(`❌ ${testFile} failed with code ${code}`);
        if (errorOutput) {
          console.log('Error output:', errorOutput);
        }
        console.log('');
      }
      resolve(code === 0);
    });
  });
}

async function runAllTests() {
  console.log('⚠️  Make sure the server is running on localhost:3001 before running tests!\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const success = await runTest(test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('=====================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('💥 Some tests failed!');
    process.exit(1);
  }
}

runAllTests().catch(console.error);