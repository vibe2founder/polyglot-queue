/**
 * @purecore/one-q-4-all
 * Universal & Native Message Routing Infrastructure
 *
 * Zero dependencies, ultra-high performance message broker abstraction.
 * Supports Redis, NATS, RabbitMQ, and Kafka via native TCP implementations.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────────────────────────────────────
export { QueueTranslator } from "./packages/core/index";
export type { IAdapter, IMessage } from "./packages/core/index";

// ─────────────────────────────────────────────────────────────────────────────
// Native Adapters
// ─────────────────────────────────────────────────────────────────────────────
export { RedisStreamAdapter } from "./packages/redis-native/index";
export { NatsNativeAdapter } from "./packages/nats-native/index";
export { RabbitMQNativeAdapter } from "./packages/rabbitmq-native/index";
export { KafkaNativeAdapter } from "./packages/kafka-native/index";

// ─────────────────────────────────────────────────────────────────────────────
// Native Parsers (for advanced usage)
// ─────────────────────────────────────────────────────────────────────────────
export { RespParser } from "./packages/redis-native/parser";
export { NatsParser } from "./packages/nats-native/parser";
export { AmqpParser, FrameType } from "./packages/rabbitmq-native/parser";
export {
  KafkaParser,
  ApiKey,
  encodeRequest,
} from "./packages/kafka-native/parser";

// ─────────────────────────────────────────────────────────────────────────────
// Native Clients (for direct socket access)
// ─────────────────────────────────────────────────────────────────────────────
export { RedisClient } from "./packages/redis-native/client";
export { NatsClient } from "./packages/nats-native/client";
export { RabbitMQClient } from "./packages/rabbitmq-native/client";
export { KafkaClient } from "./packages/kafka-native/client";

// ─────────────────────────────────────────────────────────────────────────────
// Test Kit (for testing queue flows)
// ─────────────────────────────────────────────────────────────────────────────
export { MockBrokerAdapter } from "./packages/queue-test-kit/mock-adapter";
export { TestScenario } from "./packages/queue-test-kit/scenario";
