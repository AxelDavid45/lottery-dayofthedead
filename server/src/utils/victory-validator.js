// Victory validation utilities for Lotería game

/**
 * Validates if a player's board is complete (all 16 cells marked)
 * @param {boolean[]} marks - Array of 16 boolean values representing marked cells
 * @returns {boolean} - True if all cells are marked
 */
export function isBoardComplete(marks) {
  if (!Array.isArray(marks) || marks.length !== 16) {
    return false;
  }
  return marks.every(mark => mark === true);
}

/**
 * Validates if all marked cards on a player's board have been called
 * @param {string[]} board - Array of 16 card IDs on the player's board
 * @param {boolean[]} marks - Array of 16 boolean values representing marked cells
 * @param {Set<string>} drawnCards - Set of card IDs that have been called
 * @returns {{ isValid: boolean, invalidCards: string[] }} - Validation result with list of invalid cards
 */
export function validateMarkedCards(board, marks, drawnCards) {
  if (!Array.isArray(board) || board.length !== 16) {
    return { isValid: false, invalidCards: [] };
  }
  
  if (!Array.isArray(marks) || marks.length !== 16) {
    return { isValid: false, invalidCards: [] };
  }

  const invalidCards = [];

  for (let i = 0; i < board.length; i++) {
    if (marks[i] && !drawnCards.has(board[i])) {
      invalidCards.push(board[i]);
    }
  }

  return {
    isValid: invalidCards.length === 0,
    invalidCards
  };
}

/**
 * Comprehensive victory validation
 * @param {Object} player - Player state object
 * @param {Set<string>} drawnCards - Set of card IDs that have been called
 * @returns {{ isValid: boolean, reason?: string, details?: any }} - Validation result
 */
export function validateVictory(player, drawnCards) {
  if (!player) {
    return { 
      isValid: false, 
      reason: 'PLAYER_NOT_FOUND',
      details: 'Player object is null or undefined'
    };
  }

  // Check if board is complete (all 16 cells marked)
  if (!isBoardComplete(player.marks)) {
    const markedCount = player.marks.filter(m => m === true).length;
    return { 
      isValid: false, 
      reason: 'BOARD_NOT_COMPLETE',
      details: `Only ${markedCount}/16 cells are marked`
    };
  }

  // Validate that all marked cards have been called
  const validation = validateMarkedCards(player.board, player.marks, drawnCards);
  
  if (!validation.isValid) {
    return { 
      isValid: false, 
      reason: 'INVALID_MARKS',
      details: `Cards not yet called: ${validation.invalidCards.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Process a victory claim with tie-breaking logic
 * Claims are processed in order of arrival (first valid claim wins)
 * @param {Object} room - Room state object
 * @param {string} playerId - ID of the player making the claim
 * @returns {{ success: boolean, winnerId?: string, reason?: string, details?: any }}
 */
export function processClaim(room, playerId) {
  if (!room) {
    return {
      success: false,
      reason: 'ROOM_NOT_FOUND',
      details: 'Room does not exist'
    };
  }

  if (room.status !== 'RUNNING') {
    return {
      success: false,
      reason: 'GAME_NOT_RUNNING',
      details: `Game status is ${room.status}`
    };
  }

  // Check if there's already a winner (tie-breaking: first claim wins)
  if (room.winnerId) {
    return {
      success: false,
      reason: 'GAME_ALREADY_ENDED',
      details: `Winner already declared: ${room.winnerId}`
    };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return {
      success: false,
      reason: 'PLAYER_NOT_FOUND',
      details: 'Player not found in room'
    };
  }

  // Validate the victory
  const validation = validateVictory(player, room.drawnCards);
  
  if (!validation.isValid) {
    return {
      success: false,
      reason: validation.reason,
      details: validation.details
    };
  }

  // Claim is valid - this player wins
  return {
    success: true,
    winnerId: playerId,
    playerName: player.name
  };
}

/**
 * Get statistics about a player's board state
 * @param {Object} player - Player state object
 * @param {Set<string>} drawnCards - Set of card IDs that have been called
 * @returns {Object} - Statistics about the board
 */
export function getBoardStats(player, drawnCards) {
  if (!player) {
    return null;
  }

  const totalCells = 16;
  const markedCells = player.marks.filter(m => m === true).length;
  const unmarkedCells = totalCells - markedCells;
  
  let validMarks = 0;
  let invalidMarks = 0;
  let availableToMark = 0;

  for (let i = 0; i < player.board.length; i++) {
    const cardId = player.board[i];
    const isMarked = player.marks[i];
    const hasBeenCalled = drawnCards.has(cardId);

    if (isMarked && hasBeenCalled) {
      validMarks++;
    } else if (isMarked && !hasBeenCalled) {
      invalidMarks++;
    } else if (!isMarked && hasBeenCalled) {
      availableToMark++;
    }
  }

  return {
    totalCells,
    markedCells,
    unmarkedCells,
    validMarks,
    invalidMarks,
    availableToMark,
    isComplete: markedCells === totalCells,
    isValid: invalidMarks === 0
  };
}
