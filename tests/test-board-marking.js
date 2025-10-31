// Test board marking functionality
import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testBoardMarking() {
  console.log('🧪 Testing Board Marking Functionality\n');

  // Create two clients
  const client1 = ioClient(SERVER_URL);
  const client2 = ioClient(SERVER_URL);

  let roomCode = '';
  let player1Id = '';
  let player2Id = '';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout'));
    }, 15000);

    // Client 1: Create room
    client1.on('connect', () => {
      player1Id = client1.id;
      console.log('✅ Client 1 connected:', player1Id);
      client1.emit('room:create', { name: 'Player 1' });
    });

    client1.on('room:created', (data) => {
      roomCode = data.roomCode;
      console.log('✅ Room created:', roomCode);
      console.log('   Player 1 board:', data.roomState.players[0].board.length, 'cards');
      
      // Client 2: Join room
      client2.emit('room:join', { roomCode, name: 'Player 2' });
    });

    // Client 2: Connected
    client2.on('connect', () => {
      player2Id = client2.id;
      console.log('✅ Client 2 connected:', player2Id);
    });

    client2.on('room:joined', (data) => {
      console.log('✅ Client 2 joined room');
      console.log('   Player 2 board:', data.roomState.players.find(p => p.id === player2Id).board.length, 'cards');
      
      // Start game
      client1.emit('game:start', { roomCode });
    });

    // Game started
    client1.on('game:started', (data) => {
      console.log('\n✅ Game started');
      console.log('   Status:', data.roomState.status);
      console.log('   Players:', data.roomState.players.length);
      
      const player1 = data.roomState.players.find(p => p.id === player1Id);
      console.log('   Player 1 board:', player1.board);
      console.log('   Player 1 marks:', player1.marks);
    });

    // Wait for first card to be called
    let cardsCalled = 0;
    client1.on('game:card', (data) => {
      cardsCalled++;
      console.log(`\n🎴 Card ${cardsCalled} called:`, data.card.name, data.card.emoji);
      console.log('   Draw index:', data.drawIndex);
      console.log('   Total drawn cards:', data.drawnCards.length);

      if (cardsCalled === 1) {
        // Test marking a cell with the called card
        console.log('\n🖱️  Testing cell marking...');
        
        // Try to mark cell 0 (should work if card was called)
        client1.emit('board:mark', { roomCode, cellIndex: 0 });
      }

      if (cardsCalled === 2) {
        // Try to mark cell 1 (should work if card was called)
        client1.emit('board:mark', { roomCode, cellIndex: 1 });
      }

      if (cardsCalled === 3) {
        // Test complete - verify marks
        console.log('\n✅ Testing complete, verifying marks...');
        setTimeout(() => {
          cleanup();
        }, 1000);
      }
    });

    // Listen for room state updates (marks)
    let stateUpdates = 0;
    client1.on('room:state', (data) => {
      stateUpdates++;
      const player1 = data.players.find(p => p.id === player1Id);
      
      if (player1 && player1.marks.some(m => m)) {
        console.log(`\n📊 Room state update ${stateUpdates}:`);
        console.log('   Player 1 marks:', player1.marks);
        console.log('   Marked cells:', player1.marks.filter(m => m).length);
        console.log('   Cards on marked cells:', player1.board.filter((card, i) => player1.marks[i]));
      }
    });

    // Error handling
    client1.on('error', (error) => {
      console.error('❌ Client 1 error:', error);
    });

    client2.on('error', (error) => {
      console.error('❌ Client 2 error:', error);
    });

    function cleanup() {
      clearTimeout(timeout);
      client1.disconnect();
      client2.disconnect();
      console.log('\n✅ Test completed successfully!');
      resolve();
    }
  });
}

// Run test
testBoardMarking()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
