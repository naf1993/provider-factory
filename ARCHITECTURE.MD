# Provider Data Factory — Architecture

## Overview

Provider Data Factory is a NestJS service that reads raw provider data from MongoDB, validates and normalizes it, and writes a clean domain model into a separate MongoDB database.

The current implementation processes Talabat:

- Locations
- Restaurants
- Menus

The system uses MongoDB cursors for bounded reads, BullMQ/Redis for asynchronous batch processing, Zod for validation, and deterministic MongoDB upserts for idempotency.

---

## Architecture

```text
                JSON Source Files
                       |
                       v
                  Seed Script
                       |
                       v
              +----------------+
              |  provider_raw  |
              |----------------|
              | locations      |
              | restaurants    |
              | menus          |
              +----------------+
                       |
                MongoDB Cursor
                       |
                       v
              FactoryDispatcher
                       |
                 Batch Jobs
                       |
                       v
              +----------------+
              | BullMQ / Redis |
              +----------------+
                       |
                       v
               FactoryProcessor
                       |
                       v
                TalabatAdapter
                       |
          +------------+------------+
          |            |            |
       Validate     Normalize       Map
          |            |            |
          +-------- Deduplicate -----+
                       |
                       v
                 Repositories
                       |
              Deterministic Upsert
                       |
                       v
             +--------------------+
             |  provider_domain   |
             |--------------------|
             | locations          |
             | restaurants        |
             | restaurant_locations|
             | menu_categories    |
             | menu_items         |
             | runs               |
             | quarantine         |
             +--------------------+
```

---

## Data Model

Two MongoDB databases are used.

### Raw Database

`provider_raw` contains the original source responses:

```text
locations
restaurants
menus
```

The factory treats this database as read-only during processing.

### Domain Database

`provider_domain` contains normalized entities:

```text
locations
restaurants
restaurant_locations
menu_categories
menu_items
runs
quarantine
```

Raw and normalized data are separated so the domain database can always be rebuilt from the original source.

---

## Source Data Decisions

Several inconsistencies were identified in the provider data.

Location IDs and other numeric fields can appear as either strings or numbers, so they are normalized before persistence.

Restaurants may appear in multiple areas. Therefore restaurant-to-location relationships are stored separately in:

```text
restaurant_locations
```

For menu data, `outletCode` matches the restaurant identifier used by restaurant URLs. The menu payload's internal `id` may be different, so:

```text
outletCode → providerRestaurantId
payload.id → providerInternalId
```

Provider responses may also contain semantic errors such as:

```text
Page limit exceeded.
This is not restaurant page (Talabat).
```

These records are quarantined rather than silently ignored.

---

## Natural Keys and Idempotency

Domain records use provider-based natural keys.

```text
Location
(provider, providerLocationId)

Restaurant
(provider, providerRestaurantId)

RestaurantLocation
(provider, providerRestaurantId, providerLocationId)

MenuCategory
(provider, providerRestaurantId, providerCategoryId)

MenuItem
(provider, providerRestaurantId, providerItemId)
```

MongoDB unique indexes and `bulkWrite()` upserts ensure that rerunning the same input does not create duplicate domain records.

---

## Processing Pipeline

Each source document follows:

```text
Validate
   ↓
Normalize
   ↓
Map
   ↓
Deduplicate
   ↓
Upsert
```

Provider-specific logic is isolated under:

```text
src/providers/talabat/
```

The adapter understands Talabat payloads, while repositories work only with normalized domain models.

This keeps provider-specific parsing separate from persistence logic.

---

## Queue Processing

`FactoryDispatcher` reads source collections using MongoDB cursors and creates configurable batches.

Example:

```text
MongoDB Cursor
      |
  25 document IDs
      |
      v
   BullMQ Job
```

Configuration:

```env
FACTORY_BATCH_SIZE=25
FACTORY_CONCURRENCY=5
```

Jobs contain MongoDB document IDs instead of full provider payloads, keeping Redis messages small.

The worker reloads those documents and processes them.

---

## Error Handling

Provider-data errors and infrastructure errors are treated differently.

```text
Invalid Provider Document
        |
        v
    Quarantine
        |
        v
Continue Processing
```

Examples include validation failures and provider semantic errors.

Infrastructure failures follow:

```text
Mongo/Dependency Failure
        |
        v
   BullMQ Retry
        |
 Exponential Backoff
        |
        v
 Retry Exhausted
        |
        v
       DLQ
```

This prevents database failures from being incorrectly classified as bad provider data.

---

## Run Observability

Every execution creates a run record containing:

```text
runId
status
expectedJobs
completedJobs
failedJobs
global counters
per-stage counters
sampleErrors
startedAt
completedAt
durationMs
```

Per-stage metrics are tracked for:

```text
locations
restaurants
menus
```

Invalid documents are also available through the quarantine API.

---

## API

The service exposes:

```text
POST /runs
GET /runs/:id
GET /runs/:id/errors
GET /health
```

`POST /runs` starts asynchronous processing.

`GET /runs/:id` returns run status and counters.

`GET /runs/:id/errors` returns paginated quarantine records.

`GET /health` checks MongoDB and Redis connectivity.

---

## Resumability

BullMQ persists jobs in Redis.

If a worker crashes, unfinished jobs can be retried. Since writes use deterministic upserts, retrying a batch does not create duplicate domain entities.

One current limitation is that counters may be incremented more than once if a job fails after partially processing a batch. A production enhancement would store per-job checkpoints to make metrics fully retry-idempotent.

---

## Testing

Vitest is used for unit and integration testing.

Tests cover:

- URL/identifier parsing
- provider validation
- numeric normalization
- nullable fields
- semantic provider errors
- deduplication
- MongoDB upserts and idempotency
- provider transformation to persisted domain data

`mongodb-memory-server` is used for MongoDB integration tests.

---

## Future Improvements

With additional time, I would:

- introduce a generic `ProviderAdapter` registry for additional providers
- make run counters fully retry-idempotent
- expose inserted/modified/upserted MongoDB metrics separately
- add a full MongoDB + Redis + BullMQ integration test
- add structured logging and distributed tracing

---

## Summary

```text
Raw MongoDB
    ↓
Cursor + Batching
    ↓
BullMQ / Redis
    ↓
Factory Worker
    ↓
Provider Adapter
    ↓
Validate / Normalize / Map / Deduplicate
    ↓
Repository Upserts
    ↓
Normalized MongoDB
```

The architecture prioritizes bounded memory usage, deterministic transformations, idempotent persistence, observable failures, and provider-specific isolation.