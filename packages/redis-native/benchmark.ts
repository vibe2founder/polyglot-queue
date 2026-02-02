import { RespParser } from './parser';

const ITERATIONS = 1_000_000;

console.log(`\n🚀 [Benchmark] RespParser - ${ITERATIONS.toLocaleString()} iterations`);
console.log('----------------------------------------------------');

const parser = new RespParser();
const simpleString = '+OK\r\n';
const bulkString = '$11\r\nhello world\r\n';
const array = '*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n';

function bench(name: string, data: string) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        parser.append(data);
        parser.process();
    }
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = Math.floor(ITERATIONS / (duration / 1000));
    console.log(`${name.padEnd(15)} | ${duration.toFixed(2)}ms | ${opsPerSec.toLocaleString()} ops/s`);
}

bench('Simple String', simpleString);
bench('Bulk String', bulkString);
bench('Array (2 items)', array);

console.log('----------------------------------------------------');
