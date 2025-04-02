class Channel<T> {
    #buffer: T[] = [];
    #bufferSize?: number;
    #producerResolves: ((value: void) => T)[] = [];
    #consumerResolves: ((value: T) => void)[] = [];

    constructor(bufferSize?: number) {
        if (bufferSize !== undefined && bufferSize < 0) {
            throw new Error('bufferSize must be non-negative');
        }
        this.#bufferSize = bufferSize;
    }

    async produce(item: T): Promise<void> {
        const consumer = this.#consumerResolves.shift()
        if (consumer) {
            consumer(item);
        }
        else if (
            this.#bufferSize != null &&
            this.#buffer.length >= this.#bufferSize
        ) {
            await new Promise<void>(resolve => this.#producerResolves.push(()=>{
                resolve();
                return item;
            }));
        }
        else {
            this.#buffer.push(item);
        }
    }

    async consume(): Promise<T> {
        const producer = this.#producerResolves.shift()
        if (producer) {
            const item = producer();
            this.#buffer.push(item);
        }
        
        if (this.#buffer.length === 0) {
            return await new Promise<T>(resolve => this.#consumerResolves.push((item)=> resolve(item)));
        }
        else {
            return this.#buffer.shift()!;
        }
    }
}

export default Channel;