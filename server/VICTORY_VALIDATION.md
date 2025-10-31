# Victory Validation and Tie-Breaking Implementation

## Overview

This document describes the implementation of victory validation and tie-breaking logic for the Lotería del Mictlán game, as specified in Task 7 of the implementation plan.

## Requirements Addressed

- **Requisito 5.2**: Validate that all 16 cells on the board are marked
- **Requisito 5.3**: Verify that all marked cards are in the set of called cards
- **Requisito 5.5**: Accept only the first valid claim and notify all players
- **Requisito 9.1**: Process claims in the exact order they arrive at the server
- **Requisito 9.2**: Declare only the first valid claim as winner (tie-breaking)
- **Requisito 9.5**: Terminate the game immediately after declaring a winner

## Implementation Components

### 1. Victory Validator Module (`server/src/utils/victory-validator.js`)

This module provides comprehensive validation utilities:

#### `isBoardComplete(marks)`
- Validates that all 16 cells on a player's board are marked
- Returns `true` if all marks are `true`, `false` otherwise
- Handles edge cases (null, undefined, wrong array length)

#### `validateMarkedCards(board, marks, drawnCards)`
- Verifies that all marked cards have been called
- Returns validation result with list of invalid cards
- Ensures players can only claim victory with legitimately marked cards

#### `validateVictory(player, drawnCards)`
- Comprehensive victory validation combining both checks
- Returns detailed validation result with reason and details
- Used by the room manager to validate claims

#### `processClaim(room, playerId)`
- High-level claim processing with tie-breaking logic
- Checks game state, winner status, and validates the claim
- Returns success/failure with detailed information

#### `getBoardStats(player, drawnCards)`
- Provides detailed statistics about a player's board state
- Useful for debugging and displaying game progress
- Returns counts of marked, valid, invalid, and available cells

### 2. Room Manager Updates (`server/src/utils/room-manager.js`)

Enhanced the `validateClaim` method:
- Uses the new validation utilities
- Checks if a winner has already been declared (tie-breaking)
- Provides detailed logging for debugging
- Returns comprehensive validation results

Enhanced the `endGame` method:
- Prevents multiple winners (first valid claim wins)
- Stops card calling immediately
- Broadcasts winner with board statistics
- Provides detailed logging of game end

Added `getPlayerBoardStats` method:
- Allows querying board statistics for any player
- Useful for debugging and monitoring game state

### 3. Socket Handler Updates (`server/src/handlers/socket-handlers.js`)

Enhanced the `game:claim` event handler:
- Validates room and game state before processing
- Checks for existing winner (tie-breaking)
- Provides detailed error messages with validation details
- Logs all claim attempts with success/failure status
- Immediately ends game on first valid claim

## Tie-Breaking Logic

The tie-breaking mechanism ensures only one winner per game:

1. **First Check**: Before validating, check if `room.winnerId` is already set
2. **Atomic Operation**: The first claim to pass validation sets `room.winnerId`
3. **Rejection**: All subsequent claims are rejected with `GAME_ALREADY_ENDED`
4. **Immediate Termination**: Game ends immediately when winner is declared

This implements a "first-come-first-served" approach where the first valid claim wins, even if multiple players complete their boards simultaneously.

## Validation Flow

```
Player clicks "¡Lotería!" button
    ↓
Client emits 'game:claim' event
    ↓
Server receives claim (in order of arrival)
    ↓
Check if game is running
    ↓
Check if winner already declared ← TIE-BREAKING
    ↓
Validate board complete (16 cells marked)
    ↓
Validate all marked cards were called
    ↓
If valid: Set winner, stop game, broadcast
If invalid: Send error to player
```

## Error Codes

- `ROOM_NOT_FOUND`: Room doesn't exist
- `GAME_NOT_RUNNING`: Game is not in RUNNING state
- `GAME_ALREADY_ENDED`: Winner already declared (tie-breaking)
- `PLAYER_NOT_FOUND`: Player not found in room
- `BOARD_NOT_COMPLETE`: Not all 16 cells are marked
- `INVALID_MARKS`: Some marked cards haven't been called

## Testing

### Unit Tests (`server/test-victory-logic.js`)
- Tests all validation functions in isolation
- Verifies edge cases and error handling
- Confirms correct behavior for valid and invalid scenarios

### Integration Tests (`tests/test-victory-validation.js`)
- Tests complete claim flow with Socket.IO
- Verifies tie-breaking with simultaneous claims
- Tests error handling for invalid claims

Run unit tests:
```bash
cd server
node test-victory-logic.js
```

Run integration tests (requires server running):
```bash
cd tests
node test-victory-validation.js
```

## Game Termination

When a valid claim is processed:

1. **Stop Card Calling**: `clearInterval(room.gameInterval)`
2. **Update Room State**: Set `room.status = 'ENDED'` and `room.winnerId`
3. **Broadcast Winner**: Emit `game:winner` event to all players
4. **Include Statistics**: Send board stats with winner notification
5. **Log Results**: Console log with winner name and game statistics

## Performance Considerations

- Validation is O(n) where n=16 (board size), very fast
- Tie-breaking check is O(1) (simple property check)
- No database queries or external calls
- All validation happens in-memory

## Security Considerations

- All validation happens server-side (client cannot cheat)
- Marked cards are verified against server's drawn cards set
- Board completeness is verified independently
- First valid claim wins (prevents race conditions)

## Future Enhancements

Potential improvements for future versions:
- Add claim timestamps for analytics
- Track invalid claim attempts per player
- Implement claim cooldown to prevent spam
- Add replay/review functionality for close games
- Store game history for statistics
