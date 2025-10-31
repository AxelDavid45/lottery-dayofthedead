// Test script to verify improved validation functionality
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testValidation() {
  console.log('🧪 Testing Improved Validation Functionality...\n');

  // Test 1: Invalid room code formats
  console.log('Test 1: Testing invalid room code formats...');
  const testCodes = ['', '123', 'ABCDEFG', 'abc123', '12-34', 'A B C D'];
  
  for (const code of testCodes) {
    const socket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      socket.on('connect', () => {
        socket.emit('room:join', { roomCode: code, name: 'TestUser' });
        
        socket.on('room:joined', () => {
          console.log(`❌ Should not have accepted invalid code: "${code}"`);
          resolve();
        });
        
        socket.on('error', (error) => {
          console.log(`✅ Correctly rejected "${code}": ${error.message}`);
          resolve();
        });
      });
    });
    
    socket.disconnect();
  }

  // Test 2: Valid room code formats (should fail because rooms don't exist)
  console.log('\nTest 2: Testing valid room code formats...');
  const validCodes = ['ABCDE', 'ABC123', '12345', 'ABCD12'];
  
  for (const code of validCodes) {
    const socket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      socket.on('connect', () => {
        socket.emit('room:join', { roomCode: code, name: 'TestUser' });
        
        socket.on('room:joined', () => {
          console.log(`❌ Should not have joined non-existent room: "${code}"`);
          resolve();
        });
        
        socket.on('error', (error) => {
          if (error.code === 'ROOM_NOT_FOUND') {
            console.log(`✅ Valid format "${code}" correctly processed (room not found as expected)`);
          } else {
            console.log(`❌ Unexpected error for "${code}": ${error.message}`);
          }
          resolve();
        });
      });
    });
    
    socket.disconnect();
  }

  // Test 3: Test room code generation produces valid codes
  console.log('\nTest 3: Testing room code generation...');
  const createdCodes = [];
  
  for (let i = 0; i < 5; i++) {
    const socket = io(SERVER_URL);
    
    const code = await new Promise((resolve) => {
      socket.on('connect', () => {
        socket.emit('room:create', { name: `TestHost${i}` });
        
        socket.on('room:created', (data) => {
          console.log(`✅ Generated valid room code: ${data.roomCode} (${data.roomCode.length} chars)`);
          resolve(data.roomCode);
        });
        
        socket.on('error', (error) => {
          console.log(`❌ Error creating room: ${error.message}`);
          resolve(null);
        });
      });
    });
    
    if (code) {
      createdCodes.push(code);
    }
    socket.disconnect();
  }

  // Verify all generated codes are unique
  const uniqueCodes = new Set(createdCodes);
  if (uniqueCodes.size === createdCodes.length) {
    console.log('✅ All generated room codes are unique');
  } else {
    console.log('❌ Some room codes were duplicated');
  }

  console.log('\n✅ Validation tests completed!');
  process.exit(0);
}

testValidation().catch(console.error);