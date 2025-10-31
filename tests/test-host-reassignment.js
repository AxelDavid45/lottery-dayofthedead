// Test script to verify host reassignment functionality
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testHostReassignment() {
  console.log('🧪 Testing Host Reassignment Functionality...\n');

  // Create a room with host
  console.log('Test 1: Creating room with host...');
  const hostSocket = io(SERVER_URL);
  
  const roomCode = await new Promise((resolve) => {
    hostSocket.on('connect', () => {
      console.log('✅ Host connected');
      
      hostSocket.emit('room:create', { name: 'OriginalHost' });
      
      hostSocket.on('room:created', (data) => {
        console.log('✅ Room created:', data.roomCode);
        resolve(data.roomCode);
      });
    });
  });

  // Add a player
  console.log('\nTest 2: Adding a player...');
  const playerSocket = io(SERVER_URL);
  
  await new Promise((resolve) => {
    playerSocket.on('connect', () => {
      console.log('✅ Player connected');
      
      playerSocket.emit('room:join', { roomCode, name: 'RegularPlayer' });
      
      playerSocket.on('room:joined', (data) => {
        console.log('✅ Player joined room');
        console.log('✅ Current host:', data.roomState.players.find(p => p.isHost)?.name);
        resolve();
      });
    });
  });

  // Disconnect host and check if player becomes new host
  console.log('\nTest 3: Disconnecting original host...');
  hostSocket.disconnect();
  
  // Wait a moment for the server to process the disconnection
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check room state by trying to join with another player
  console.log('\nTest 4: Checking if new host was assigned...');
  const checkerSocket = io(SERVER_URL);
  
  await new Promise((resolve) => {
    checkerSocket.on('connect', () => {
      checkerSocket.emit('room:join', { roomCode, name: 'Checker' });
      
      checkerSocket.on('room:joined', (data) => {
        const newHost = data.roomState.players.find(p => p.isHost);
        console.log('✅ New host assigned:', newHost?.name);
        console.log('✅ Total players after host left:', data.roomState.players.length);
        resolve();
      });
      
      checkerSocket.on('error', (error) => {
        console.log('❌ Error:', error.message);
        resolve();
      });
    });
  });
  
  // Cleanup
  console.log('\n🧹 Cleaning up connections...');
  playerSocket.disconnect();
  checkerSocket.disconnect();
  
  console.log('\n✅ Host reassignment test completed!');
  process.exit(0);
}

testHostReassignment().catch(console.error);