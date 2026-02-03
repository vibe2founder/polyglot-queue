import { KafkaParser, encodeRequest, ApiKey } from './parser';

const ITERATIONS = 1_000_000;

function createResponse(correlationId: number, payloadSize: number): Buffer {
    const response = Buffer.alloc(4 + 4 + payloadSize);
    response.writeInt32BE(4 + payloadSize, 0); // size
    response.writeInt32BE(correlationId, 4); // correlationId
    // Fill payload with dummy data
    for (let i = 0; i < payloadSize; i++) {
        response[8 + i] = 65 + (i % 26);
    }
    return response;
}

const testResponses = [
    { name: 'Response (16 bytes)', response: createResponse(1, 16) },
    { name: 'Response (64 bytes)', response: createResponse(2, 64) },
    { name: 'Response (256 bytes)', response: createResponse(3, 256) },
    { name: 'Response (1024 bytes)', response: createResponse(4, 1024) }
];

console.log('☕ Kafka Native Parser Benchmark');
console.log('================================');

// Test response parsing
console.log('\n📥 Response Parsing:');
for (const { name, response } of testResponses) {
    const parser = new KafkaParser();
    const start = performance.now();
    
    for (let i = 0; i < ITERATIONS; i++) {
        parser.append(response);
        parser.processResponses();
    }
    
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));
    
    console.log(`${name.padEnd(25)} ${opsPerSec.toLocaleString().padStart(15)} ops/sec`);
}

// Test request encoding
console.log('\n📤 Request Encoding:');
const testRequests = [
    { name: 'ApiVersions Request', apiKey: ApiKey.ApiVersions, payload: Buffer.alloc(0) },
    { name: 'Metadata Request', apiKey: ApiKey.Metadata, payload: Buffer.alloc(32) },
    { name: 'Produce Request', apiKey: ApiKey.Produce, payload: Buffer.alloc(256) }
];

for (const { name, apiKey, payload } of testRequests) {
    const start = performance.now();
    
    for (let i = 0; i < ITERATIONS; i++) {
        encodeRequest({
            apiKey,
            apiVersion: 0,
            correlationId: i,
            clientId: 'benchmark',
            payload
        });
    }
    
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));
    
    console.log(`${name.padEnd(25)} ${opsPerSec.toLocaleString().padStart(15)} ops/sec`);
}

console.log('\n✅ Benchmark complete!');
