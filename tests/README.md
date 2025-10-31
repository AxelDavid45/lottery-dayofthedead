# Lotería del Mictlán - Test Suite

This directory contains integration tests for the Lotería del Mictlán multiplayer game.

## Prerequisites

Before running tests, make sure the server is running:

```bash
cd server
npm start
```

The server should be accessible at `http://localhost:3001`.

## Running Tests

### Run All Tests
```bash
node tests/run-tests.js
```

### Run Individual Tests
```bash
# Test room creation and joining functionality
node tests/test-room-functionality.js

# Test host reassignment when host disconnects
node tests/test-host-reassignment.js

# Test input validation for room codes and names
node tests/test-validation.js
```

## Test Coverage

### test-room-functionality.js
- ✅ Room creation with unique codes
- ✅ Joining existing rooms
- ✅ Duplicate name rejection
- ✅ Invalid room code handling
- ✅ Room capacity limits (8 players max)
- ✅ Full room rejection

### test-host-reassignment.js
- ✅ Host permissions assignment
- ✅ Automatic host reassignment when original host disconnects
- ✅ Room persistence after host change

### test-validation.js
- ✅ Room code format validation (5-6 alphanumeric characters)
- ✅ Invalid format rejection
- ✅ Valid format acceptance
- ✅ Unique room code generation

## Notes

- Tests use Socket.IO client to simulate real user interactions
- All tests clean up their connections automatically
- Tests are designed to be run against a live server instance
- Each test is independent and can be run separately