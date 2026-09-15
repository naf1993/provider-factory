# Provider Data Factory

NestJS-based data factory that reads raw provider data from MongoDB, processes it asynchronously through BullMQ/Redis, and writes normalized domain data into a separate MongoDB database.

Current provider: **Talabat**

## Tech Stack

- NestJS
- TypeScript
- MongoDB / Mongoose
- BullMQ / Redis
- Zod
- Docker Compose
- Vitest

## Project Flow

```text
JSON Source Files
      |
      v
 Seed Script
      |
      v
 provider_raw
      |
 MongoDB Cursor
      |
      v
FactoryDispatcher
      |
      v
 BullMQ / Redis
      |
      v
FactoryProcessor
      |
      v
 TalabatAdapter
      |
Validate / Normalize / Map / Dedupe
      |
      v
 Repositories
      |
      v
provider_domain
```

## Databases

### Raw Database

```text
provider_raw
```

Collections:

```text
locations
restaurants
menus
```

The factory treats raw data as read-only during processing.

### Domain Database

```text
provider_domain
```

Collections:

```text
locations
restaurants
restaurant_locations
menu_categories
menu_items
runs
quarantine
```

## Environment Variables

Create `.env` from `.env.example`.

Example for local development:

```env
NODE_ENV=development
PORT=3000

RAW_MONGODB_URI=mongodb://localhost:27017/provider_raw
DOMAIN_MONGODB_URI=mongodb://localhost:27017/provider_domain

REDIS_HOST=localhost
REDIS_PORT=6379

FACTORY_BATCH_SIZE=25
FACTORY_CONCURRENCY=5
```

## Run Locally

Start MongoDB and Redis:

```bash
docker compose up -d mongo redis
```

Seed raw data:

```bash
npm run seed
```

Start the NestJS application:

```bash
npm run start:dev
```

Check health:

```bash
curl http://localhost:3000/health
```

Start a factory run:

```bash
curl -X POST http://localhost:3000/runs
```

Example response:

```json
{
  "runId": "your-run-id",
  "status": "RUNNING",
  "jobsQueued": 24
}
```

Check run status:

```bash
curl http://localhost:3000/runs/YOUR_RUN_ID
```

Check quarantined errors:

```bash
curl "http://localhost:3000/runs/YOUR_RUN_ID/errors?page=1&limit=10"
```

## Run With Docker Compose

Build and start all services:

```bash
docker compose up --build -d
```

Seed the raw database:

```bash
docker compose --profile tools run --rm seed
```

Check health:

```bash
curl http://localhost:3000/health
```

Trigger a run:

```bash
curl -X POST http://localhost:3000/runs
```

View logs:

```bash
docker compose logs -f app
```

## API

```text
POST /runs
GET /runs/:id
GET /runs/:id/errors
GET /health
```

### POST /runs

Starts an asynchronous provider processing run.

### GET /runs/:id

Returns:

```text
status
expected jobs
completed jobs
failed jobs
global counters
per-stage counters
sample errors
duration
```

### GET /runs/:id/errors

Returns paginated quarantine records.

### GET /health

Checks:

```text
raw MongoDB
domain MongoDB
Redis
```

## Processing Behavior

Each source document follows:

```text
validate
   ↓
normalize
   ↓
map
   ↓
deduplicate
   ↓
upsert
```

Invalid provider documents are quarantined and processing continues.

Infrastructure failures are retried through BullMQ with exponential backoff.

After retry exhaustion, failed jobs are sent to the dead-letter queue.

## Idempotency

Normalized collections use deterministic natural keys and MongoDB upserts.

Examples:

```text
Location
(provider, providerLocationId)

Restaurant
(provider, providerRestaurantId)

Menu Item
(provider, providerRestaurantId, providerItemId)
```

Running the factory multiple times does not create duplicate normalized entities.

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Tests cover:

- Talabat URL parsing
- provider schema validation
- nullable fields
- numeric normalization
- semantic provider errors
- deduplication
- MongoDB upserts
- idempotency
- provider transformation to persisted domain data

## Source Data Notes

Important observations from the source data:

- numeric fields can arrive as strings
- restaurants can appear in multiple locations
- `outletCode` is used as the menu restaurant identifier
- provider responses can contain semantic errors even when structurally valid
- repeated entities are handled through deduplication and deterministic upserts

More architecture details are available in:

```text
ARCHITECTURE.md
```

## Known Limitations

- the worker currently depends directly on `TalabatAdapter`
- run counters are not fully retry-idempotent after partial batch failure
- `written` represents write/upsert attempts, not final unique document count
- full Redis + BullMQ end-to-end integration testing could be expanded

## What I Would Improve With More Time

- introduce a generic provider adapter registry to support additional providers
- make run counters fully retry-idempotent
- expose inserted / modified / matched / upserted MongoDB metrics separately
- add a full Testcontainers-based MongoDB + Redis + BullMQ integration test
- add structured logging, metrics, and distributed tracing
- add per-job checkpoints for stronger resumability after worker crashes
- add graceful shutdown so active jobs finish safely during deployment
- add queue monitoring and alerting for failed jobs and DLQ growth
- add CI/CD checks for linting, tests, build, and Docker image validation
- add retention/cleanup policies for old run records and quarantine data