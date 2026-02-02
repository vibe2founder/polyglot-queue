import { QueueTranslator } from './index';
import type { IAdapter, IMessage } from './index';
import { EventEmitter } from 'events';

class BenchAdapter extends EventEmitter implements IAdapter {
    name: string;
    constructor(name: string) { super(); this.name = name; }
    async connect() {}
    async disconnect() {}
    async publish(topic: string, payload: any) {}
    async subscribe(topic: string) {}
}

const ITERATIONS = 500_000;
const translator = new QueueTranslator();
const source = new BenchAdapter('source');
const target = new BenchAdapter('target');

await translator.register(source);
await translator.register(target);
await translator.addRoute('source', 'bench', 'target', 'bench-out');

const msg: IMessage = {
    id: '1',
    topic: 'bench',
    source: 'source',
    payload: { test: true },
    timestamp: Date.now(),
    ack: async () => {},
    nack: async () => {}
};

console.log(`\n🏎️  [Benchmark] QueueTranslator Routing - ${ITERATIONS.toLocaleString()} messages`);
console.log('----------------------------------------------------');

const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    source.emit('message', msg);
}

// Pequeno delay para garantir que o Promise.all interno (se houver) se resolva ou o loop de eventos processe
await new Promise(r => setTimeout(r, 500)); 

const end = performance.now();
const duration = (end - start) - 500; // Descontando o delay artificial
const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));

console.log(`Throughput      | ${duration.toFixed(2)}ms | ${opsPerSec.toLocaleString()} msg/s`);
console.log('----------------------------------------------------');
