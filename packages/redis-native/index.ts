import type { IAdapter, IMessage } from "../core/index";
import { RedisClient } from "./client";
import { EventEmitter } from "events";

export class RedisStreamAdapter extends EventEmitter implements IAdapter {
  name: string = "redis";
  private client: RedisClient;
  private subClient: RedisClient;
  private host: string;
  private port: number;
  private subscriptions: Set<string> = new Set();
  private lastIds: Map<string, string> = new Map();
  private isConsuming = false;

  constructor(host: string = "localhost", port: number = 6379) {
    super();
    this.host = host;
    this.port = port;
    this.client = new RedisClient(host, port);
    this.subClient = new RedisClient(host, port);
  }

  async connect() {
    await this.client.connect();
    await this.subClient.connect();
    this.startConsumerLoop();
  }

  async disconnect() {
    this.client.disconnect();
    this.subClient.disconnect();
    this.isConsuming = false;
  }

  async publish(topic: string, payload: any): Promise<void> {
    // XADD topic * data JSON
    await this.client.sendCommand([
      "XADD",
      topic,
      "*",
      "data",
      JSON.stringify(payload),
    ]);
  }

  async subscribe(topic: string): Promise<void> {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.add(topic);
      // Start reading from new messages only
      this.lastIds.set(topic, "$");
    }
  }

  private async startConsumerLoop() {
    this.isConsuming = true;
    while (this.isConsuming) {
      if (this.subscriptions.size === 0) {
        await new Promise((r) => setTimeout(r, 100));
        continue;
      }

      const streams = Array.from(this.subscriptions);
      const ids = streams.map((s) => this.lastIds.get(s) || "$");

      try {
        // XREAD BLOCK 1000 STREAMS s1 s2 id1 id2
        const res = await this.subClient.sendCommand([
          "XREAD",
          "BLOCK",
          "1000",
          "STREAMS",
          ...streams,
          ...ids,
        ]);
        if (res) {
          this.processMessages(res);
        }
      } catch (err) {
        // Timeout returns null usually, but error handling is good
        if ((err as any)?.message !== "null") {
          // check if custom timeout handling needed
          // console.error("Redis Consumer Error (or timeout):", err);
        }
        await new Promise((r) => setTimeout(r, 100)); // Backoff slightly on error
      }
    }
  }

  private processMessages(res: any) {
    if (!Array.isArray(res)) return;

    for (const streamData of res) {
      // Format: [topic, [[id, [k, v]]]]
      const topic = streamData[0];
      const messages = streamData[1];

      let lastId = this.lastIds.get(topic) || "$";

      for (const messageData of messages) {
        const id = messageData[0];
        const fields = messageData[1];
        lastId = id; // Update last seen ID

        let payload = null;
        // Parse fields [key, val, key, val]
        for (let i = 0; i < fields.length; i += 2) {
          if (fields[i] === "data") {
            try {
              payload = JSON.parse(fields[i + 1]);
            } catch (e) {
              payload = fields[i + 1];
            }
          }
        }

        const msg: IMessage = {
          id,
          topic,
          source: this.name,
          payload,
          timestamp: Date.now(),
          ack: async () => {},
          nack: async () => {},
        };
        this.emit("message", msg);
      }

      this.lastIds.set(topic, lastId);
    }
  }
}
