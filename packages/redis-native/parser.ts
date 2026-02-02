export class RespParser {
  private buffer: string = '';

  append(chunk: string) {
    this.buffer += chunk;
  }

  hasData(): boolean {
    return this.buffer.length > 0;
  }

  process(): any[] {
    const results: any[] = [];
    while (this.buffer.length > 0) {
      try {
        const { value, consumed } = this.parse(this.buffer);
        results.push(value);
        this.buffer = this.buffer.slice(consumed);
      } catch (e) {
        // Incomplete data, wait for more chunks
        break;
      }
    }
    return results;
  }

  private parse(input: string): { value: any, consumed: number } {
    if (input.length === 0) throw new Error("Incomplete");
    
    const type = input[0];
    const crlfIndex = input.indexOf('\r\n');
    
    if (crlfIndex === -1) throw new Error("Incomplete");

    if (type === '+') { // Simple String
      return { value: input.slice(1, crlfIndex), consumed: crlfIndex + 2 };
    }
    else if (type === '-') { // Error
      // We parse the error message but maybe we should return it as an object
      return { value: new Error(input.slice(1, crlfIndex)), consumed: crlfIndex + 2 };
    }
    else if (type === ':') { // Integer
      const num = parseInt(input.slice(1, crlfIndex), 10);
      return { value: num, consumed: crlfIndex + 2 };
    }
    else if (type === '$') { // Bulk String
      const lengthStr = input.slice(1, crlfIndex);
      const length = parseInt(lengthStr, 10);
      const contentStart = crlfIndex + 2;
      
      if (length === -1) {
        return { value: null, consumed: contentStart };
      }
      
      if (input.length < contentStart + length + 2) {
        throw new Error("Incomplete");
      }
      
      const content = input.slice(contentStart, contentStart + length);
      return { value: content, consumed: contentStart + length + 2 };
    }
    else if (type === '*') { // Array
      const count = parseInt(input.slice(1, crlfIndex), 10);
      let offset = crlfIndex + 2;
      const arr: any[] = [];
      
      if (count === -1) {
        return { value: null, consumed: offset };
      }

      for (let i = 0; i < count; i++) {
        // Recursive call needs to check bounds
        if (offset >= input.length) throw new Error("Incomplete"); // Optimization check
        
        const sub = this.parse(input.slice(offset));
        arr.push(sub.value);
        offset += sub.consumed;
      }
      return { value: arr, consumed: offset };
    }
    
    throw new Error(`Unknown RESP type: ${type}`);
  }
}
