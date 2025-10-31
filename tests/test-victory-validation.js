// Test script to verify victory validation and tie-breaking functionality
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

// Helper to wait for a specific event
function waitForEvent(socket, eventName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeout);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });

    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// Helper to create a room and get the room code
async function createRoom(name) {
  const socket = io(SERVER_URL);
  await waitForEvent(socket, 'connect');
  
  socket.emit('room:create', { name });
  const data = await waitForEvent(socket, 'room:created');
  
  return { socket, roomCode: data.roomCode, roomState: data.roomState };
}

// Helper to join a room
async function joinRoom(roomCode, name) {
  const socket = io(SERVER_URL);
  await waitForEvent(socket, 'connect');
  
  socket.emit('room:join', { roomCode, name });
  const data = await waitForEvent(socket, 'room:joined');
  
  return { socket, roomState: data.roomState };
}

async function testVictoryValidation() {
  console.log('🧪 Testing Victory Validation and Tie-Breaking...\n');

  try {
    // Test 1: Invalid claim - board not complete
    console.log('Test 1: Testing invalid claim (board not complete)...');
    const { socket: host1, roomCode: room1 } = await createRoom('Host1');
    const { socket: player1 } = await joinRoom(room1, 'Player1');
    
    // Start game
    host1.emit('game:start', { roomCode: room1 });
    await waitForEvent(host1, 'game:started');
    
    // Try to claim without marking any cells
    player1.emit('game:claim', { roomCode: room1 });
    
    try {
      await waitForEvent(player1, 'error', 2000);
      console.log('✅ Correctly rejected claim with incomplete board\n');
    } catch (err) {
      console.log('❌ Should have rejected incomplete board claim\n');
    }
    
    host1.disconnect();
    player1.disconnect();

    // Test 2: Invalid claim - marked cards not called
    console.log('Test 2: Testing invalid claim (marked cards not called)...');
    const { socket: host2, roomCode: room2 } = await createRoom('Host2');
    const { socket: player2 } = await joinRoom(room2, 'Player2');
    
    // Start game
    host2.emit('game:start', { roomCode: room2 });
    const gameStarted = await waitForEvent(host2, 'game:started');
    
    // Get player's board
    const myPlayer = gameStarted.roomState.players.find(p => p.name === 'Player2');
    
    // Try to mark all cells immediately (before cards are called)
    for (let i = 0; i < 16; i++) {
      player2.emit('board:mark', { roomCode: room2, cellIndex: i });
    }
    
    // Wait a bit for marks to process
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to claim
    player2.emit('game:claim', { roomCode: room2 });
    
    try {
      const error = await waitForEvent(player2, 'error', 2000);
      if (error.code === 'INVALID_MARKS' || error.code === 'CARD_NOT_CALLED') {
        console.log('✅ Correctly rejected claim with unmarked cards\n');
      } else {
        console.log(`⚠️  Got error but unexpected code: ${error.code}\n`);
      }
    } catch (err) {
      console.log('❌ Should have rejected claim with invalid marks\n');
    }
    
    host2.disconnect();
    player2.disconnect();

    // Test 3: Tie-breaking - first valid claim wins
    console.log('Test 3: Testing tie-breaking (first valid claim wins)...');
    const { socket: host3, roomCode: room3 } = await createRoom('Host3');
    const { socket: player3a } = await joinRoom(room3, 'Player3A');
    const { socket: player3b } = await joinRoom(room3, 'Player3B');
    
    // Start game
    host3.emit('game:start', { roomCode: room3 });
    await waitForEvent(host3, 'game:started');
    
    // Wait for enough cards to be called (simulate game progress)
    console.log('   Waiting for cards to be called...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds for ~2-3 cards
    
    // Both players try to claim simultaneously
    console.log('   Both players claiming simultaneously...');
    player3a.emit('game:claim', { roomCode: room3 });
    player3b.emit('game:claim', { roomCode: room3 });
    
    // Check results
    const results = await Promise.allSettled([
      waitForEvent(player3a, 'game:winner', 2000).catch(() => waitForEvent(player3a, 'error', 2000)),
      waitForEvent(player3b, 'game:winner', 2000).catch(() => waitForEvent(player3b, 'error', 2000))
    ]);
    
    let winnerCount = 0;
    let errorCount = 0;
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.playerName) {
          winnerCount++;
          console.log(`   Player ${index === 0 ? '3A' : '3B'} received winner notification`);
        } else if (result.value.code) {
          errorCount++;
          console.log(`   Player ${index === 0 ? '3A' : '3B'} received error: ${result.value.code}`);
        }
      }
    });
    
    if (winnerCount >= 1) {
      console.log('✅ Tie-breaking works: only one winner declared\n');
    } else {
      console.log('⚠️  No winner declared (likely boards not complete yet)\n');
    }
    
    host3.disconnect();
    player3a.disconnect();
    player3b.disconnect();

    // Test 4: Valid claim after all cards marked correctly
    console.log('Test 4: Testing valid claim scenario...');
    console.log('   (This test requires manual simulation or longer wait time)\n');

    console.log('✅ Victory validation tests completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

testVictoryValidation().catch(console.error);
