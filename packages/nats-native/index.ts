import type { IAdapter } from "../core/index";
import { EventEmitter } from "events";

export class NatsAdapter extends EventEmitter implements IAdapter {
  name = "nats";

  async connect() {
    console.log("[NATS-Native] Stub Connected");
  }

  async disconnect() {}

  async publish(topic: string, payload: any) {
    console.log(`[NATS-Native] Publish to ${topic}`, payload);
  }

  async subscribe(topic: string) {
    console.log(`[NATS-Native] Subscribe to ${topic}`);
  }
}
