# Offline Sync Protocol

## Overview

MountainConnect ID supports offline-first operation for hikers in areas without network coverage. This document describes the synchronization protocol between the mobile application and backend services.

## Conflict Resolution Strategy

### Last-Write-Wins (LWW) + Version Field

All synchronizable entities carry a `version` field (integer, monotonically increasing) and `updatedAt` timestamp.

```typescript
interface SyncableEntity {
  id: string;
  version: number;        // increment on every mutation
  updatedAt: number;      // epoch millis
  syncedAt?: number;      // last successful sync timestamp
  syncStatus: 'synced' | 'pending' | 'conflict';
}
```

**Conflict Resolution Rules:**
1. If both client and server have same `version`: keep both (no conflict)
2. If client `version` > server `version`: client wins (push to server)
3. If server `version` > client `version`: server wins (pull to client)
4. If `version` equal but timestamps differ: compare `updatedAt`, newer wins
5. If unresolvable: flag for manual review in moderation queue

## Sync Flow Diagram (ASCII)

```
┌─────────────┐                     ┌──────────────┐
│   Client    │                     │   Server     │
│   (App)     │                     │  (Backend)   │
└──────┬──────┘                     └──────┬───────┘
       │                                   │
       │  1. App goes offline              │
       │  2. User creates/edits data       │
       │  3. Store in local queue          │
       │◄─────────────────────────────────►│
       │                                   │
       │  4. Network restored              │
       │  5. Sync initiated                │
       │                                   │
       │  GET /sync/diff                   │
       │  Headers:                         │
       │  x-sync-version: {last_server_v}  │
       │  x-sync-timestamp: {last_sync_ms} │
       ├──────────────────────────────────►│
       │                                   │
       │  200 OK                           │
       │  { serverChanges: [...],          │
       │    serverVersion: N,              │
       │    conflicts: [...] }             │
       │◄──────────────────────────────────┤
       │                                   │
       │  6. Apply server changes locally  │
       │  7. Resolve conflicts if any      │
       │                                   │
       │  POST /sync/batch                 │
       │  { clientChanges: [...],          │
       │    baseVersion: N }               │
       ├──────────────────────────────────►│
       │                                   │
       │  200 OK                           │
       │  { accepted: [...],               │
       │    rejected: [...],               │
       │    newVersion: N+K }              │
       │◄──────────────────────────────────┤
       │                                   │
       │  8. Mark synced locally           │
       │  9. Update last sync timestamp    │
       │                                   │
```

## Queue Structure

The client maintains an ordered operation queue in local storage (IndexedDB):

```typescript
interface SyncQueueItem {
  id: string;                // UUID v4
  entityType: 'trip' | 'sos' | 'location' | 'review' | 'booking' | 'photo';
  operation: 'create' | 'update' | 'delete';
  entityId: string;
  payload: Record<string, unknown>;
  version: number;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}
```

Queue processing order:
1. Sort by `createdAt` ascending (chronological)
2. Group by `entityType:entityId` (prevent races on same entity)
3. Collapse operations when possible (two updates → last update)
4. Process in batches of 50 items

## Retry Strategy

Exponential backoff with jitter for failed sync attempts:

```
retryDelay = min(baseDelay * 2^retryCount + randomJitter, maxDelay)

baseDelay = 1000ms   // 1 second
maxDelay = 300000ms  // 5 minutes
randomJitter = 0..1000ms

maxRetryCount = 10
```

After `maxRetryCount` failures, mark item as `failed` and surface to user.

## Bandwidth Optimization

### Protocol Buffers / MessagePack

The sync payload is serialized using **MessagePack** for efficient binary encoding:

```typescript
// Instead of JSON (~280 bytes)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "location",
  "lat": -8.108,
  "lng": 112.922,
  "timestamp": 1704067200000,
  "accuracy": 8.5
}

// MessagePack (~120 bytes) - 57% smaller
```

Enable MessagePack via `Accept: application/msgpack` header.

### Delta Sync

For large entities (GPX tracks, photos), only sync diffs:

- **Location stream**: Send last known position + delta since then
- **GPX tracks**: Diff-based patching using `vcdiff`
- **Photos**: Upload only new/modified; skip unchanged by checking SHA256
- **Entities**: Use `fields` query param to request only changed fields

### Compression

- Gzip/Brotli on HTTP transport layer
- Additional per-field compression for GPX coordinates (Float32Array instead of JSON numbers)
- Image compression: WebP/AVIF for photos, 720p max for trail images

## Sync Headers

| Header | Description | Example |
|--------|-------------|---------|
| `x-sync-version` | Client's last known server version | `x-sync-version: 1247` |
| `x-sync-timestamp` | Last successful sync timestamp (epoch ms) | `x-sync-timestamp: 1704067200000` |
| `x-device-id` | Unique device identifier | `x-device-id: a1b2c3d4...` |
| `x-client-build` | App build number for feature compatibility | `x-client-build: 2024.0815.1` |
| `Accept` | Preferred serialization format | `application/msgpack` |

## Offline-First Behavior

### Read Operations

All reads go through local cache first:
1. Query local database (PouchDB / SQLite)
2. Return cached data immediately (stale-while-revalidate)
3. Refresh from server in background if online
4. Update UI with fresh data if changed

### Write Operations

1. Validate locally
2. Write to local database
3. Queue sync operation
4. Show optimistic UI update
5. Sync when online

### Critical Offline Operations

SOS can be triggered without network. The app:
1. Records SOS locally with full GPS data
2. Activates device SOS beacon (Android Emergency Location Service / iOS Emergency SOS)
3. Sends SMS fallback to emergency contacts
4. Queues sync operation with highest priority
5. Auto-retry every 30 seconds until confirmed

## Implementation Notes

- Use `navigator.onLine` + heartbeat ping to detect connectivity
- Implement background sync using Service Workers (PWA) / WorkManager (Android) / BGTaskScheduler (iOS)
- Encrypt local queue at rest using SQLCipher / encrypted IndexedDB
- Implement sync watermark per entity type for incremental sync
- Use `If-Match` header with ETag for optimistic concurrency control
