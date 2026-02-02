import { EventEmitter } from 'events';

export interface IMessage<T = any> {
  id: string;
  topic: string;
  source: string; // broker name
  payload: T;
  timestamp: number;
  ack(): Promise<void>;
  nack(requeue?: boolean): Promise<void>;
}

export interface IAdapter extends EventEmitter {
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(topic: string, payload: any): Promise<void>;
  subscribe(topic: string): Promise<void>;
}

export class QueueTranslator extends EventEmitter {
  private adapters: Map<string, IAdapter> = new Map();
  private routes: Array<{ fromSource: string, fromTopic: string, toSource: string, toTopic: string }> = [];

  constructor() {
    super();
  }

  /**
   * Register a new broker adapter
   */
  async register(adapter: IAdapter) {
    if (this.adapters.has(adapter.name)) {
      throw new Error(`Adapter ${adapter.name} already registered`);
    }

    this.adapters.set(adapter.name, adapter);
    
    // When adapter receives a message, it emits 'message'
    adapter.on('message', (msg: IMessage) => {
      this.emit('message', msg); // Re-emit for global listeners
      this.handleRouting(msg).catch(err => console.error("Routing Error:", err));
    });

    await adapter.connect();
    console.log(`[QueueTranslator] Registered and connected adapter: ${adapter.name}`);
  }

  /**
   * Define a route from one queue to another
   */
  async addRoute(fromSource: string, fromTopic: string, toSource: string, toTopic: string) {
    this.routes.push({ fromSource, fromTopic, toSource, toTopic });
    
    // Ensure we are subscribed on the source
    const adapter = this.adapters.get(fromSource);
    if (!adapter) {
        console.warn(`[QueueTranslator] Warning: Source adapter ${fromSource} not yet registered for route.`);
    } else {
        await adapter.subscribe(fromTopic);
    }
  }

  /**
   * Handle incoming messages and route them if configured
   */
  private async handleRouting(msg: IMessage) {
    // Find matching routes
    const matches = this.routes.filter(r => r.fromSource === msg.source && r.fromTopic === msg.topic);
    
    if (matches.length === 0) {
        // No auto-route, just an event emission (already handled).
        return;
    }

    for (const route of matches) {
      const targetAdapter = this.adapters.get(route.toSource);
      if (targetAdapter) {
        try {
            console.log(`[Translator] Routing message ${msg.id} from ${msg.source}/${msg.topic} -> ${route.toSource}/${route.toTopic}`);
            await targetAdapter.publish(route.toTopic, msg.payload);
            await msg.ack();
        } catch (err) {
            console.error(`[Translator] Failed to route message ${msg.id}`, err);
            // If one route fails, do we nack? Simple strategy: nack if any fail.
            await msg.nack(); 
        }
      } else {
          console.error(`[Translator] Target adapter ${route.toSource} not found for route.`);
      }
    }
  }
}