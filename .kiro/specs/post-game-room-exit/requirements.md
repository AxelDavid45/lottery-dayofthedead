# Requirements Document

## Introduction

This feature enables players to manually exit a game room after a winner has been declared and allows them to start a new game session. Currently, when a game ends with a winner, players remain in the completed game state without a clear way to leave and start fresh. This enhancement provides explicit controls for post-game room management, allowing players to cleanly exit and rejoin new games.

## Glossary

- **Game Client**: The React frontend application that players interact with
- **Game Server**: The Node.js backend that manages game state and WebSocket connections
- **Room**: A game session identified by a unique code where players gather to play
- **Host**: The player who created the room and has administrative privileges
- **Player**: Any user connected to a room
- **Game State**: The current status of a room (waiting, playing, completed)
- **Session**: A complete game cycle from room creation to game completion

## Requirements

### Requirement 1

**User Story:** As a player, I want to leave the game room after the game ends, so that I can start or join a new game session

#### Acceptance Criteria

1. WHEN the game state is "completed", THE Game Client SHALL display a "Leave Room" button to all players
2. WHEN a player clicks the "Leave Room" button, THE Game Client SHALL disconnect the player from the current room
3. WHEN a player leaves a completed room, THE Game Client SHALL navigate the player to the home screen
4. WHEN a player disconnects from a completed room, THE Game Server SHALL remove the player from the room's player list
5. WHEN all players leave a completed room, THE Game Server SHALL delete the room from memory

### Requirement 2

**User Story:** As a host, I want to start a new game in the same room after the current game ends, so that the same group of players can play again without creating a new room

#### Acceptance Criteria

1. WHEN the game state is "completed", THE Game Client SHALL display a "Play Again" button to the host
2. WHEN the host clicks "Play Again", THE Game Client SHALL emit a reset game event to the Game Server
3. WHEN the Game Server receives a reset game event from the host, THE Game Server SHALL reset the room state to "waiting"
4. WHEN the room state resets to "waiting", THE Game Server SHALL clear all called cards from the deck
5. WHEN the room state resets to "waiting", THE Game Server SHALL generate new boards for all players
6. WHEN the room state resets to "waiting", THE Game Server SHALL broadcast the updated room state to all connected players
7. WHEN a player receives the updated room state, THE Game Client SHALL navigate the player to the lobby screen

### Requirement 3

**User Story:** As a player, I want to see clear visual indicators when the game ends, so that I understand the game is over and what actions I can take

#### Acceptance Criteria

1. WHEN a winner is declared, THE Game Client SHALL display a victory message with the winner's name
2. WHEN the game state is "completed", THE Game Client SHALL disable the game board interaction
3. WHEN the game state is "completed", THE Game Client SHALL display post-game action buttons in a prominent location
4. WHERE the player is the host, THE Game Client SHALL display both "Play Again" and "Leave Room" buttons
5. WHERE the player is not the host, THE Game Client SHALL display only the "Leave Room" button

### Requirement 4

**User Story:** As a player, I want the system to handle edge cases gracefully, so that I don't encounter errors when leaving or resetting games

#### Acceptance Criteria

1. IF a non-host player attempts to reset the game, THEN THE Game Server SHALL reject the request and emit an error event
2. WHEN the host leaves a completed room, THE Game Server SHALL assign a new host from remaining players
3. IF the host leaves and no players remain, THEN THE Game Server SHALL delete the room
4. WHEN a player loses connection during post-game state, THE Game Server SHALL remove the player after the timeout period
5. WHEN the game resets, THE Game Server SHALL validate that all connected players receive new boards before transitioning to "waiting" state
