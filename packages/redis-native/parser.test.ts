import { describe, it, expect } from 'bun:test';
import { RespParser } from './parser';

describe('RespParser', () => {
  it('should parse simple strings', () => {
    const parser = new RespParser();
    parser.append('+OK\r\n');
    const results = parser.process();
    expect(results).toEqual(['OK']);
  });

  it('should parse integers', () => {
    const parser = new RespParser();
    parser.append(':1000\r\n');
    const results = parser.process();
    expect(results).toEqual([1000]);
  });

  it('should parse bulk strings', () => {
    const parser = new RespParser();
    parser.append('$5\r\nhello\r\n');
    const results = parser.process();
    expect(results).toEqual(['hello']);
  });

  it('should parse arrays', () => {
    const parser = new RespParser();
    parser.append('*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n');
    const results = parser.process();
    expect(results).toEqual([['hello', 'world']]);
  });

  it('should handle split chunks', () => {
    const parser = new RespParser();
    parser.append('*2\r\n$5\r\nhel');
    expect(parser.process()).toEqual([]);
    
    parser.append('lo\r\n$5\r\nworld\r\n');
    expect(parser.process()).toEqual([['hello', 'world']]);
  });

  it('should handle multiple commands in one chunk', () => {
    const parser = new RespParser();
    parser.append('+OK\r\n+PONG\r\n');
    expect(parser.process()).toEqual(['OK', 'PONG']);
  });

  it('should parse nulls', () => {
    const parser = new RespParser();
    parser.append('$-1\r\n*-1\r\n');
    expect(parser.process()).toEqual([null, null]);
  });
});
