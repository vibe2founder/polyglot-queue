export enum FrameType {
    METHOD = 1,
    HEADER = 2,
    BODY = 3,
    HEARTBEAT = 4
}

export interface AmqpFrame {
    type: FrameType;
    channel: number;
    payload: Buffer;
}

export class AmqpParser {
    private buffer: Buffer = Buffer.alloc(0);

    append(data: Buffer) {
        this.buffer = Buffer.concat([this.buffer, data]);
    }

    process(): AmqpFrame[] {
        const frames: AmqpFrame[] = [];

        while (this.buffer.length >= 8) {
            const type = this.buffer[0];
            const channel = this.buffer.readUInt16BE(1);
            const size = this.buffer.readUInt32BE(3);
            
            if (this.buffer.length < 8 + size + 1) break;

            const payloadEnd = 8 + size;
            const payload = this.buffer.subarray(8, payloadEnd);
            const frameEndMarker = this.buffer[payloadEnd];

            if (frameEndMarker !== 0xCE) {
                // Protocol error or sync loss
                this.buffer = this.buffer.subarray(1);
                continue;
            }

            frames.push({
                type: type as FrameType,
                channel,
                payload: Buffer.from(payload)
            });

            this.buffer = this.buffer.subarray(payloadEnd + 1);
        }

        return frames;
    }
}
