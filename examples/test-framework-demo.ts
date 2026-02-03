import { TestScenario } from '../packages/queue-test-kit';

console.log('🧪 Starting E2E Queue Test Simulation...');

const scenario = new TestScenario();

// Setup
console.log('Setting up adapters...');
await scenario.withAdapter('nats-mock');
await scenario.withAdapter('kafka-mock');

// Route
console.log('Configuring routes...');
await scenario.createRoute('nats-mock', 'orders.new', 'kafka-mock', 'legacy.orders');

// Act
console.log('Emitting message...');
await scenario.actEmit('nats-mock', 'orders.new', { id: 101, amount: 50.00 });

// Assert
console.log('Verifying delivery...');
try {
    await scenario.assertReceived('kafka-mock', 'legacy.orders', { id: 101 });
    console.log('✅ Success: Message routed correctly!');
} catch (e) {
    console.error('❌ Failed:', e);
    process.exit(1);
}
