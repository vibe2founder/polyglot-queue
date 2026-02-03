import { describe, it, expect } from 'bun:test';
import { AmqpParser, FrameType } from './parser';

describe('AmqpParser (Native)', () => {
    it('should parse HEARTBEAT frames', () => {
        const parser = new AmqpParser();
        const frame = Buffer.alloc(9);
        frame[0] = FrameType.HEARTBEAT;
        frame.writeUInt16BE(0, 1); // channel 0
        frame.writeUInt32BE(0, 3); // size 0
        frame[8] = 0xCE; // end marker

        parser.append(frame);
        const results = parser.process();

        expect(results).toHaveLength(1);
        expect(results[0].type).toBe(FrameType.HEARTBEAT);
        expect(results[0].channel).toBe(0);
    });

    it('should handle fragmented frames', () => {
        const parser = new AmqpParser();
        const frame = Buffer.alloc(12);
        frame[0] = FrameType.METHOD;
        frame.writeUInt16BE(1, 1);
        frame.writeUInt32BE(3, 3);
        frame.write('ABC', 8);
        frame[11] = 0xCE;

        parser.append(frame.subarray(0, 5));
        expect(parser.process()).toHaveLength(0);

        parser.append(frame.subarray(5));
        const results = parser.process();
        expect(results).toHaveLength(1);
        expect(results[0].payload.toString()).toBe('ABC');
    });
});
