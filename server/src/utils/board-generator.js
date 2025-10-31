import { DECK, GAME_CONSTANTS } from '../../../shared/types/deck.js';

/**
 * Board Generation System for Lotería del Mictlán
 * 
 * This module implements the unique board generation system according to requirements:
 * - 3.1: Generate unique 4x4 boards for each player
 * - 3.3: Use only cards from the defined 24-card deck
 * - 8.3: Shuffle deck at start of each game
 * - 8.5: Generate boards with random selection from the 24-card deck
 */

export class BoardGenerator {
  constructor() {
    this.usedBoards = new Set(); // Track generated boards to ensure uniqueness
  }

  /**
   * Shuffle deck using Fisher-Yates algorithm for true randomness
   * @returns {string[]} Array of shuffled card IDs
   */
  shuffleDeck() {
    const cardIds = DECK.map(card => card.id);
    const shuffled = [...cardIds];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Generate a unique 4x4 board for a player
   * @param {string[]} shuffledDeck - Pre-shuffled deck of card IDs
   * @param {Set<string>} usedCombinations - Set of already used card combinations
   * @returns {string[]} Array of 16 card IDs for the board
   */
  generateUniqueBoard(shuffledDeck, usedCombinations = new Set()) {
    if (!shuffledDeck || shuffledDeck.length !== GAME_CONSTANTS.DECK_SIZE) {
      throw new Error('Invalid shuffled deck provided');
    }

    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      // Generate a random selection of 16 cards from the 24-card deck
      const selectedIndices = this.selectRandomIndices(GAME_CONSTANTS.DECK_SIZE, GAME_CONSTANTS.BOARD_SIZE);
      const board = selectedIndices.map(index => shuffledDeck[index]);
      
      // Create a unique identifier for this board combination
      const boardSignature = this.createBoardSignature(board);
      
      // Check if this combination has been used
      if (!usedCombinations.has(boardSignature)) {
        usedCombinations.add(boardSignature);
        return board;
      }
      
      attempts++;
    }
    
    // If we can't generate a unique board after max attempts, 
    // fall back to a simple sequential selection with random offset
    console.warn('Could not generate unique board after max attempts, using fallback method');
    return this.generateFallbackBoard(shuffledDeck, usedCombinations.size);
  }

  /**
   * Select random indices without replacement
   * @param {number} totalCount - Total number of items to select from
   * @param {number} selectCount - Number of items to select
   * @returns {number[]} Array of selected indices
   */
  selectRandomIndices(totalCount, selectCount) {
    const indices = Array.from({ length: totalCount }, (_, i) => i);
    const selected = [];
    
    for (let i = 0; i < selectCount; i++) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      selected.push(indices[randomIndex]);
      indices.splice(randomIndex, 1);
    }
    
    return selected.sort((a, b) => a - b); // Sort for consistency
  }

  /**
   * Create a unique signature for a board combination
   * @param {string[]} board - Array of card IDs
   * @returns {string} Unique signature string
   */
  createBoardSignature(board) {
    return [...board].sort().join('|');
  }

  /**
   * Fallback board generation method when uniqueness is difficult to achieve
   * @param {string[]} shuffledDeck - Pre-shuffled deck
   * @param {number} offset - Offset to create variation
   * @returns {string[]} Array of 16 card IDs
   */
  generateFallbackBoard(shuffledDeck, offset = 0) {
    const startIndex = offset % (GAME_CONSTANTS.DECK_SIZE - GAME_CONSTANTS.BOARD_SIZE);
    return shuffledDeck.slice(startIndex, startIndex + GAME_CONSTANTS.BOARD_SIZE);
  }

  /**
   * Generate boards for all players in a room
   * @param {number} playerCount - Number of players
   * @returns {Object} Object containing shuffled deck and array of unique boards
   */
  generateBoardsForRoom(playerCount) {
    if (playerCount < 1 || playerCount > GAME_CONSTANTS.MAX_PLAYERS) {
      throw new Error(`Invalid player count: ${playerCount}. Must be between 1 and ${GAME_CONSTANTS.MAX_PLAYERS}`);
    }

    // Shuffle the deck once for the entire room
    const shuffledDeck = this.shuffleDeck();
    const boards = [];
    const usedCombinations = new Set();

    // Generate unique board for each player
    for (let i = 0; i < playerCount; i++) {
      const board = this.generateUniqueBoard(shuffledDeck, usedCombinations);
      boards.push(board);
    }

    return {
      shuffledDeck,
      boards
    };
  }

  /**
   * Validate that a board only contains cards from the defined deck
   * @param {string[]} board - Board to validate
   * @returns {boolean} True if valid, false otherwise
   */
  validateBoard(board) {
    if (!Array.isArray(board) || board.length !== GAME_CONSTANTS.BOARD_SIZE) {
      return false;
    }

    const validCardIds = new Set(DECK.map(card => card.id));
    
    return board.every(cardId => {
      return typeof cardId === 'string' && validCardIds.has(cardId);
    });
  }

  /**
   * Check if two boards are different (no duplicate boards)
   * @param {string[]} board1 - First board
   * @param {string[]} board2 - Second board
   * @returns {boolean} True if boards are different
   */
  areBoardsDifferent(board1, board2) {
    if (!board1 || !board2 || board1.length !== board2.length) {
      return true;
    }

    const signature1 = this.createBoardSignature(board1);
    const signature2 = this.createBoardSignature(board2);
    
    return signature1 !== signature2;
  }

  /**
   * Reset the used boards tracker (useful for testing or new games)
   */
  reset() {
    this.usedBoards.clear();
  }

  /**
   * Get statistics about board generation
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalUniqueBoardsGenerated: this.usedBoards.size,
      maxPossibleBoards: this.calculateMaxPossibleBoards(),
      deckSize: GAME_CONSTANTS.DECK_SIZE,
      boardSize: GAME_CONSTANTS.BOARD_SIZE
    };
  }

  /**
   * Calculate theoretical maximum number of unique boards
   * @returns {number} Maximum possible unique boards
   */
  calculateMaxPossibleBoards() {
    // This is C(24,16) = 24!/(16! * 8!) = 735,471
    // But for practical purposes, we'll use a simplified calculation
    let result = 1;
    for (let i = 0; i < GAME_CONSTANTS.BOARD_SIZE; i++) {
      result *= (GAME_CONSTANTS.DECK_SIZE - i) / (i + 1);
    }
    return Math.floor(result);
  }
}

// Export singleton instance
export const boardGenerator = new BoardGenerator();

// Export utility functions for direct use
export function shuffleDeck() {
  return boardGenerator.shuffleDeck();
}

export function generateUniqueBoard(shuffledDeck, usedCombinations) {
  return boardGenerator.generateUniqueBoard(shuffledDeck, usedCombinations);
}

export function generateBoardsForRoom(playerCount) {
  return boardGenerator.generateBoardsForRoom(playerCount);
}

export function validateBoard(board) {
  return boardGenerator.validateBoard(board);
}