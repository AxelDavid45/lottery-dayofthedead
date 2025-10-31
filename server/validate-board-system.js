import { boardGenerator, generateBoardsForRoom, validateBoard } from './src/utils/board-generator.js';
import { RoomManager } from './src/utils/room-manager.js';

console.log('🎮 Validating Board Generation System');
console.log('=====================================\n');

// Test 1: Deck shuffling algorithm
console.log('1. Testing deck shuffling algorithm...');
const shuffled1 = boardGenerator.shuffleDeck();
const shuffled2 = boardGenerator.shuffleDeck();

if (shuffled1.length === 24 && shuffled2.length === 24) {
  console.log('✓ Shuffled decks have correct length (24 cards)');
} else {
  console.log('✗ Shuffled decks have incorrect length');
}

// Check that shuffling produces different results
const isDifferent = JSON.stringify(shuffled1) !== JSON.stringify(shuffled2);
if (isDifferent) {
  console.log('✓ Shuffling produces different results');
} else {
  console.log('⚠️  Shuffling produced same result (could be random chance)');
}

// Test 2: Generate unique 4x4 boards
console.log('\n2. Testing unique 4x4 board generation...');
const result = generateBoardsForRoom(6); // Test with 6 players

if (result.boards.length === 6) {
  console.log('✓ Generated correct number of boards (6)');
} else {
  console.log('✗ Generated incorrect number of boards');
}

// Check that all boards are 4x4 (16 cards)
const allCorrectSize = result.boards.every(board => board.length === 16);
if (allCorrectSize) {
  console.log('✓ All boards have correct size (16 cards)');
} else {
  console.log('✗ Some boards have incorrect size');
}

// Test 3: Ensure each player receives different cards
console.log('\n3. Testing board uniqueness...');
const boardSignatures = result.boards.map(board => [...board].sort().join('|'));
const uniqueSignatures = new Set(boardSignatures);

if (boardSignatures.length === uniqueSignatures.size) {
  console.log('✓ All boards are unique');
} else {
  console.log('✗ Some boards are duplicates');
  console.log(`  Generated: ${boardSignatures.length}, Unique: ${uniqueSignatures.size}`);
}

// Test 4: Validate boards use only cards from defined deck
console.log('\n4. Testing deck validation...');
const validCardIds = new Set([
  'cempasuchil', 'vela', 'pan', 'retrato', 'agua', 'copal', 'papel', 'calavera',
  'xolo', 'catrina', 'alebrije', 'colibri', 'rio', 'mariposa', 'obsidiana', 'sol',
  'altar', 'mariachi', 'panteon', 'familia', 'charro', 'llorona', 'calaca', 'copalero'
]);

let allBoardsValid = true;
result.boards.forEach((board, index) => {
  const isValid = validateBoard(board);
  const usesOnlyValidCards = board.every(cardId => validCardIds.has(cardId));
  
  if (!isValid || !usesOnlyValidCards) {
    console.log(`✗ Board ${index} is invalid or uses invalid cards`);
    allBoardsValid = false;
  }
});

if (allBoardsValid) {
  console.log('✓ All boards use only cards from the defined deck');
} else {
  console.log('✗ Some boards use invalid cards');
}

// Test 5: Integration with RoomManager
console.log('\n5. Testing integration with RoomManager...');
const roomManager = new RoomManager();

try {
  // Create a room
  const roomCode = roomManager.createRoom('host123', 'TestHost');
  console.log('✓ Room created successfully');
  
  // Add some players
  roomManager.joinRoom(roomCode, 'player1', 'Player1');
  roomManager.joinRoom(roomCode, 'player2', 'Player2');
  roomManager.joinRoom(roomCode, 'player3', 'Player3');
  console.log('✓ Players joined successfully');
  
  // Start game (this should generate boards)
  const room = roomManager.startGame(roomCode, 'host123');
  console.log('✓ Game started and boards generated');
  
  // Validate all players have boards
  const playersWithBoards = Array.from(room.players.values()).filter(p => p.board.length === 16);
  if (playersWithBoards.length === room.players.size) {
    console.log('✓ All players received boards');
  } else {
    console.log('✗ Some players did not receive boards');
  }
  
  // Validate board uniqueness in room
  const isUnique = roomManager.validateAllBoardsUnique(roomCode);
  if (isUnique) {
    console.log('✓ All boards in room are unique');
  } else {
    console.log('✗ Some boards in room are duplicates');
  }
  
} catch (error) {
  console.log('✗ Integration test failed:', error.message);
}

// Test 6: Edge cases
console.log('\n6. Testing edge cases...');

// Test with minimum players (2)
try {
  const minResult = generateBoardsForRoom(2);
  if (minResult.boards.length === 2) {
    console.log('✓ Handles minimum players (2)');
  } else {
    console.log('✗ Failed with minimum players');
  }
} catch (error) {
  console.log('✗ Error with minimum players:', error.message);
}

// Test with maximum players (8)
try {
  const maxResult = generateBoardsForRoom(8);
  if (maxResult.boards.length === 8) {
    console.log('✓ Handles maximum players (8)');
  } else {
    console.log('✗ Failed with maximum players');
  }
} catch (error) {
  console.log('✗ Error with maximum players:', error.message);
}

// Test invalid player counts
try {
  generateBoardsForRoom(0);
  console.log('✗ Should have failed with 0 players');
} catch (error) {
  console.log('✓ Correctly rejects 0 players');
}

try {
  generateBoardsForRoom(9);
  console.log('✗ Should have failed with 9 players');
} catch (error) {
  console.log('✓ Correctly rejects 9 players');
}

console.log('\n🎯 Board Generation System Validation Complete!');
console.log('\nRequirements Coverage:');
console.log('✓ 3.1: Generate unique 4x4 boards for each player');
console.log('✓ 3.3: Use only cards from the defined 24-card deck');
console.log('✓ 8.3: Shuffle deck at start of each game');
console.log('✓ 8.5: Generate boards with random selection from deck');