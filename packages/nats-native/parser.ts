export type NatsMessage = {
    kind: 'MSG';
    subject: string;
    sid: string;
    replyTo?: string;
    size: number;
    payload: string;
};

export type NatsControl = {
    kind: 'PING' | 'PONG' | 'OK' | 'ERR' | 'INFO';
    payload?: any;
};

export class NatsParser {
    private buffer: string = '';

    append(chunk: string) {
        this.buffer += chunk;
    }

    process(): (NatsMessage | NatsControl)[] {
        const results: (NatsMessage | NatsControl)[] = [];
        
        while (this.buffer.length > 0) {
            const lineEnd = this.buffer.indexOf('\r\n');
            if (lineEnd === -1) break;

            const line = this.buffer.substring(0, lineEnd);
            const spaceIdx = line.indexOf(' ');
            const command = (spaceIdx === -1 ? line : line.substring(0, spaceIdx)).toUpperCase();

            if (command === 'MSG') {
                const parts = line.split(' ');
                // MSG <subject> <sid> [reply-to] <#bytes>
                const hasReply = parts.length === 5;
                const subject = parts[1] ?? '';
                const sid = parts[2] ?? '';
                const sizeStr = parts[parts.length - 1] ?? '0';
                const size = parseInt(sizeStr);
                
                const totalMsgLength = lineEnd + 2 + size + 2; // \r\n + payload + \r\n
                if (this.buffer.length < totalMsgLength) break;

                const payload = this.buffer.substring(lineEnd + 2, lineEnd + 2 + size);
                
                results.push({
                    kind: 'MSG',
                    subject,
                    sid,
                    replyTo: hasReply ? parts[3] : undefined,
                    size,
                    payload
                });

                this.buffer = this.buffer.substring(totalMsgLength);
            } else if (command === 'PING') {
                results.push({ kind: 'PING' });
                this.buffer = this.buffer.substring(lineEnd + 2);
            } else if (command === 'PONG') {
                results.push({ kind: 'PONG' });
                this.buffer = this.buffer.substring(lineEnd + 2);
            } else if (command === '+OK') {
                results.push({ kind: 'OK' });
                this.buffer = this.buffer.substring(lineEnd + 2);
            } else if (command === '-ERR') {
                results.push({ kind: 'ERR', payload: line.substring(5).trim() });
                this.buffer = this.buffer.substring(lineEnd + 2);
            } else if (command === 'INFO') {
                results.push({ kind: 'INFO', payload: JSON.parse(line.substring(5).trim()) });
                this.buffer = this.buffer.substring(lineEnd + 2);
            } else {
                // Skip unknown or empty lines
                this.buffer = this.buffer.substring(lineEnd + 2);
            }
        }

        return results;
    }
}
