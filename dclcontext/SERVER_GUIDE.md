# Decentraland Server-Side Guide

A simple guide to building multiplayer scenes with server-side logic, persistent storage, and authoritative game state.

## Table of Contents
- [Getting Started](#getting-started)
- [Room Communication](#room-communication)
- [Storage](#storage)
- [Environment Variables](#environment-variables)
- [Complete Example](#complete-example)
- [Tips & Patterns](#tips--patterns)

---

## Getting Started

### 1. Enable Server Features

Add the following to your `scene.json`:

```json
{
  "main": "bin/index.js",
  "scene": {
    "base": "0,0",
    "parcels": ["0,0"]
  },
  "requiredPermissions": [],
  "authoritativeMultiplayer": true,
  "multiplayerId": "myWorld",
  "worldConfiguration": {
    "name": "myWorld.dcl.eth"
  }
}
```

### 2. Check Server Environment

In your `src/index.ts`, import `isServer` to check the execution environment:

```typescript
import { isServer } from '@dcl/sdk/network'

export function main() {
  if (isServer()) {
    console.log('[SERVER] Running on server')
    // Server-side code
  } else {
    console.log('[CLIENT] Running on client')
    // Client-side code
  }
}
```

That's it! You're ready to use server features. The following sections will show you how to use rooms, storage, and environment variables.

---

## Room Communication

Rooms enable real-time communication between server and clients. Think of a room as a shared communication channel where the server and all connected clients can exchange messages.

### The Room Variable

Create a room using `registerMessages()`:

```typescript
import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

const room = registerMessages(Messages)
```

The `room` object provides methods to:
- `room.send()` - Send messages
- `room.onMessage()` - Listen for messages
- `room.onReady(() => {()` - Handle player connections (server-only)
- `room.onDisconnect()` - Handle player disconnections (server-only)

### Message Schemas

Define your message types and their data structure:

```typescript
// 1. Define message type names
enum MessageType {
  GREETING = 'GREETING',
  PLAYER_ACTION = 'PLAYER_ACTION',
  GAME_UPDATE = 'GAME_UPDATE'
}

// 2. Define message schemas (what data each message contains)
const Messages = {
  [MessageType.GREETING]: Schemas.Map({
    message: Schemas.String
  }),
  [MessageType.PLAYER_ACTION]: Schemas.Map({
    action: Schemas.String,
    timestamp: Schemas.Number
  }),
  [MessageType.GAME_UPDATE]: Schemas.Map({
    score: Schemas.Int,
    time: Schemas.Int,
    isActive: Schemas.Boolean
  })
}
```

**Available Schema Types:**
- `Schemas.String` - Text data
- `Schemas.Int` - Integer numbers
- `Schemas.Number` - Float numbers
- `Schemas.Boolean` - true/false
- `Schemas.Optional(type)` - Optional field

### Register Messages

Register your messages to create the room:

```typescript
const room = registerMessages(Messages)
```

This must be done **before** calling `main()` so both server and client have access to the same room.

### Hello World Example

Everything can be in a single `src/index.ts` file:

```typescript
import { isServer } from '@dcl/sdk/network'
import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

// Define message types
enum MessageType {
  GREETING = 'GREETING'
}

// Define message schemas
const Messages = {
  [MessageType.GREETING]: Schemas.Map({
    message: Schemas.String
  })
}

// Register messages and create room
const room = registerMessages(Messages)

// Main function
export function main() {
  if (isServer()) {
    // Server: Send greeting to all clients
    console.log('[SERVER] Server started')
    room.send(MessageType.GREETING, {
      message: 'Hello from server!'
    })
  } else {
    // Client: Listen for greeting from server
    console.log('[CLIENT] Client started')
    room.onMessage(MessageType.GREETING, (data) => {
      console.log(`Greeting from server: ${data.message}`)
    })
  }
}
```

Run `npm run start` and check the console - you'll see the server sending and clients receiving the message!

### Two-Way Communication

```typescript
import { isServer } from '@dcl/sdk/network'
import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

enum MessageType {
  PLAYER_ACTION = 'PLAYER_ACTION'
}

const Messages = {
  [MessageType.PLAYER_ACTION]: Schemas.Map({
    action: Schemas.String
  })
}

const room = registerMessages(Messages)

export function main() {
  if (isServer()) {
    // Server receives from clients
    room.onMessage(MessageType.PLAYER_ACTION, (data, context) => {
      const userId = typeof context?.from === 'string' ? context.from : 'unknown'
      console.log(`Player ${userId} performed: ${data.action}`)
    })
  } else {
    // Client sends to server (e.g., when player presses a button)
    room.send(MessageType.PLAYER_ACTION, {
      action: 'jump'
    })
  }
}
```

### Broadcast to All Clients

```typescript
export function main() {
  if (isServer()) {
    // Server broadcasts to all connected clients
    room.send(MessageType.GAME_UPDATE, {
      score: 100,
      time: 30
    })
  } else {
    // All clients receive the message
    room.onMessage(MessageType.GAME_UPDATE, (data) => {
      console.log(`Score: ${data.score}, Time: ${data.time}`)
    })
  }
}
```

### Connection Events

```typescript
export function main() {
  if (isServer()) {
    // Track player connections
    room.onReady(() => {((userId) => {
      console.log('[SERVER] Player connected:', userId)
      // Send welcome message to all
      room.send(MessageType.PLAYER_JOINED, { userId })
    })

    room.onDisconnect((userId) => {
      console.log('[SERVER] Player disconnected:', userId)
      room.send(MessageType.PLAYER_LEFT, { userId })
    })
  }
}
```

---

## Storage

Storage provides persistent data that survives between sessions. There are two types: **World Storage** (global) and **Player Storage** (per-player).

**⚠️ Server-Side Only:** Storage can only be used in server-side code. Always guard with `isServer()` check.

```typescript
import { isServer } from '@dcl/sdk/network'
import { Storage } from '@dcl/sdk/server'

export function main() {
  if (isServer()) {
    // ✅ Safe - Storage runs on server
    await Storage.world.set('key', 'value')
  } else {
    // ❌ Error - Storage will throw error on client
  }
}
```

### Where Storage Lives

**Local Development:**

During local development, all storage is saved to a local file to simulate production:

```
node_modules/@dcl/sdk-commands/.runtime-data/server-storage.json
```

You can:
- Inspect this file to see your stored data
- Delete it to reset all storage during testing
- Keep it to persist data between development sessions

**Production:**

In production, storage is saved to Decentraland's world storage servers. Your data persists across:
- Server restarts
- Scene redeployments
- Player sessions

The same code works in both environments - the SDK handles the differences automatically!

### World Storage

World storage is shared across all players:

```typescript
import { Storage } from '@dcl/sdk/server'

// Set world data
await Storage.world.set('globalCounter', '42')
await Storage.world.set('highScore', '9999')

// Get world data
const counter = await Storage.world.get<string>('globalCounter')
console.log('Global counter:', counter) // '42'

// Delete world data
await Storage.world.delete('oldData')
```

### Player Storage

Player storage is unique per player:

```typescript
// In a message handler
room.onMessage(MessageType.SAVE_SCORE, async (data, context) => {
  const userId = typeof context?.from === 'string' ? context.from : 'unknown'
  
  // Set player data
  await Storage.player.set(userId, 'score', String(data.score))
  await Storage.player.set(userId, 'level', String(data.level))
  
  console.log(`Saved ${userId}'s score: ${data.score}`)
})

// Get player data
room.onMessage(MessageType.LOAD_SCORE, async (data, context) => {
  const userId = typeof context?.from === 'string' ? context.from : 'unknown'
  
  const score = await Storage.player.get<string>(userId, 'score')
  const level = await Storage.player.get<string>(userId, 'level')
  
  // Send back to client
  room.send(MessageType.SCORE_RESPONSE, {
    score: score || '0',
    level: level || '1'
  })
})
```

### Storing Complex Data

Storage only accepts strings, so use JSON for objects:

```typescript
// Save object as JSON
const playerData = {
  name: 'Alice',
  inventory: ['sword', 'shield'],
  stats: { hp: 100, mp: 50 }
}
await Storage.player.set(userId, 'data', JSON.stringify(playerData))

// Load and parse JSON
const dataJson = await Storage.player.get<string>(userId, 'data')
const playerData = dataJson ? JSON.parse(dataJson) : null
```

---

## Environment Variables

Environment variables let you configure your scene without changing code. They are deployed separately from your scene code.

**⚠️ Server-Side Only:** EnvVar can only be used in server-side code. Always guard with `isServer()` check.

```typescript
import { isServer } from '@dcl/sdk/network'
import { EnvVar } from '@dcl/sdk/server'

export async function main() {
  if (isServer()) {
    // ✅ Safe - EnvVar runs on server
    const maxPlayers = (await EnvVar.get('MAX_PLAYERS')) || '4'
  } else {
    // ❌ Error - EnvVar will throw error on client
  }
}
```

### Local Development

**Option 1: Using `.env` file**

Create a `.env` file in your project root:

```bash
# .env
MAX_PLAYERS=8
GAME_DURATION=300
DIFFICULTY=hard
MUSIC_URL=https://example.com/song.mp3
```

**Important:** Add `.env` to your `.gitignore` to avoid committing secrets!

**Option 2: Deploy to local development server**

You can also deploy env vars to your running local development server:

```bash
# Start your local server first
npm run start

# In another terminal, deploy env vars to local server
npx sdk-commands deploy-env MAX_PLAYERS --value 8 --target http://localhost:8000
npx sdk-commands deploy-env DIFFICULTY -v hard --target http://localhost:8000

# Delete env var from local server
npx sdk-commands deploy-env OLD_VAR --delete --target http://localhost:8000
```

**Precedence:** Deployed env vars (Option 2) take precedence over `.env` file (Option 1).

### Local Storage

During local development, the server stores data in a local file to simulate production:

```
node_modules/@dcl/sdk-commands/.runtime-data/server-storage.json
```

This file contains:
- **World Storage** - Global data shared across all players
- **Player Storage** - Per-player data
- **Environment Variables** - Deployed env vars (from Option 2)

You can inspect or clear this file for testing purposes.

### Deploy to Production

Use the `sdk-commands` CLI to deploy environment variables:

```bash
# Set an environment variable
npx sdk-commands deploy-env MAX_PLAYERS --value 8
npx sdk-commands deploy-env MUSIC_URL -v "https://example.com/song.mp3"

# Delete an environment variable
npx sdk-commands deploy-env OLD_VAR --delete
npx sdk-commands deploy-env OLD_VAR -d

# Deploy to specific zone
npx sdk-commands deploy-env MAX_PLAYERS --value 8 --target https://storage.decentraland.zone
```

### Use in Server Code

```typescript
import { EnvVar } from '@dcl/sdk/server'

export async function initServer() {
  // Get environment variables
  const maxPlayers = parseInt((await EnvVar.get('MAX_PLAYERS')) || '4')
  const gameDuration = parseInt((await EnvVar.get('GAME_DURATION')) || '180')
  const difficulty = (await EnvVar.get('DIFFICULTY')) || 'normal'
  const musicUrl = (await EnvVar.get('MUSIC_URL')) || ''
  
  console.log('[SERVER] Config:', {
    maxPlayers,
    gameDuration,
    difficulty,
    musicUrl
  })
  
  // Use in your game logic
  if (players.length >= maxPlayers) {
    console.log('Game is full!')
  }
}

// Get all environment variables
const allVars = await EnvVar.all()
console.log('[SERVER] All env vars:', allVars)
```

### Type Conversion

Environment variables are always strings, so convert as needed:

```typescript
// String
const name = (await EnvVar.get('WORLD_NAME')) || 'My World'

// Number
const maxScore = parseInt((await EnvVar.get('MAX_SCORE')) || '1000')

// Float
const multiplier = parseFloat((await EnvVar.get('MULTIPLIER')) || '1.5')

// Boolean
const debugMode = ((await EnvVar.get('DEBUG')) || 'false') === 'true'

// Array (comma-separated)
const levels = ((await EnvVar.get('LEVELS')) || 'easy,medium,hard').split(',')

// JSON
const configJson = (await EnvVar.get('CONFIG')) || '{}'
const config = JSON.parse(configJson)
```

---

## Tips & Patterns

### 1. Always Validate Server-Side

Never trust client data. Always validate on the server:

```typescript
// ❌ Bad - Client sends score
room.onMessage(MessageType.REPORT_SCORE, async (data, context) => {
  const userId = context?.from || 'unknown'
  await Storage.player.set(userId, 'score', String(data.score)) // Could be cheated!
})

// ✅ Good - Server calculates score
room.onMessage(MessageType.HIT_TARGET, async (data, context) => {
  const userId = context?.from || 'unknown'
  
  // Validate hit on server
  const isValid = validateHit(data.timestamp, data.targetId)
  if (!isValid) return
  
  // Calculate score on server
  const points = calculatePoints(data.accuracy)
  
  // Update storage
  const currentScore = await Storage.player.get<string>(userId, 'score')
  const newScore = parseInt(currentScore || '0') + points
  await Storage.player.set(userId, 'score', String(newScore))
})
```

### 2. Handle Null/Undefined Storage

Storage returns `undefined` if key doesn't exist:

```typescript
// Always provide defaults
const score = await Storage.player.get<string>(userId, 'score')
const scoreValue = score ? parseInt(score) : 0

// Or with JSON
const dataJson = await Storage.player.get<string>(userId, 'data')
const data = dataJson ? JSON.parse(dataJson) : { score: 0, level: 1 }
```

### 3. Consistent Logging

Use prefixes for easy debugging:

```typescript
// Server
console.log('[SERVER] Player joined:', userId)
console.log('[SERVER][STORAGE] Saved player data')
console.error('[SERVER][ERROR] Failed to load config')

// Client
console.log('[CLIENT] Received update')
console.log('[CLIENT][INPUT] Key pressed:', key)
```

### 4. Message Schema Best Practices

Use appropriate schema types:

```typescript
const Messages = {
  [MessageType.PLAYER_ACTION]: Schemas.Map({
    action: Schemas.String,      // Use String for text
    timestamp: Schemas.Number,   // Use Number for floats/timestamps
    count: Schemas.Int,          // Use Int for integers
    isActive: Schemas.Boolean,   // Use Boolean for true/false
    optional: Schemas.Optional(Schemas.String) // Use Optional for nullable fields
  })
}
```

### 5. Leaderboard Pattern

```typescript
interface LeaderboardEntry {
  userId: string
  name: string
  score: number
}

async function updateLeaderboard(userId: string, name: string, score: number) {
  // Get current leaderboard
  const leaderboardJson = await Storage.world.get<string>('leaderboard')
  const leaderboard: LeaderboardEntry[] = leaderboardJson ? JSON.parse(leaderboardJson) : []
  
  // Add new entry
  leaderboard.push({ userId, name, score })
  
  // Sort by score (descending)
  leaderboard.sort((a, b) => b.score - a.score)
  
  // Keep top 10
  const top10 = leaderboard.slice(0, 10)
  
  // Save back
  await Storage.world.set('leaderboard', JSON.stringify(top10))
  
  // Broadcast to all players
  room.send(MessageType.LEADERBOARD_UPDATE, {
    leaderboard: JSON.stringify(top10)
  })
}
```

### 6. Session State vs Persistent Storage

```typescript
// In-memory state (resets when server restarts)
const activePlayers = new Map<string, PlayerSession>()

room.onReady(() => {
  // Store in memory for quick access
  activePlayers.set(userId, {
    userId,
    connectedAt: Date.now(),
    isPlaying: false
  })
})

room.onDisconnect(async (userId) => {
  const session = activePlayers.get(userId)
  
  if (session) {
    // Save important data to storage before removing
    await Storage.player.set(userId, 'lastSeen', String(Date.now()))
    activePlayers.delete(userId)
  }
})
```

### 7. Error Handling

Always handle errors in async operations:

```typescript
room.onMessage(MessageType.SAVE_DATA, async (data, context) => {
  const userId = context?.from || 'unknown'
  
  try {
    await Storage.player.set(userId, 'data', JSON.stringify(data))
    
    room.send(MessageType.SAVE_SUCCESS, {
      message: 'Data saved successfully'
    })
  } catch (error) {
    console.error('[SERVER][ERROR] Failed to save data:', error)
    
    room.send(MessageType.SAVE_ERROR, {
      message: 'Failed to save data'
    })
  }
})
```

### 8. Testing with Local Storage

The local storage file helps you test your scene:

**Location:** `node_modules/@dcl/sdk-commands/.runtime-data/server-storage.json`

**Testing workflow:**
1. Run `npm run start` to start local server
2. Interact with your scene (store data)
3. Check `server-storage.json` to verify data is saved correctly
4. Delete the file to reset and test fresh state
5. Deploy env vars with `--target http://localhost:8000` to test production-like configuration

**Note:** This file contains World Storage, Player Storage, and deployed Environment Variables.

---

## Complete Example

Here's a complete counter example in a single file:

**1. Create `.env` file for local development:**

```bash
# .env
MAX_COUNT=100
```

**2. Deploy to production:**

```bash
npx sdk-commands deploy-env MAX_COUNT --value 100
```

**3. Configure scene.json:**

```json
{
  "authoritativeMultiplayer": true,
  "multiplayerId": "counter-world",
  "worldConfiguration": {
    "name": "counter.dcl.eth"
  }
}
```

**4. Use in code (`src/index.ts`):**
```typescript
import { isServer } from '@dcl/sdk/network'
import { registerMessages } from '@dcl/sdk/network'
import { Schemas, engine } from '@dcl/sdk/ecs'
import { Storage, EnvVar } from '@dcl/sdk/server'
import { Transform, MeshRenderer, MeshCollider, pointerEventsSystem } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

// Define messages
enum MessageType {
  INCREMENT = 'INCREMENT',
  COUNTER_UPDATE = 'COUNTER_UPDATE'
}

const Messages = {
  [MessageType.INCREMENT]: Schemas.Map({}),
  [MessageType.COUNTER_UPDATE]: Schemas.Map({
    global: Schemas.Int,
    player: Schemas.Int
  })
}

const room = registerMessages(Messages)

// Main function
export async function main() {
  if (isServer()) {
    // SERVER LOGIC
    const maxCount = parseInt((await EnvVar.get('MAX_COUNT')) || '100')
    
    room.onMessage(MessageType.INCREMENT, async (data, context) => {
      const userId = typeof context?.from === 'string' ? context.from : 'unknown'
      
      // Get global counter
      const globalValue = await Storage.world.get<string>('counter')
      const global = globalValue ? parseInt(globalValue) : 0
      
      if (global >= maxCount) return
      
      // Increment global
      const newGlobal = global + 1
      await Storage.world.set('counter', String(newGlobal))
      
      // Increment player
      const playerValue = await Storage.player.get<string>(userId, 'clicks')
      const player = playerValue ? parseInt(playerValue) : 0
      const newPlayer = player + 1
      await Storage.player.set(userId, 'clicks', String(newPlayer))
      
      // Broadcast
      room.send(MessageType.COUNTER_UPDATE, {
        global: newGlobal,
        player: newPlayer
      })
    })
  } else {
    // CLIENT LOGIC
    let globalCounter = 0
    let myCounter = 0
    
    // Listen for updates
    room.onMessage(MessageType.COUNTER_UPDATE, (data) => {
      globalCounter = data.global
      myCounter = data.player
      console.log(`Global: ${globalCounter}, Mine: ${myCounter}`)
    })
    
    // Create clickable cube
    const cube = engine.addEntity()
    Transform.create(cube, { position: Vector3.create(8, 1, 8) })
    MeshRenderer.setBox(cube)
    MeshCollider.setBox(cube)
    
    pointerEventsSystem.onPointerDown(
      { entity: cube, opts: { button: 0, hoverText: 'Click me!' } },
      () => room.send(MessageType.INCREMENT, {})
    )
  }
}
```

Run `npm run start`, click the cube, and watch the counters increment!

### Organizing Larger Projects

For larger projects, you can organize your code into separate files:

```
src/
├── index.ts          # Main entry, calls initServer() or initClient()
├── shared/
│   └── index.ts      # Message types, schemas, and room
├── server/
│   └── index.ts      # Server logic
└── client/
    └── index.ts      # Client logic
```

See the full rhythm game implementation in this project for an example of organized code structure.

---

## API Reference

### Imports

```typescript
// Check environment
import { isServer } from '@dcl/sdk/network'

// Create room
import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

// Server-only imports
import { Storage, EnvVar } from '@dcl/sdk/server'
```

### Room API

```typescript
// Register messages and create room
const room = registerMessages(Messages)

// Send message (server or client)
room.send(MessageType.MESSAGE_NAME, { data })

// Receive message (server or client)
room.onMessage(MessageType.MESSAGE_NAME, (data, context) => {})

// Server-only: connection events
room.onReady(() => {((userId) => {})}
room.onDisconnect((userId) => {})
```

### Storage API

```typescript
// World storage (global)
await Storage.world.set(key, value)
await Storage.world.get<string>(key)
await Storage.world.delete(key)

// Player storage (per-player)
await Storage.player.set(userId, key, value)
await Storage.player.get<string>(userId, key)
await Storage.player.delete(userId, key)
```

### EnvVar API

```typescript
// Get single variable
const value = (await EnvVar.get('KEY')) || 'default'

// Get all variables
const all = await EnvVar.all()
```

---

## Resources

- [Decentraland SDK Documentation](https://docs.decentraland.org/)
- [Multiplayer Guide](https://docs.decentraland.org/creator/development-guide/sdk7/multiplayer/)
- [Storage API](https://docs.decentraland.org/creator/development-guide/sdk7/storage/)

---

## Examples in This Project

For more complex examples, see:
- `src/server/index.ts` - Full rhythm game server with game state management
- `src/shared/index.ts` - Complete message schema definitions
- `src/client/index.ts` - Client-side game logic and UI

---

## Tips:

- Avoid rendering UI on server side. This can be avioided by adding a check for isServer() in the setupUi function.
- Avoid playing sounds on server side. This can be avoided by adding a check for isServer() in the main function.
- Avoid playing videos on server side. This can be avoided by adding a check for isServer() in the main function.

Made with ❤️ for Decentraland builders
