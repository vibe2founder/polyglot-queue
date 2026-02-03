import { QueueTranslator } from '../packages/core/index';
import { RedisStreamAdapter } from '../packages/redis-native/index';
import { RabbitMQAdapter } from '../packages/rabbitmq-native/index';

async function main() {
    console.log("=== One-Q-4-All Demo ===");
    console.log("Initializing Translator...");

    const translator = new QueueTranslator();

    // 1. Register Adapters
    // Note: This expects a local Redis at localhost:6379 for the Redis adapter to work fully.
    // If Redis is not available, it will log connection errors (handled in code).
    const redis = new RedisStreamAdapter('localhost', 6379);
    const rabbit = new RabbitMQAdapter(); // Stub

    // Error handling for demo purposes if redis is down
    redis.on('error', (e) => console.log('Redis connection warning:', e.message));

    console.log("Registering adapters...");
    try {
        await translator.register(redis);
        await translator.register(rabbit);
    } catch (e) {
        console.error("Registration failed (is Redis running?):", e);
    }

    // 2. Define Routes
    // Scenario: Ingress on Redis 'events' -> Forward to RabbitMQ 'processing'
    console.log("Setting up route: Redis/events -> RabbitMQ/processing");
    await translator.addRoute('redis', 'events', 'rabbitmq', 'processing');

    // 3. Listen Global Logs
    translator.on('message', (msg) => {
        console.log(`\n[Global Event] ID: ${msg.id}`);
        console.log(`Source: ${msg.source}/${msg.topic}`);
        console.log(`Payload:`, msg.payload);
        console.log(`-----------------------------------`);
    });

    // 4. Simulate Publishing
    console.log("\nSimulating publish to Redis 'events'...");
    try {
        await redis.publish('events', { 
            event: 'UserSignup', 
            userId: 9000, 
            ts: Date.now() 
        });
        console.log("Published to Redis.");
    } catch (e) {
        console.log("Publish failed:", e);
    }

    console.log("\nWaiting for events (Press Ctrl+C to exit)...");
}

main().catch(console.error);
