import * as net from 'net';
import { EventEmitter } from 'events';
import { RespParser } from './parser';

export class RedisClient extends EventEmitter {
  private socket: net.Socket;
  private parser: RespParser;
  private queue: Array<{ resolve: (v: any) => void, reject: (e: any) => void }> = [];
  private isConnected = false;
  private host: string;
  private port: number;

  constructor(host = 'localhost', port = 6379) {
    super();
    this.host = host;
    this.port = port;
    this.parser = new RespParser();
    this.socket = new net.Socket();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.host, () => {
        this.isConnected = true;
        this.emit('connect');
        resolve();
      });

      this.socket.on('data', (data) => {
        const chunk = data.toString(); 
        this.parser.append(chunk);
        const responses = this.parser.process();
        
        for (const res of responses) {
          const req = this.queue.shift();
          if (req) {
             if (res instanceof Error) {
                 req.reject(res);
             } else {
                 req.resolve(res);
             }
          } else {
             // Unexpected message
             this.emit('message', res); 
          }
        }
      });

      this.socket.on('error', (err) => {
        this.emit('error', err);
        // If initial connect fails
        if (!this.isConnected) reject(err);
      });
      
      this.socket.on('close', () => {
        this.isConnected = false;
        this.emit('close');
      });
    });
  }

  sendCommand(command: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) return reject(new Error('Not connected'));
      
      const req = this.encodeRESP(command);
      this.socket.write(req, (err) => {
          if (err) reject(err);
      });
      this.queue.push({ resolve, reject });
    });
  }

  private encodeRESP(args: string[]): string {
    let resp = `*${args.length}\r\n`;
    for (const arg of args) {
      const str = String(arg); // Convert any input to string
      resp += `$${str.length}\r\n${str}\r\n`;
    }
    return resp;
  }
  
  disconnect() {
      this.socket.end();
  }
}
