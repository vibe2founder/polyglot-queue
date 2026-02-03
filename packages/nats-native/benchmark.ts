import { NatsParser } from './parser';

const ITERATIONS = 1_000_000;

// Simulate various NATS protocol messages
const testMessages = [
    'MSG topic.test 1 11\r\nhello world\r\n',
    'PING\r\n',
    'PONG\r\n',
    '+OK\r\n',
    'INFO {"server_id":"test","version":"2.0.0"}\r\n',
    'MSG orders.new 42 reply.to 25\r\n{"orderId":"12345","total":99}\r\n'
];

console.log('🚀 NATS Native Parser Benchmark');
console.log('================================');

for (const msg of testMessages) {
    const parser = new NatsParser();
    const start = performance.now();
    
    for (let i = 0; i < ITERATIONS; i++) {
        parser.append(msg);
        parser.process();
    }
    
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));
    
    const label = msg.substring(0, 20).replace(/\r\n/g, '\\r\\n');
    console.log(`${label.padEnd(25)} ${opsPerSec.toLocaleString().padStart(15)} ops/sec`);
}

console.log('\n✅ Benchmark complete!');
