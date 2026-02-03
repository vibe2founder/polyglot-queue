import * as net from 'net';
import { EventEmitter } from 'events';
import { NatsParser } from './parser';

export class NatsClient extends EventEmitter {
    private socket: net.Socket | null = null;
    private parser = new NatsParser();
    private sidCounter = 0;

    constructor(private host: string = 'localhost', private port: number = 4222) {
        super();
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();

            this.socket.connect(this.port, this.host, () => {
                // NATS requires a CONNECT command after receiving INFO
                // For now, we'll send a basic one
                this.send('CONNECT {"verbose":false,"pedantic":false,"lang":"typescript","version":"1.0.0","protocol":1}');
                resolve();
            });

            this.socket.on('data', (data) => {
                this.parser.append(data.toString());
                const commands = this.parser.process();
                for (const cmd of commands) {
                    if (cmd.kind === 'PING') {
                        this.send('PONG');
                    } else if (cmd.kind === 'MSG') {
                        this.emit('message', cmd);
                    } else {
                        this.emit(cmd.kind.toLowerCase(), cmd.payload);
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

    send(command: string) {
        if (!this.socket) return;
        this.socket.write(command + '\r\n');
    }

    publish(subject: string, payload: any) {
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const bytes = Buffer.byteLength(data);
        this.send(`PUB ${subject} ${bytes}\r\n${data}`);
    }

    subscribe(subject: string): string {
        const sid = (++this.sidCounter).toString();
        this.send(`SUB ${subject} ${sid}`);
        return sid;
    }

    async disconnect(): Promise<void> {
        if (this.socket) {
            this.socket.end();
            this.socket = null;
        }
    }
}
