class Channel<T> {
    private buffer: T[] = [];
    private producerResolves: ((value: void) => T)[] = [];
    private consumerResolves: ((value: T | null) => void)[] = [];
    private _closed: boolean = false;

    /**
     * Creates a new Channel instance.
     * @param bufferSize Optional size of the buffer. If not provided, the channel will have an unbounded buffer.
     * If a number is provided, it must be non-negative.
     */
    constructor(private bufferSize?: number) {
        if (bufferSize !== undefined && bufferSize < 0) {
            throw new Error('bufferSize must be non-negative');
        }
    }

    get closed() {
        return this._closed;
    }

    /**
     * Produce an item to the channel.
    */
    async produce(item: T): Promise<void> {
        if (this._closed) return;

        const consumer = this.consumerResolves.shift();
        if (consumer) {
            consumer(item);
        }
        else if (
            this.bufferSize != null &&
            this.buffer.length >= this.bufferSize
        ) {
            await new Promise<void>(resolve => this.producerResolves.push(() => {
                resolve();
                return item;
            }));
        }
        else {
            this.buffer.push(item);
        }
    }

    /**
     * Produce an item to all consumers.
     * This method is used when you want to notify all consumers with the same item.
     */
    produceAll(item: T) {
        if (this._closed) return;
        // 버퍼가 비어있지 않으면, 대기중인 소비자가 없음
        if (this.buffer.length > 0) return;
        
        for (const consumer of this.consumerResolves) {
            consumer(item);
        }
    }

    /**
     * Synchronously consume an item from the channel.
     * Returns null if no items are available.
     */
    tryConsumeSync(): T | null {
        if (this.buffer.length > 0) {
            return this.buffer.shift()!;
        }
        else {
            return null;
        }
    }

    /**
     * Consume an item from the channel.
     * If no items are available, it waits until an item is produced.
     */
    async consume(): Promise<T | null> {
        const producer = this.producerResolves.shift();
        if (producer) {
            const item = producer();
            this.buffer.push(item);
        }

        if (this.buffer.length > 0) {
            return this.buffer.shift()!;
        }
        else if (this._closed) {
            return null;
        }
        else {
            return await new Promise<T | null>(resolve => this.consumerResolves.push((item) => resolve(item)));
        }
    }

    /**
     * Closes the channel.
     * After this method is called, no more items can be produced.
     */
    close() {
        this._closed = true;

        for (const resolve of this.consumerResolves) {
            resolve(null);
        }
        this.consumerResolves.length = 0;
        for (const resolve of this.producerResolves) {
            resolve();
        }
        this.producerResolves.length = 0;
    }
}

export default Channel;