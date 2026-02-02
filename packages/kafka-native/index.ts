import { IAdapter } from '../core/index';
import { EventEmitter } from 'events';

export class KafkaAdapter extends EventEmitter implements IAdapter {
    name = 'kafka';
    
    async connect() { 
        console.log('[Kafka-Native] Stub Connected'); 
    }
    
    async disconnect() {}
    
    async publish(topic: string, payload: any) {
        console.log(`[Kafka-Native] Publish to ${topic}`, payload);
    }
    
    async subscribe(topic: string) {
        console.log(`[Kafka-Native] Subscribe to ${topic}`);
    }
}
