// Quick test script to verify card calling mechanism
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testCardCalling() {
  console.log('🧪 Testing Card Calling Mechanism (Quick)...\n');

  const hostSocket = io(SERVER_URL);
  
  const roomCode = await new Promise((resolve) => {
    hostSocket.on('connect', () => {
      console.log('✅ Host connected');
      hostSocket.emit('room:create', { name: 'Host' });
      hostSocket.on('room:created', (data) => {
        console.log('✅ Room created:', data.roomCode);
        resolve(data.roomCode);
      });
    });
  });

  const playerSocket = io(SERVER_URL);
  await new Promise((resolve) => {
    playerSocket.on('connect', () => {
      console.log('✅ Player connected');
      playerSocket.emit('room:join', { roomCode, name: 'Player1' });
      playerSocket.on('room:joined', () => {
        console.log('✅ Player joined\n');
        resolve();
      });
    });
  });

  const cardsReceived = [];
  let gameStarted = false;

  hostSocket.on('game:started', (data) => {
    gameStarted = true;
    console.log('✅ Game started, status:', data.roomState.status);
  });

  hostSocket.on('game:card', (data) => {
    cardsReceived.push(data);
    console.log(`✅ Card ${data.drawIndex}: ${data.card.name} ${data.card.emoji}`);
  });

  hostSocket.emit('game:start', { roomCode });

  // Wait for 3 cards
  await new Promise((resolve) => setTimeout(resolve, 9500));

  console.log('\n📊 Results:');
  console.log(`✅ Game started: ${gameStarted}`);
  console.log(`✅ Cards received: ${cardsReceived.length}`);
  console.log(`✅ All unique: ${new Set(cardsReceived.map(c => c.card.id)).size === cardsReceived.length}`);
  console.log(`✅ Sequential indices: ${cardsReceived.every((c, i) => c.drawIndex === i + 1)}`);

  hostSocket.disconnect();
  playerSocket.disconnect();
  
  console.log('\n✅ Test completed!');
  process.exit(0);
}

testCardCalling().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
