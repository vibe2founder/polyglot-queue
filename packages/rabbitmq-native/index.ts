import { IAdapter, IMessage } from '../core/index';
import { EventEmitter } from 'events';

export class RabbitMQAdapter extends EventEmitter implements IAdapter {
    name = 'rabbitmq';
    
    async connect() { 
        console.log('[RabbitMQ-Native] Stub Connected'); 
    }
    
    async disconnect() {
        console.log('[RabbitMQ-Native] Stub Disconnected');
    }
    
    async publish(topic: string, payload: any) {
        console.log(`[RabbitMQ-Native] Publish to ${topic}`, payload);
    }
    
    async subscribe(topic: string) {
        console.log(`[RabbitMQ-Native] Subscribe to ${topic}`);
    }
}
