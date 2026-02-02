import { describe, it, expect, vi, beforeEach } from 'bun:test';
import { QueueTranslator } from './index';
import type { IAdapter, IMessage } from './index';
import { EventEmitter } from 'events';

class MockAdapter extends EventEmitter implements IAdapter {
  name: string;
  connected = false;
  published: { topic: string, payload: any }[] = [];
  subscribedTopics: string[] = [];

  constructor(name: string) {
    super();
    this.name = name;
  }

  async connect() { this.connected = true; }
  async disconnect() { this.connected = false; }
  async publish(topic: string, payload: any) { this.published.push({ topic, payload }); }
  async subscribe(topic: string) { this.subscribedTopics.push(topic); }

  simulateMessage(msg: IMessage) {
    this.emit('message', msg);
  }
}

describe('QueueTranslator', () => {
  let translator: QueueTranslator;
  let sourceAdapter: MockAdapter;
  let targetAdapter: MockAdapter;

  beforeEach(() => {
    translator = new QueueTranslator();
    sourceAdapter = new MockAdapter('source');
    targetAdapter = new MockAdapter('target');
  });

  it('should register and connect an adapter', async () => {
    await translator.register(sourceAdapter);
    expect(sourceAdapter.connected).toBe(true);
  });

  it('should not allow duplicate adapter names', async () => {
    await translator.register(sourceAdapter);
    expect(translator.register(new MockAdapter('source'))).rejects.toThrow();
  });

  it('should route messages between adapters', async () => {
    await translator.register(sourceAdapter);
    await translator.register(targetAdapter);

    await translator.addRoute('source', 'input-topic', 'target', 'output-topic');

    const ackSpy = vi.fn();
    const mockMsg: IMessage = {
      id: '123',
      topic: 'input-topic',
      source: 'source',
      payload: { hello: 'world' },
      timestamp: Date.now(),
      ack: ackSpy,
      nack: async () => {}
    };

    sourceAdapter.simulateMessage(mockMsg);

    // Wait for async routing
    await new Promise(r => setTimeout(r, 10));

    expect(targetAdapter.published.length).toBe(1);
    if (targetAdapter.published[0]) {
      expect(targetAdapter.published[0].topic).toBe('output-topic');
      expect(targetAdapter.published[0].payload).toEqual({ hello: 'world' });
    }
    expect(ackSpy).toHaveBeenCalled();
  });

  it('should auto-subscribe when a route is added after registration', async () => {
    await translator.register(sourceAdapter);
    await translator.addRoute('source', 'topic-a', 'target', 'topic-b');
    expect(sourceAdapter.subscribedTopics).toContain('topic-a');
  });
});
