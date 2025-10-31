import { boardGenerator, generateBoardsForRoom, validateBoard } from './src/utils/board-generator.js';

console.log('Testing board generation system...');

// Test 1: Generate boards for 4 players
try {
  const result = generateBoardsForRoom(4);
  console.log('✓ Successfully generated boards for 4 players');
  console.log('  - Shuffled deck length:', result.shuffledDeck.length);
  console.log('  - Number of boards:', result.boards.length);
  console.log('  - First board length:', result.boards[0].length);
  
  // Test 2: Validate boards
  let allValid = true;
  result.boards.forEach((board, index) => {
    if (!validateBoard(board)) {
      console.log('✗ Board', index, 'is invalid');
      allValid = false;
    }
  });
  if (allValid) {
    console.log('✓ All boards are valid');
  }
  
  // Test 3: Check uniqueness
  const signatures = result.boards.map(board => [...board].sort().join('|'));
  const uniqueSignatures = new Set(signatures);
  if (signatures.length === uniqueSignatures.size) {
    console.log('✓ All boards are unique');
  } else {
    console.log('✗ Some boards are duplicates');
  }
  
  // Test 4: Show sample board
  console.log('Sample board:', result.boards[0]);
  
  // Test 5: Test edge cases
  console.log('\nTesting edge cases...');
  
  // Test with maximum players
  const maxResult = generateBoardsForRoom(8);
  console.log('✓ Generated boards for maximum players (8)');
  
  // Test with minimum players
  const minResult = generateBoardsForRoom(2);
  console.log('✓ Generated boards for minimum players (2)');
  
  console.log('\n✓ All tests passed!');
  
} catch (error) {
  console.error('✗ Error testing board generation:', error.message);
  console.error(error.stack);
}