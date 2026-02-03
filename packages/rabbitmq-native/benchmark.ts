import { AmqpParser, FrameType } from './parser';

const ITERATIONS = 1_000_000;

function createFrame(type: FrameType, channel: number, payloadSize: number): Buffer {
    const frame = Buffer.alloc(8 + payloadSize + 1);
    frame[0] = type;
    frame.writeUInt16BE(channel, 1);
    frame.writeUInt32BE(payloadSize, 3);
    // Fill payload with dummy data
    for (let i = 0; i < payloadSize; i++) {
        frame[8 + i] = 65 + (i % 26);
    }
    frame[8 + payloadSize] = 0xCE; // Frame end marker
    return frame;
}

const testFrames = [
    { name: 'HEARTBEAT (0 bytes)', frame: createFrame(FrameType.HEARTBEAT, 0, 0) },
    { name: 'METHOD (32 bytes)', frame: createFrame(FrameType.METHOD, 1, 32) },
    { name: 'HEADER (64 bytes)', frame: createFrame(FrameType.HEADER, 1, 64) },
    { name: 'BODY (256 bytes)', frame: createFrame(FrameType.BODY, 1, 256) },
    { name: 'BODY (1024 bytes)', frame: createFrame(FrameType.BODY, 1, 1024) }
];

console.log('🐰 RabbitMQ/AMQP Native Parser Benchmark');
console.log('========================================');

for (const { name, frame } of testFrames) {
    const parser = new AmqpParser();
    const start = performance.now();
    
    for (let i = 0; i < ITERATIONS; i++) {
        parser.append(frame);
        parser.process();
    }
    
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));
    
    console.log(`${name.padEnd(25)} ${opsPerSec.toLocaleString().padStart(15)} ops/sec`);
}

console.log('\n✅ Benchmark complete!');
