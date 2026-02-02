# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-02-02

### Feat
- Initial project structure and architecture for `one-q-4-all`.
- Implemented **Core** package with `QueueTranslator` (Event Hub) and interfaces (`IAdapter`, `IMessage`).
- Implemented **Redis Native** package with a custom RESP parser and TCP client using `net`.
- Implemented `RedisStreamAdapter` supporting `publish` (XADD) and `subscribe` (XREAD BLOCK).
- Scaffolding for RabbitMQ, Kafka, and NATS adapters (stubs).
- Added `examples/demo.ts` showing how to wire adapters and routes.

### Docs
- Created Architecture overview.
- Added Example usage.
- 📝 Created "cabuloso" README.md with project overview and technical highlights.
- 📊 Prepared reporting structure.
