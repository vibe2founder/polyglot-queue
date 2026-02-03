// Kafka Protocol API Keys
export enum ApiKey {
    Produce = 0,
    Fetch = 1,
    ListOffsets = 2,
    Metadata = 3,
    LeaderAndIsr = 4,
    StopReplica = 5,
    UpdateMetadata = 6,
    ControlledShutdown = 7,
    OffsetCommit = 8,
    OffsetFetch = 9,
    FindCoordinator = 10,
    JoinGroup = 11,
    Heartbeat = 12,
    LeaveGroup = 13,
    SyncGroup = 14,
    DescribeGroups = 15,
    ListGroups = 16,
    ApiVersions = 18
}

export interface KafkaRequest {
    apiKey: ApiKey;
    apiVersion: number;
    correlationId: number;
    clientId: string;
    payload: Buffer;
}

export interface KafkaResponse {
    correlationId: number;
    payload: Buffer;
}

export class KafkaParser {
    private buffer: Buffer = Buffer.alloc(0);

    append(data: Buffer) {
        this.buffer = Buffer.concat([this.buffer, data]);
    }

    processResponses(): KafkaResponse[] {
        const responses: KafkaResponse[] = [];

        while (this.buffer.length >= 4) {
            const messageSize = this.buffer.readInt32BE(0);
            
            if (this.buffer.length < 4 + messageSize) break;

            const correlationId = this.buffer.readInt32BE(4);
            const payload = Buffer.from(this.buffer.subarray(8, 4 + messageSize));

            responses.push({ correlationId, payload });
            this.buffer = this.buffer.subarray(4 + messageSize);
        }

        return responses;
    }
}

// Helper to encode Kafka requests
export function encodeRequest(req: KafkaRequest): Buffer {
    const clientIdBuf = Buffer.alloc(2 + req.clientId.length);
    clientIdBuf.writeInt16BE(req.clientId.length, 0);
    clientIdBuf.write(req.clientId, 2);

    const header = Buffer.alloc(8);
    header.writeInt16BE(req.apiKey, 0);
    header.writeInt16BE(req.apiVersion, 2);
    header.writeInt32BE(req.correlationId, 4);

    const body = Buffer.concat([header, clientIdBuf, req.payload]);
    const size = Buffer.alloc(4);
    size.writeInt32BE(body.length, 0);

    return Buffer.concat([size, body]);
}
