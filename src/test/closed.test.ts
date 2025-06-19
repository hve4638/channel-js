import Channel from '../Channel';

describe('Channel close behavior', () => {
    test('close() should mark channel as closed', async () => {
        const channel = new Channel<number>();
        expect(channel.closed).toBe(false);
        channel.close();
        expect(channel.closed).toBe(true);
    });
    
    test('consume() should return null after channel is closed', async () => {
        const channel = new Channel<number>();
        channel.close();
        const result = await channel.consume();
        expect(result).toBeNull();
    });
    
    test('produce() should not block after channel is closed', async () => {
        const channel = new Channel<number>(0); // 0 buffer to force blocking
        channel.close();
        // This would normally block with buffer size 0, but should return immediately
        await channel.produce(42);
        // If we got here, the test passes
    });
    
    test('pending consumers should receive null when channel is closed', async () => {
        const channel = new Channel<number>();
        const results: (number | null)[] = [];
        
        // Start consumers that will be pending
        const consumePromises = [
            channel.consume().then(value => results.push(value)),
            channel.consume().then(value => results.push(value)),
        ];
        
        // Close the channel
        channel.close();
        
        // Wait for consumers to resolve
        await Promise.all(consumePromises);
        
        expect(results).toEqual([null, null]);
    });
    
    test('pending producers should be unblocked when channel is closed', async () => {
        const channel = new Channel<number>(0); // 0 buffer to force blocking
        let producerResolved = false;
        
        // Start a producer that will be blocked
        const producePromise = channel.produce(42).then(() => {
            producerResolved = true;
        });
        
        // Give some time for the producer to get blocked
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Close the channel, which should unblock the producer
        channel.close();
        
        // Wait for the producer to resolve
        await producePromise;
        
        expect(producerResolved).toBe(true);
    });
    
    test('items produced before close should be consumable', async () => {
        const channel = new Channel<number>();
        await channel.produce(1);
        await channel.produce(2);
        
        channel.close();
        
        const result1 = await channel.consume();
        const result2 = await channel.consume();
        const result3 = await channel.consume();
        
        expect(result1).toBe(1);
        expect(result2).toBe(2);
        expect(result3).toBeNull();
    });
});