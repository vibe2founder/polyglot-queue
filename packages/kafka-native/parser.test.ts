import { describe, it, expect } from 'bun:test';
import { KafkaParser, encodeRequest, ApiKey } from './parser';

describe('KafkaParser (Native)', () => {
    it('should parse a simple response', () => {
        const parser = new KafkaParser();
        
        // Build a mock response: size(4) + correlationId(4) + payload
        const payload = Buffer.from('test');
        const response = Buffer.alloc(4 + 4 + payload.length);
        response.writeInt32BE(4 + payload.length, 0); // size
        response.writeInt32BE(42, 4); // correlationId
        payload.copy(response, 8);

        parser.append(response);
        const results = parser.processResponses();

        expect(results).toHaveLength(1);
        expect(results[0].correlationId).toBe(42);
        expect(results[0].payload.toString()).toBe('test');
    });

    it('should handle fragmented data', () => {
        const parser = new KafkaParser();
        
        const payload = Buffer.from('hello');
        const response = Buffer.alloc(4 + 4 + payload.length);
        response.writeInt32BE(4 + payload.length, 0);
        response.writeInt32BE(99, 4);
        payload.copy(response, 8);

        parser.append(response.subarray(0, 5));
        expect(parser.processResponses()).toHaveLength(0);

        parser.append(response.subarray(5));
        const results = parser.processResponses();
        expect(results).toHaveLength(1);
        expect(results[0].correlationId).toBe(99);
    });

    it('should encode requests correctly', () => {
        const encoded = encodeRequest({
            apiKey: ApiKey.Metadata,
            apiVersion: 0,
            correlationId: 1,
            clientId: 'test',
            payload: Buffer.alloc(0)
        });

        // 4 (size) + 2 (apiKey) + 2 (version) + 4 (corrId) + 2 (clientIdLen) + 4 (clientId)
        expect(encoded.length).toBe(4 + 2 + 2 + 4 + 2 + 4);
        expect(encoded.readInt16BE(4)).toBe(ApiKey.Metadata);
    });
});
