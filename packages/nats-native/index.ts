import { EventEmitter } from "events";
import type { IAdapter, IMessage } from "../core/index";
import { NatsClient } from "./client";

export class NatsNativeAdapter extends EventEmitter implements IAdapter {
  name: string = "nats";
  private client: NatsClient;

  constructor(host: string = "localhost", port: number = 4222) {
    super();
    this.client = new NatsClient(host, port);

    this.client.on("message", (msg) => {
      const imessage: IMessage = {
        id: crypto.randomUUID(),
        topic: msg.subject,
        source: this.name,
        payload: this.parsePayload(msg.payload),
        timestamp: Date.now(),
        ack: async () => {}, // NATS Core doesn't require ACKs for standard PUB/SUB
        nack: async () => {},
      };
      this.emit("message", imessage);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async publish(topic: string, payload: any): Promise<void> {
    this.client.publish(topic, payload);
  }

  async subscribe(topic: string): Promise<void> {
    this.client.subscribe(topic);
  }

  private parsePayload(payload: string): any {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }
}
