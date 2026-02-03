import { describe, it, expect } from 'bun:test';
import { NatsParser, type NatsMessage, type NatsControl } from './parser';

describe('NatsParser (Native)', () => {
    it('should parse simple MSG commands', () => {
        const parser = new NatsParser();
        const raw = 'MSG topic.test 1 11\r\nhello world\r\n';
        parser.append(raw);
        const results = parser.process();

        expect(results).toHaveLength(1);
        const msg = results[0] as NatsMessage;
        expect(msg.kind).toBe('MSG');
        expect(msg.subject).toBe('topic.test');
        expect(msg.payload).toBe('hello world');
    });

    it('should handle fragmented data', () => {
        const parser = new NatsParser();
        parser.append('MSG topic.test 1 ');
        expect(parser.process()).toHaveLength(0);
        
        parser.append('5\r\nhello\r\n');
        const results = parser.process();
        expect(results).toHaveLength(1);
        const msg = results[0] as NatsMessage;
        expect(msg.kind).toBe('MSG');
    });

    it('should parse PING and PONG', () => {
        const parser = new NatsParser();
        parser.append('PING\r\nPONG\r\n');
        const results = parser.process();
        expect(results).toHaveLength(2);
        expect(results[0].kind).toBe('PING');
        expect(results[1].kind).toBe('PONG');
    });

    it('should parse INFO with JSON payload', () => {
        const parser = new NatsParser();
        const infoStr = { server_id: 'test', version: '1.2.3' };
        parser.append(`INFO ${JSON.stringify(infoStr)}\r\n`);
        const results = parser.process();
        expect(results).toHaveLength(1);
        const ctrl = results[0] as NatsControl;
        expect(ctrl.kind).toBe('INFO');
        expect(ctrl.payload).toEqual(infoStr);
    });
});
