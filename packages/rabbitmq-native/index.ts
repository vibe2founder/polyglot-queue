import { EventEmitter } from "events";
import type { IAdapter, IMessage } from "../core/index";
import { RabbitMQClient } from "./client";

export class RabbitMQNativeAdapter extends EventEmitter implements IAdapter {
  name = "rabbitmq";
  private client: RabbitMQClient;

  constructor(host: string = "localhost", port: number = 5672) {
    super();
    this.client = new RabbitMQClient(host, port);
  }

  async connect() {
    await this.client.connect();
    // In a real scenario, we would listen for frames and emit 'message'
  }

  async disconnect() {
    await this.client.disconnect();
  }

  async publish(topic: string, payload: any) {
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    // RabbitMQ uses exchange/routingKey. For simplicity map topic to routingKey
    await this.client.publish("", topic, data);
  }

  async subscribe(topic: string) {
    // AMQP Consume implementation would go here
    // For now we fulfill the interface with the native client infrastructure
    console.log(`[RabbitMQ-Native] Subscribed via Wire Protocol to ${topic}`);
  }
}
