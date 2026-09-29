# ADR-0005 · Transactional outbox with idempotent consumers

- **Date:** 2026-09-30
- **Status:** accepted

**Decision.**
- **Same transaction.** Business events are inserted into `events` in the same transaction as the change, so an event
  exists if and only if the change committed.
- **Claiming.** The dispatcher claims batches with `FOR UPDATE SKIP LOCKED`. A crashed worker's claim expires.
- **Idempotent consumers.** Each consumer runs once per event (`event_consumptions`, written in the consumer's own
  transaction).
- **Failures.** Retry with exponential backoff. After `maxAttempts`, the event becomes `dead`, a `manual_queue` item is
  created, and the alert hook fires. There are no silent failures.
- **Scope.** The dispatcher is platform-level: it processes every tenant's events, each inside that tenant's own RLS
  context.
