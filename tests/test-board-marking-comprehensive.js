// Comprehensive test for board marking functionality
import { io as ioClient } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testBoardMarkingComprehensive() {
  console.log('🧪 Comprehensive Board Marking Test\n');

  const client1 = ioClient(SERVER_URL);
  const client2 = ioClient(SERVER_URL);

  let roomCode = '';
  let player1Id = '';
  let player2Id = '';
  let player1Board = [];
  let player2Board = [];

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout'));
    }, 20000);

    // Client 1: Create room
    client1.on('connect', () => {
      player1Id = client1.id;
      console.log('✅ Client 1 connected:', player1Id);
      client1.emit('room:create', { name: 'Tester 1' });
    });

    client1.on('room:created', (data) => {
      roomCode = data.roomCode;
      console.log('✅ Room created:', roomCode);
      client2.emit('room:join', { roomCode, name: 'Tester 2' });
    });

    // Client 2: Connected
    client2.on('connect', () => {
      player2Id = client2.id;
      console.log('✅ Client 2 connected:', player2Id);
    });

    client2.on('room:joined', () => {
      console.log('✅ Client 2 joined room');
      client1.emit('game:start', { roomCode });
    });

    // Game started
    client1.on('game:started', (data) => {
      console.log('\n✅ Game started');
      const p1 = data.roomState.players.find(p => p.id === player1Id);
      const p2 = data.roomState.players.find(p => p.id === player2Id);
      player1Board = p1.board;
      player2Board = p2.board;
      
      console.log('   Player 1 board:', player1Board.slice(0, 4).join(', '), '...');
      console.log('   Player 2 board:', player2Board.slice(0, 4).join(', '), '...');
    });

    // Track called cards and test marking
    const calledCards = new Set();
    let testsPassed = 0;
    let testsFailed = 0;

    client1.on('game:card', (data) => {
      calledCards.add(data.card.id);
      console.log(`\n🎴 Card called: ${data.card.name} (${data.card.id})`);

      // Test 1: Mark a card that exists on player 1's board
      if (calledCards.size === 1) {
        const cardIndex = player1Board.indexOf(data.card.id);
        if (cardIndex !== -1) {
          console.log(`   ✓ Card found on Player 1 board at index ${cardIndex}`);
          console.log('   → Marking cell...');
          client1.emit('board:mark', { roomCode, cellIndex: cardIndex });
        } else {
          console.log('   ✗ Card not on Player 1 board');
        }
      }

      // Test 2: Try to mark a card that hasn't been called yet
      if (calledCards.size === 2) {
        const uncalledCard = player1Board.find(card => !calledCards.has(card));
        if (uncalledCard) {
          const uncalledIndex = player1Board.indexOf(uncalledCard);
          console.log(`   → Testing validation: marking uncalled card at index ${uncalledIndex}`);
          client1.emit('board:mark', { roomCode, cellIndex: uncalledIndex });
        }
      }

      // Test 3: Mark multiple cards
      if (calledCards.size === 3) {
        const cardIndex = player1Board.indexOf(data.card.id);
        if (cardIndex !== -1) {
          console.log(`   ✓ Card found on Player 1 board at index ${cardIndex}`);
          console.log('   → Marking cell...');
          client1.emit('board:mark', { roomCode, cellIndex: cardIndex });
        }
      }

      // Test 4: Toggle mark (unmark a previously marked card)
      if (calledCards.size === 4) {
        const firstCalledCard = Array.from(calledCards)[0];
        const firstIndex = player1Board.indexOf(firstCalledCard);
        if (firstIndex !== -1) {
          console.log(`   → Testing toggle: unmarking cell ${firstIndex}`);
          client1.emit('board:mark', { roomCode, cellIndex: firstIndex });
        }
      }

      // Test 5: Player 2 marks their board
      if (calledCards.size === 5) {
        const cardIndex = player2Board.indexOf(data.card.id);
        if (cardIndex !== -1) {
          console.log(`   ✓ Card found on Player 2 board at index ${cardIndex}`);
          console.log('   → Player 2 marking cell...');
          client2.emit('board:mark', { roomCode, cellIndex: cardIndex });
        }
      }

      // Complete test after 6 cards
      if (calledCards.size === 6) {
        setTimeout(() => {
          console.log('\n📊 Test Summary:');
          console.log(`   ✅ Tests passed: ${testsPassed}`);
          console.log(`   ❌ Tests failed: ${testsFailed}`);
          cleanup();
        }, 1500);
      }
    });

    // Track room state updates
    let markCount = 0;
    client1.on('room:state', (data) => {
      const p1 = data.players.find(p => p.id === player1Id);
      const p2 = data.players.find(p => p.id === player2Id);
      
      if (p1 && p1.marks.some(m => m)) {
        const markedCount = p1.marks.filter(m => m).length;
        if (markedCount !== markCount) {
          markCount = markedCount;
          console.log(`   📍 Player 1 marks updated: ${markedCount} cells marked`);
          testsPassed++;
        }
      }
      
      if (p2 && p2.marks.some(m => m)) {
        console.log(`   📍 Player 2 marks updated: ${p2.marks.filter(m => m).length} cells marked`);
        testsPassed++;
      }
    });

    // Error handling
    client1.on('error', (error) => {
      if (error.code === 'CARD_NOT_CALLED') {
        console.log(`   ✅ Validation working: ${error.message}`);
        testsPassed++;
      } else {
        console.error(`   ❌ Unexpected error: ${error.message}`);
        testsFailed++;
      }
    });

    client2.on('error', (error) => {
      console.error('   ❌ Client 2 error:', error.message);
      testsFailed++;
    });

    function cleanup() {
      clearTimeout(timeout);
      client1.disconnect();
      client2.disconnect();
      
      if (testsFailed === 0 && testsPassed >= 4) {
        console.log('\n✅ All tests passed successfully!');
        resolve();
      } else {
        reject(new Error(`Tests incomplete: ${testsPassed} passed, ${testsFailed} failed`));
      }
    }
  });
}

// Run test
testBoardMarkingComprehensive()
  .then(() => {
    console.log('\n🎉 Board marking functionality verified!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
