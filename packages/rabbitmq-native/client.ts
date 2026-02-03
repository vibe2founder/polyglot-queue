import * as net from 'net';
import { EventEmitter } from 'events';
import { AmqpParser, FrameType } from './parser';

export class RabbitMQClient extends EventEmitter {
    private socket: net.Socket | null = null;
    private parser = new AmqpParser();
    private channel = 1;
    private state: 'START' | 'TUNE' | 'OPEN' | 'CONNECTED' = 'START';

    constructor(private host: string = 'localhost', private port: number = 5672) {
        super();
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();
            
            this.socket.connect(this.port, this.host, () => {
                // Send AMQP Protocol Header
                this.socket?.write(Buffer.from([0x41, 0x4d, 0x51, 0x50, 0x00, 0x00, 0x09, 0x01]));
            });

            this.socket.on('data', (data) => {
                const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
                this.parser.append(buf);
                const frames = this.parser.process();
                for (const frame of frames) {
                    this.handleFrame(frame, resolve);
                }
            });

            this.socket.on('error', (err) => {
                this.emit('error', err);
                reject(err);
            });
        });
    }

    private handleFrame(frame: any, resolve: Function) {
        // Simplified AMQP state machine for handshake
        // In a full implementation, we would decode the Method Class/ID
        
        if (this.state === 'START' && frame.type === FrameType.METHOD) {
            // Received Connection.Start
            // Send Connection.StartOk (Plain authentication)
            // Simplified: hardcoded bytes for guest/guest
            this.sendMethod(0, 10, 11, Buffer.concat([
                this.writeShortString('PLAIN'), // mechanism
                this.writeLongString('\0guest\0guest'), // response
                this.writeShortString('en_US') // locale
            ]));
            this.state = 'TUNE';
        } else if (this.state === 'TUNE' && frame.type === FrameType.METHOD) {
            // Received Connection.Tune
            // Send Connection.TuneOk
            this.sendMethod(0, 10, 31, Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00])); 
            // Send Connection.Open
            this.sendMethod(0, 10, 40, Buffer.concat([this.writeShortString('/')]));
            this.state = 'OPEN';
        } else if (this.state === 'OPEN' && frame.type === FrameType.METHOD) {
            // Received Connection.OpenOk
            // Send Channel.Open
            this.sendMethod(this.channel, 20, 10, Buffer.from([0x00])); 
            this.state = 'CONNECTED';
            resolve();
            this.emit('connected');
        }
    }

    private sendMethod(channel: number, classId: number, methodId: number, args: Buffer) {
        const payload = Buffer.alloc(args.length + 4);
        payload.writeUInt16BE(classId, 0);
        payload.writeUInt16BE(methodId, 2);
        args.copy(payload, 4);
        this.sendFrame(FrameType.METHOD, channel, payload);
    }

    private sendFrame(type: FrameType, channel: number, payload: Buffer) {
        const frame = Buffer.alloc(payload.length + 8 + 1);
        frame[0] = type;
        frame.writeUInt16BE(channel, 1);
        frame.writeUInt32BE(payload.length, 3);
        payload.copy(frame, 8);
        frame[frame.length - 1] = 0xCE;
        this.socket?.write(frame);
    }

    // Helper to write AMQP short-string
    private writeShortString(str: string): Buffer {
        const buf = Buffer.alloc(str.length + 1);
        buf[0] = str.length;
        buf.write(str, 1);
        return buf;
    }

    // Helper to write AMQP long-string
    private writeLongString(str: string): Buffer {
        const buf = Buffer.alloc(str.length + 4);
        buf.writeUInt32BE(str.length, 0);
        buf.write(str, 4);
        return buf;
    }

    async publish(exchange: string, routingKey: string, message: string) {
        // Basic.Publish method (60, 40)
        // Ticket(0), Exchange, RoutingKey, Mandatory/Immediate flags
        const args = Buffer.concat([
            Buffer.from([0x00, 0x00]), // reserved-1
            this.writeShortString(exchange),
            this.writeShortString(routingKey),
            Buffer.from([0x00]) // flags
        ]);
        this.sendMethod(this.channel, 60, 40, args);

        // Content Header Frame
        const bodyBuf = Buffer.from(message);
        const header = Buffer.alloc(14);
        header.writeUInt16BE(60, 0); // classId
        header.writeUInt16BE(0, 2); // weight
        header.writeBigUInt64BE(BigInt(bodyBuf.length), 4);
        header.writeUInt16BE(0x1000, 12); // property flags (content-type)
        this.sendFrame(FrameType.HEADER, this.channel, header);

        // Body Frame
        this.sendFrame(FrameType.BODY, this.channel, bodyBuf);
    }

    async disconnect() {
        this.socket?.end();
    }
}
