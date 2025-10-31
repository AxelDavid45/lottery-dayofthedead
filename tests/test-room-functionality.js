// Simple test script to verify room creation and joining functionality
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testRoomFunctionality() {
  console.log('🧪 Testing Room Creation and Joining Functionality...\n');

  // Test 1: Create a room
  console.log('Test 1: Creating a room...');
  const hostSocket = io(SERVER_URL);
  
  await new Promise((resolve) => {
    hostSocket.on('connect', () => {
      console.log('✅ Host connected');
      
      hostSocket.emit('room:create', { name: 'TestHost' });
      
      hostSocket.on('room:created', (data) => {
        console.log('✅ Room created:', data.roomCode);
        console.log('✅ Host is:', data.roomState.players[0].name);
        console.log('✅ Host permissions:', data.roomState.players[0].isHost);
        resolve(data.roomCode);
      });
      
      hostSocket.on('error', (error) => {
        console.log('❌ Error creating room:', error);
        resolve(null);
      });
    });
  }).then(async (roomCode) => {
    if (!roomCode) return;
    
    // Test 2: Join the room
    console.log('\nTest 2: Joining the room...');
    const playerSocket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      playerSocket.on('connect', () => {
        console.log('✅ Player connected');
        
        playerSocket.emit('room:join', { roomCode, name: 'TestPlayer' });
        
        playerSocket.on('room:joined', (data) => {
          console.log('✅ Player joined room');
          console.log('✅ Total players:', data.roomState.players.length);
          console.log('✅ Players:', data.roomState.players.map(p => p.name).join(', '));
          resolve();
        });
        
        playerSocket.on('error', (error) => {
          console.log('❌ Error joining room:', error);
          resolve();
        });
      });
    });
    
    // Test 3: Try to join with same name (should fail)
    console.log('\nTest 3: Trying to join with duplicate name...');
    const duplicateSocket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      duplicateSocket.on('connect', () => {
        duplicateSocket.emit('room:join', { roomCode, name: 'TestPlayer' });
        
        duplicateSocket.on('room:joined', () => {
          console.log('❌ Should not have allowed duplicate name');
          resolve();
        });
        
        duplicateSocket.on('error', (error) => {
          console.log('✅ Correctly rejected duplicate name:', error.message);
          resolve();
        });
      });
    });
    
    // Test 4: Try to join non-existent room
    console.log('\nTest 4: Trying to join non-existent room...');
    const invalidSocket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      invalidSocket.on('connect', () => {
        invalidSocket.emit('room:join', { roomCode: 'INVALID', name: 'TestUser' });
        
        invalidSocket.on('room:joined', () => {
          console.log('❌ Should not have joined invalid room');
          resolve();
        });
        
        invalidSocket.on('error', (error) => {
          console.log('✅ Correctly rejected invalid room:', error.message);
          resolve();
        });
      });
    });
    
    // Test 5: Test room capacity (create 7 more players to reach limit)
    console.log('\nTest 5: Testing room capacity limit...');
    const sockets = [];
    
    for (let i = 3; i <= 8; i++) {
      const socket = io(SERVER_URL);
      sockets.push(socket);
      
      await new Promise((resolve) => {
        socket.on('connect', () => {
          socket.emit('room:join', { roomCode, name: `Player${i}` });
          
          socket.on('room:joined', (data) => {
            console.log(`✅ Player${i} joined (${data.roomState.players.length}/8 players)`);
            resolve();
          });
          
          socket.on('error', (error) => {
            console.log(`❌ Player${i} failed to join:`, error.message);
            resolve();
          });
        });
      });
    }
    
    // Test 6: Try to join when room is full
    console.log('\nTest 6: Trying to join full room...');
    const overflowSocket = io(SERVER_URL);
    
    await new Promise((resolve) => {
      overflowSocket.on('connect', () => {
        overflowSocket.emit('room:join', { roomCode, name: 'OverflowPlayer' });
        
        overflowSocket.on('room:joined', () => {
          console.log('❌ Should not have joined full room');
          resolve();
        });
        
        overflowSocket.on('error', (error) => {
          console.log('✅ Correctly rejected full room:', error.message);
          resolve();
        });
      });
    });
    
    // Cleanup
    console.log('\n🧹 Cleaning up connections...');
    hostSocket.disconnect();
    playerSocket.disconnect();
    duplicateSocket.disconnect();
    invalidSocket.disconnect();
    overflowSocket.disconnect();
    sockets.forEach(s => s.disconnect());
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
  });
}

testRoomFunctionality().catch(console.error);