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
- ✅ Implemented Unit Test suite for Core and Redis-Native (RESP Parser).
- 🥒 Created BDD specification (Gherkin) for universal routing scenarios.
- 🔧 Configured Bun-native testing automation.
- 📖 Documented "Native Core" architecture and TCP/Wire Protocol strategies.
- ⚡️ Implemented high-performance Benchmarks for RespParser and QueueTranslator.
- 🚀 Achieved throughput of >17M ops/sec on Native Parser.
- 📖 Created `ARCHITECTURE.md` with deep dive into Native TCP, RESP Parsing, and Wire Protocol roadmap.
- 🧪 Implemented `queue-test-kit` package for E2E and Unit testing of queue flows.
- ✨ Added `TestScenario` and `MockBrokerAdapter` for simulating complex routing behavior without Docker.
- 🌐 Launched the **Official Project Website** (`site/index.html`) with premium design and AI-generated assets.
- 🎨 Implemented glassmorphism UI, smooth scroll animations, and interactive benchmark visualizations.
- 📦 Configured `package.json` for NPM distribution with full metadata and path exports.
- 🖼️ Generated and integrated premium AI-designed logo into the official site.
- ⚖️ Added MIT License.
