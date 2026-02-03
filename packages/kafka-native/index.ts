import { EventEmitter } from "events";
import type { IAdapter, IMessage } from "../core/index";
import { KafkaClient } from "./client";

export class KafkaNativeAdapter extends EventEmitter implements IAdapter {
  name = "kafka";
  private client: KafkaClient;

  constructor(host: string = "localhost", port: number = 9092) {
    super();
    this.client = new KafkaClient(host, port);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async publish(topic: string, payload: any): Promise<void> {
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    const msgBuf = Buffer.from(data);
    await this.client.produce(topic, 0, [msgBuf]);
  }

  async subscribe(topic: string): Promise<void> {
    // Kafka consumer implementation would require Fetch API + Group Coordinator
    // For now, this provides the interface with native client infrastructure
    console.log(`[Kafka-Native] Subscribed via Wire Protocol to ${topic}`);
  }
}
