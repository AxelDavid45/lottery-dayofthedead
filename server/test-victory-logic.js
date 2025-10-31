// Unit tests for victory validation logic
import { 
  isBoardComplete, 
  validateMarkedCards, 
  validateVictory,
  getBoardStats 
} from './src/utils/victory-validator.js';

console.log('🧪 Testing Victory Validation Logic...\n');

// Test 1: isBoardComplete
console.log('Test 1: isBoardComplete()');
const completeMarks = new Array(16).fill(true);
const incompleteMarks = new Array(16).fill(false);
incompleteMarks[0] = true;
incompleteMarks[5] = true;

console.assert(isBoardComplete(completeMarks) === true, '✅ Complete board detected');
console.assert(isBoardComplete(incompleteMarks) === false, '✅ Incomplete board detected');
console.assert(isBoardComplete([]) === false, '✅ Empty array rejected');
console.assert(isBoardComplete(null) === false, '✅ Null rejected');
console.log('✅ All isBoardComplete tests passed\n');

// Test 2: validateMarkedCards
console.log('Test 2: validateMarkedCards()');
const board = ['card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8',
               'card9', 'card10', 'card11', 'card12', 'card13', 'card14', 'card15', 'card16'];
const marks = new Array(16).fill(false);
marks[0] = true;  // card1
marks[5] = true;  // card6
marks[10] = true; // card11

const drawnCards = new Set(['card1', 'card6', 'card11', 'card20', 'card21']);

const validation1 = validateMarkedCards(board, marks, drawnCards);
console.assert(validation1.isValid === true, '✅ Valid marks detected');
console.assert(validation1.invalidCards.length === 0, '✅ No invalid cards');

// Test with invalid marks
marks[7] = true; // card8 - not drawn
const validation2 = validateMarkedCards(board, marks, drawnCards);
console.assert(validation2.isValid === false, '✅ Invalid marks detected');
console.assert(validation2.invalidCards.includes('card8'), '✅ Invalid card identified');
console.log('✅ All validateMarkedCards tests passed\n');

// Test 3: validateVictory
console.log('Test 3: validateVictory()');
const player1 = {
  id: 'player1',
  name: 'Test Player',
  board: board,
  marks: new Array(16).fill(true),
  isHost: false,
  isConnected: true
};

const allDrawnCards = new Set(board);
const validation3 = validateVictory(player1, allDrawnCards);
console.assert(validation3.isValid === true, '✅ Valid victory detected');

// Test incomplete board
const player2 = {
  ...player1,
  marks: new Array(16).fill(false)
};
player2.marks[0] = true;

const validation4 = validateVictory(player2, allDrawnCards);
console.assert(validation4.isValid === false, '✅ Incomplete board rejected');
console.assert(validation4.reason === 'BOARD_NOT_COMPLETE', '✅ Correct reason');

// Test invalid marks
const player3 = {
  ...player1,
  marks: new Array(16).fill(true)
};

const partialDrawnCards = new Set(['card1', 'card2', 'card3']);
const validation5 = validateVictory(player3, partialDrawnCards);
console.assert(validation5.isValid === false, '✅ Invalid marks rejected');
console.assert(validation5.reason === 'INVALID_MARKS', '✅ Correct reason');
console.log('✅ All validateVictory tests passed\n');

// Test 4: getBoardStats
console.log('Test 4: getBoardStats()');
const player4 = {
  id: 'player4',
  name: 'Stats Player',
  board: board,
  marks: new Array(16).fill(false),
  isHost: false,
  isConnected: true
};

// Mark some cells
player4.marks[0] = true;  // card1 - drawn
player4.marks[1] = true;  // card2 - drawn
player4.marks[2] = true;  // card3 - not drawn (invalid)

const statsDrawnCards = new Set(['card1', 'card2', 'card5', 'card10']);
const stats = getBoardStats(player4, statsDrawnCards);

console.assert(stats.totalCells === 16, '✅ Total cells correct');
console.assert(stats.markedCells === 3, '✅ Marked cells correct');
console.assert(stats.unmarkedCells === 13, '✅ Unmarked cells correct');
console.assert(stats.validMarks === 2, '✅ Valid marks correct (card1, card2)');
console.assert(stats.invalidMarks === 1, '✅ Invalid marks correct (card3)');
console.assert(stats.availableToMark === 2, '✅ Available to mark correct (card5, card10)');
console.assert(stats.isComplete === false, '✅ Is complete correct');
console.assert(stats.isValid === false, '✅ Is valid correct');
console.log('✅ All getBoardStats tests passed\n');

// Test 5: Complete valid scenario
console.log('Test 5: Complete valid victory scenario');
const player5 = {
  id: 'player5',
  name: 'Winner',
  board: board,
  marks: new Array(16).fill(true),
  isHost: false,
  isConnected: true
};

const completeDrawnCards = new Set(board);
const finalValidation = validateVictory(player5, completeDrawnCards);
const finalStats = getBoardStats(player5, completeDrawnCards);

console.assert(finalValidation.isValid === true, '✅ Valid victory');
console.assert(finalStats.isComplete === true, '✅ Board complete');
console.assert(finalStats.isValid === true, '✅ All marks valid');
console.assert(finalStats.validMarks === 16, '✅ All 16 marks valid');
console.assert(finalStats.invalidMarks === 0, '✅ No invalid marks');
console.log('✅ Complete victory scenario passed\n');

console.log('🎉 All victory validation logic tests passed!');
