import Channel from '../Channel';

describe('Channel buffer size', () => {
    function c<T>(data:T) { return `consume_${data}` }
    function p() { return `produce` }

    let result:any[] = [];
    let log:any[] = [];

    const produceThen = () => {
        log.push(p());
    }
    const consumeThen = (data) => {
        result.push(data);
        log.push(c(data));
    }
    const testSet = (bufferSize:number|undefined, log:any[], result:number[]) => {
        return { bufferSize, log, result }
    }

    const produceFirstTables = [
        testSet(undefined, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
        testSet(0, [ c(1), c(2), c(3), p(), p(), p(), ], [1, 2, 3]),
        testSet(1, [ p(), c(1), c(2), c(3), p(), p(), ], [1, 2, 3]),
        testSet(2, [ p(), p(), c(1), c(2), c(3), p(), ], [1, 2, 3]),
        testSet(3, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
    ];

    const consumeFirstTables = [
        testSet(undefined, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
        testSet(0, [ p(), p(), p(), c(1), c(2), c(3),  ], [1, 2, 3]),
        testSet(1, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
        testSet(2, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
        testSet(3, [ p(), p(), p(), c(1), c(2), c(3), ], [1, 2, 3]),
    ];
    
    beforeEach(() => {
        log = [];
        result = [];
    });

    produceFirstTables.forEach(({bufferSize, log: expectedLog, result: expectedResult}) => {
        test(`버퍼 사이즈 : ${bufferSize} (produce first)`, async () => {
            const channel = new Channel<number>(bufferSize);
            await Promise.all([
                channel.produce(1).then(produceThen),
                channel.produce(2).then(produceThen),
                channel.produce(3).then(produceThen),
                channel.consume().then(consumeThen),
                channel.consume().then(consumeThen),
                channel.consume().then(consumeThen),
            ])
            expect(log).toEqual(expectedLog);
            expect(result).toEqual(expectedResult);
        });
    });

    consumeFirstTables.forEach(({bufferSize, log: expectedLog, result: expectedResult}) => {
        test(`버퍼 사이즈 : ${bufferSize} (consume first)`, async () => {
            const channel = new Channel<number>(bufferSize);
            await Promise.all([
                channel.consume().then(consumeThen),
                channel.consume().then(consumeThen),
                channel.consume().then(consumeThen),
                channel.produce(1).then(produceThen),
                channel.produce(2).then(produceThen),
                channel.produce(3).then(produceThen),
            ])
            expect(log).toEqual(expectedLog);
            expect(result).toEqual(expectedResult);
        });
    });

    
    test(`음수 버퍼 사이즈`, async () => {
        expect(()=>new Channel<number>(-1)).toThrow();
    });
});