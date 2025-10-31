// Test script to verify card calling mechanism
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

async function testCardCalling() {
  console.log('🧪 Testing Card Calling Mechanism...\n');

  // Create a room with host
  console.log('Test 1: Creating room and adding players...');
  const hostSocket = io(SERVER_URL);
  
  const roomCode = await new Promise((resolve) => {
    hostSocket.on('connect', () => {
      console.log('✅ Host connected');
      
      hostSocket.emit('room:create', { name: 'Host' });
      
      hostSocket.on('room:created', (data) => {
        console.log('✅ Room created:', data.roomCode);
        resolve(data.roomCode);
      });
      
      hostSocket.on('error', (error) => {
        console.log('❌ Error:', error);
        resolve(null);
      });
    });
  });

  if (!roomCode) {
    console.log('❌ Failed to create room');
    process.exit(1);
  }

  // Add a second player
  const playerSocket = io(SERVER_URL);
  
  await new Promise((resolve) => {
    playerSocket.on('connect', () => {
      console.log('✅ Player connected');
      
      playerSocket.emit('room:join', { roomCode, name: 'Player1' });
      
      playerSocket.on('room:joined', (data) => {
        console.log('✅ Player joined, total players:', data.roomState.players.length);
        resolve();
      });
    });
  });

  // Test 2: Start the game and listen for card events
  console.log('\nTest 2: Starting game and monitoring card calling...');
  
  const cardsReceived = [];
  let gameStarted = false;

  hostSocket.on('game:started', (data) => {
    gameStarted = true;
    console.log('✅ Game started');
    console.log('✅ Room status:', data.roomState.status);
    console.log('✅ Players have boards:', data.roomState.players.every(p => p.board.length === 16));
  });

  hostSocket.on('game:card', (data) => {
    cardsReceived.push(data);
    console.log(`✅ Card ${data.drawIndex}/${data.totalCards} called: ${data.card.name} ${data.card.emoji}`);
    console.log(`   Total drawn cards: ${data.drawnCards.length}`);
  });

  playerSocket.on('game:card', (data) => {
    console.log(`   Player also received: ${data.card.name}`);
  });

  // Start the game
  hostSocket.emit('game:start', { roomCode });

  // Wait for several cards to be called
  await new Promise((resolve) => setTimeout(resolve, 13000)); // Wait for ~3 cards (4s interval)

  // Test 3: Verify card calling behavior
  console.log('\nTest 3: Verifying card calling behavior...');
  
  if (!gameStarted) {
    console.log('❌ Game did not start');
  } else {
    console.log('✅ Game started successfully');
  }

  if (cardsReceived.length >= 3) {
    console.log(`✅ Received ${cardsReceived.length} cards`);
  } else {
    console.log(`⚠️  Only received ${cardsReceived.length} cards (expected at least 3)`);
  }

  // Verify cards are unique
  const cardIds = cardsReceived.map(c => c.card.id);
  const uniqueCards = new Set(cardIds);
  if (cardIds.length === uniqueCards.size) {
    console.log('✅ All cards are unique (no repeats)');
  } else {
    console.log('❌ Found duplicate cards');
  }

  // Verify drawIndex increments correctly
  const indices = cardsReceived.map(c => c.drawIndex);
  const correctSequence = indices.every((idx, i) => idx === i + 1);
  if (correctSequence) {
    console.log('✅ Draw indices increment correctly');
  } else {
    console.log('❌ Draw indices are not sequential');
  }

  // Verify drawnCards accumulates
  const lastCard = cardsReceived[cardsReceived.length - 1];
  if (lastCard && lastCard.drawnCards.length === cardsReceived.length) {
    console.log('✅ Drawn cards history accumulates correctly');
  } else {
    console.log('❌ Drawn cards history is incorrect');
  }

  // Test 4: Test board marking
  console.log('\nTest 4: Testing board marking...');
  
  // Get player's board
  let playerBoard = null;
  playerSocket.on('room:state', (data) => {
    const player = data.players.find(p => p.name === 'Player1');
    if (player) {
      playerBoard = player.board;
    }
  });

  // Try to mark a card that was called
  if (cardsReceived.length > 0) {
    const calledCardId = cardsReceived[0].card.id;
    
    // Wait a bit for room state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the index of this card in player's board
    if (playerBoard) {
      const cellIndex = playerBoard.indexOf(calledCardId);
      
      if (cellIndex !== -1) {
        console.log(`✅ Found called card "${calledCardId}" at index ${cellIndex} in player's board`);
        
        playerSocket.emit('board:mark', { roomCode, cellIndex });
        
        await new Promise((resolve) => {
          playerSocket.on('room:state', (data) => {
            const player = data.players.find(p => p.name === 'Player1');
            if (player && player.marks[cellIndex]) {
              console.log('✅ Cell marked successfully');
              resolve();
            }
          });
          
          setTimeout(resolve, 2000);
        });
      } else {
        console.log('⚠️  Called card not in player\'s board (this is normal)');
      }
    }
  }

  // Cleanup
  console.log('\n🧹 Cleaning up...');
  hostSocket.disconnect();
  playerSocket.disconnect();
  
  console.log('\n✅ Card calling tests completed!');
  process.exit(0);
}

testCardCalling().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
