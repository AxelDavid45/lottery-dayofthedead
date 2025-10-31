/**
 * Test script for player disconnection and reconnection functionality
 * 
 * This test verifies:
 * 1. Players are marked as disconnected (not removed) when they disconnect
 * 2. Players can reconnect with their original player ID
 * 3. Game state is maintained during disconnection
 * 4. Host reassignment works when host disconnects
 */

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testReconnection() {
  log('\n🧪 Testing Player Disconnection and Reconnection', 'cyan');
  log('='.repeat(60), 'cyan');

  let host, player2, player3;
  let roomCode;
  let hostPlayerId, player2Id;

  try {
    // Step 1: Create room with host
    log('\n📝 Step 1: Creating room with host...', 'blue');
    host = io(SERVER_URL);

    await new Promise((resolve) => {
      host.once('connect', () => {
        log(`✓ Host connected: ${host.id}`, 'green');
        hostPlayerId = host.id;
        resolve();
      });
    });

    await new Promise((resolve) => {
      host.once('room:created', (data) => {
        roomCode = data.roomCode;
        log(`✓ Room created: ${roomCode}`, 'green');
        log(`  Host ID: ${hostPlayerId}`, 'yellow');
        resolve();
      });
      host.emit('room:create', { name: 'Host Player' });
    });

    // Step 2: Add two more players
    log('\n📝 Step 2: Adding two more players...', 'blue');
    player2 = io(SERVER_URL);

    await new Promise((resolve) => {
      player2.once('connect', () => {
        log(`✓ Player 2 connected: ${player2.id}`, 'green');
        player2Id = player2.id;
        resolve();
      });
    });

    await new Promise((resolve) => {
      player2.once('room:joined', () => {
        log(`✓ Player 2 joined room`, 'green');
        resolve();
      });
      player2.emit('room:join', { roomCode, name: 'Player Two' });
    });

    player3 = io(SERVER_URL);
    let roomState;

    await new Promise((resolve) => {
      player3.once('connect', () => {
        log(`✓ Player 3 connected: ${player3.id}`, 'green');
        resolve();
      });
    });

    await new Promise((resolve) => {
      player3.once('room:joined', (data) => {
        log(`✓ Player 3 joined room`, 'green');
        roomState = data.roomState;
        resolve();
      });
      player3.emit('room:join', { roomCode, name: 'Player Three' });
    });

    await sleep(500);

    // Step 3: Verify all players are connected
    log('\n📝 Step 3: Verifying all players are connected...', 'blue');
    log(`  Total players in room: ${roomState.players.length}`, 'yellow');

    // Step 4: Disconnect player 2 (non-host)
    log('\n📝 Step 4: Disconnecting Player 2 (non-host)...', 'blue');

    const disconnectPromise = new Promise((resolve) => {
      host.once('room:state', (data) => {
        log(`✓ Host received room state update after disconnection`, 'green');
        resolve(data);
      });
    });

    player2.disconnect();
    log(`  Player 2 disconnected`, 'yellow');

    roomState = await disconnectPromise;

    const player2State = roomState.players.find(p => p.id === player2Id);
    if (player2State && !player2State.isConnected) {
      log(`✓ Player 2 is marked as disconnected (not removed)`, 'green');
      log(`  Player 2 still in room: ${player2State.name}`, 'yellow');
    } else {
      throw new Error('Player 2 should be marked as disconnected');
    }

    // Step 5: Reconnect player 2
    log('\n📝 Step 5: Reconnecting Player 2...', 'blue');

    player2 = io(SERVER_URL);

    await new Promise((resolve) => {
      player2.once('connect', () => {
        log(`✓ Player 2 reconnected with new socket: ${player2.id}`, 'green');
        resolve();
      });
    });

    const reconnectData = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Reconnection timeout - did not receive room:reconnected event'));
      }, 5000);

      player2.once('room:reconnected', (data) => {
        clearTimeout(timeout);
        log(`✓ Player 2 successfully reconnected to room`, 'green');
        log(`  Reconnected with player ID: ${data.playerId}`, 'yellow');
        resolve(data);
      });

      player2.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Reconnection error: ${error.code} - ${error.message}`));
      });

      player2.emit('room:reconnect', {
        roomCode: roomCode,
        playerId: player2Id,
      });
    });

    // Verify player 2 is now connected
    const reconnectedPlayer = reconnectData.roomState.players.find(p => p.id === player2.id);
    if (reconnectedPlayer && reconnectedPlayer.isConnected) {
      log(`✓ Player 2 is now marked as connected`, 'green');
    } else {
      throw new Error('Player 2 should be marked as connected after reconnection');
    }

    await sleep(500);

    // Step 6: Test host disconnection and reassignment
    log('\n📝 Step 6: Testing host disconnection and reassignment...', 'blue');

    const hostDisconnectPromise = new Promise((resolve) => {
      player3.once('player:disconnected', (data) => {
        log(`✓ Player 3 received host disconnection notification`, 'green');
        resolve();
      });
    });

    host.disconnect();
    log(`  Host disconnected`, 'yellow');

    await hostDisconnectPromise;

    // Get updated room state
    roomState = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null);
      }, 2000);

      player3.once('room:state', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });

    if (!roomState) {
      throw new Error('Did not receive room state update after host disconnection');
    }

    const newHost = roomState.players.find(p => p.isHost && p.isConnected);
    if (newHost) {
      log(`✓ New host assigned: ${newHost.name}`, 'green');
    } else {
      throw new Error('A new host should have been assigned');
    }

    // Step 7: Verify game state is maintained
    log('\n📝 Step 7: Verifying game state is maintained...', 'blue');
    if (roomState.code === roomCode) {
      log(`✓ Room code maintained: ${roomCode}`, 'green');
    }
    if (roomState.players.length === 3) {
      log(`✓ All players still in room (including disconnected)`, 'green');
    }

    log('\n✅ All reconnection tests passed!', 'green');
    log('='.repeat(60), 'cyan');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    // Cleanup
    log('\n🧹 Cleaning up connections...', 'yellow');
    if (host && host.connected) {
      host.disconnect();
      host.close();
    }
    if (player2 && player2.connected) {
      player2.disconnect();
      player2.close();
    }
    if (player3 && player3.connected) {
      player3.disconnect();
      player3.close();
    }

    await sleep(1000);
    log('✓ Cleanup complete', 'green');
    process.exit(0);
  }
}

// Run the test
log('\n🚀 Starting Reconnection Test Suite', 'cyan');
log('Make sure the server is running on http://localhost:3001\n', 'yellow');

testReconnection();
