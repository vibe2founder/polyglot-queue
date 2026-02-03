import * as net from 'net';
import { EventEmitter } from 'events';
import { KafkaParser, ApiKey, encodeRequest, type KafkaResponse } from './parser';

export class KafkaClient extends EventEmitter {
    private socket: net.Socket | null = null;
    private parser = new KafkaParser();
    private correlationId = 0;
    private pendingRequests = new Map<number, (response: KafkaResponse) => void>();
    private clientId = 'one-q-4-all';

    constructor(private host: string = 'localhost', private port: number = 9092) {
        super();
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();

            this.socket.connect(this.port, this.host, async () => {
                // Send ApiVersions request to initiate connection
                await this.apiVersions();
                resolve();
            });

            this.socket.on('data', (data) => {
                const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
                this.parser.append(buf);
                const responses = this.parser.processResponses();
                for (const res of responses) {
                    const handler = this.pendingRequests.get(res.correlationId);
                    if (handler) {
                        handler(res);
                        this.pendingRequests.delete(res.correlationId);
                    }
                }
            });

            this.socket.on('error', (err) => {
                this.emit('error', err);
                reject(err);
            });

            this.socket.on('close', () => {
                this.emit('close');
            });
        });
    }

    private sendRequest(apiKey: ApiKey, apiVersion: number, payload: Buffer): Promise<KafkaResponse> {
        return new Promise((resolve) => {
            const corrId = ++this.correlationId;
            this.pendingRequests.set(corrId, resolve);

            const request = encodeRequest({
                apiKey,
                apiVersion,
                correlationId: corrId,
                clientId: this.clientId,
                payload
            });

            this.socket?.write(request);
        });
    }

    async apiVersions(): Promise<KafkaResponse> {
        return this.sendRequest(ApiKey.ApiVersions, 0, Buffer.alloc(0));
    }

    async metadata(topics: string[]): Promise<KafkaResponse> {
        // Encode topics array
        const topicsLen = Buffer.alloc(4);
        topicsLen.writeInt32BE(topics.length, 0);
        
        const topicBuffers = topics.map(t => {
            const buf = Buffer.alloc(2 + t.length);
            buf.writeInt16BE(t.length, 0);
            buf.write(t, 2);
            return buf;
        });

        return this.sendRequest(ApiKey.Metadata, 0, Buffer.concat([topicsLen, ...topicBuffers]));
    }

    async produce(topic: string, partition: number, messages: Buffer[]): Promise<KafkaResponse> {
        // Simplified Produce request (v0)
        // Acks, Timeout, Topic, Partition, MessageSet
        const header = Buffer.alloc(6);
        header.writeInt16BE(-1, 0); // acks = -1 (all replicas)
        header.writeInt32BE(30000, 2); // timeout = 30s

        const topicBuf = Buffer.alloc(2 + topic.length);
        topicBuf.writeInt16BE(topic.length, 0);
        topicBuf.write(topic, 2);

        const partitionBuf = Buffer.alloc(8);
        partitionBuf.writeInt32BE(1, 0); // partition count
        partitionBuf.writeInt32BE(partition, 4);

        // Simplified: just send raw messages
        const messageSet = Buffer.concat(messages.map(msg => {
            const msgBuf = Buffer.alloc(12 + msg.length);
            msgBuf.writeBigInt64BE(BigInt(0), 0); // offset
            msgBuf.writeInt32BE(msg.length, 8); // message size
            msg.copy(msgBuf, 12);
            return msgBuf;
        }));

        const payload = Buffer.concat([header, topicBuf, partitionBuf, messageSet]);
        return this.sendRequest(ApiKey.Produce, 0, payload);
    }

    async disconnect(): Promise<void> {
        if (this.socket) {
            this.socket.end();
            this.socket = null;
        }
    }
}
