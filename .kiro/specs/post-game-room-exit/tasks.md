# Implementation Plan: Post-Game Room Exit and Reset

- [x] 1. Add new socket event type definitions
  - Update `shared/types/socket-events.ts` to add `room:leave` and `game:reset` events to ClientToServerEvents interface
  - Add `room:left` and `game:reset` events to ServerToClientEvents interface
  - _Requirements: 1.1, 1.2, 2.2_

- [x] 2. Implement server-side room reset functionality
  - [x] 2.1 Add `resetGame()` method to RoomManager class
    - Validate room exists and status is "ENDED"
    - Validate requester is the host
    - Reset room state (status to "WAITING", clear winnerId, reset drawIndex, clear drawnCards)
    - Generate new unique boards for all players using `generateBoardsForRoom()`
    - Reset all player marks to empty arrays
    - Return updated room state
    - _Requirements: 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 2.2 Add unit tests for resetGame method
    - Test successful reset by host
    - Test rejection when non-host attempts reset
    - Test rejection when room not found
    - Test rejection when game status is not "ENDED"
    - Test board uniqueness after reset
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 3. Implement server-side socket event handlers
  - [x] 3.1 Add `room:leave` event handler
    - Validate room exists
    - Call `roomManager.removePlayer(roomCode, playerId)`
    - Emit `room:left` confirmation to leaving player
    - Broadcast `player:left` event to remaining players
    - Broadcast updated `room:state` to remaining players
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Add `game:reset` event handler
    - Validate room exists
    - Validate requester is the host
    - Validate game status is "ENDED"
    - Call `roomManager.resetGame(roomCode, hostId, io)`
    - Handle errors and emit appropriate error events
    - Broadcast `game:reset` event with updated room state to all players
    - _Requirements: 2.2, 2.3, 2.6, 4.1_

- [x] 4. Enhance client-side socket hook
  - [x] 4.1 Add emit functions to useSocket hook
    - Implement `leaveRoom()` function that emits `room:leave` event
    - Implement `resetGame()` function that emits `game:reset` event
    - Export both functions from the hook
    - _Requirements: 1.2, 2.2_
  
  - [x] 4.2 Add event listeners to useSocket hook
    - Add `room:left` event listener that navigates to home screen
    - Add `game:reset` event listener that updates room state and navigates to lobby
    - Add error handling for both events
    - Clean up listeners on unmount
    - _Requirements: 1.3, 2.7_

- [x] 5. Update Game component UI
  - [x] 5.1 Add post-game action buttons
    - Create action buttons container that displays when `roomState.status === 'ENDED'`
    - Add "Leave Room" button visible to all players
    - Add "Play Again" button visible only when current player is host
    - Style buttons with Día de Muertos theme (orange gradient for primary, gray for secondary)
    - Make buttons mobile-responsive with proper spacing
    - _Requirements: 1.1, 2.1, 3.3, 3.4, 3.5_
  
  - [x] 5.2 Wire up button click handlers
    - Connect "Leave Room" button to `leaveRoom()` function from useSocket
    - Connect "Play Again" button to `resetGame()` function from useSocket
    - Disable game board interaction when status is "ENDED"
    - _Requirements: 1.2, 2.2, 3.2_
  
  - [x] 5.3 Add error handling and user feedback
    - Display error toast when reset fails
    - Display error toast when non-host attempts reset
    - Handle network errors gracefully
    - _Requirements: 4.1_

- [ ] 6. Handle edge cases and host reassignment
  - [ ] 6.1 Test and verify host reassignment on leave
    - Verify that when host leaves a completed game, a new host is assigned
    - Verify new host can reset the game
    - Verify "Play Again" button appears for new host
    - _Requirements: 4.2, 4.3_
  
  - [ ] 6.2 Test room cleanup when all players leave
    - Verify room is deleted when last player leaves
    - Verify no memory leaks or orphaned intervals
    - _Requirements: 1.5, 4.3_
  
  - [ ] 6.3 Handle disconnected players during reset
    - Verify disconnected players remain disconnected after reset
    - Verify connected players receive new boards
    - Verify game state validation before transitioning to "WAITING"
    - _Requirements: 4.4, 4.5_

- [ ]* 7. Integration testing
  - Test complete leave flow (player leaves, others see update)
  - Test complete reset flow (host resets, all players get new boards and navigate to lobby)
  - Test host leaves and new host resets
  - Test all players leave sequentially
  - Test reset with mix of connected and disconnected players
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.6, 2.7_
