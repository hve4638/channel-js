# @hve/channel

비동기 데이터 전송을 위한 버퍼링된 채널 라이브러리입니다.

Go 언어의 채널(Channel)에서 영감을 받아 JavaScript/TypeScript에서 구현한 라이브러리입니다.

## Install

```bash
npm install @hve/channel
```

## Example

```ts
import Channel from '@hve/channel';

async function example() {
  const channel = new Channel<number>();
  
  await channel.produce(1);
  await channel.produce(2);
  await channel.produce(3);
  
  const value1 = await channel.consume(); // 1
  const value2 = await channel.consume(); // 2
  const value3 = await channel.consume(); // 3
  
  console.log(value1, value2, value3); // 1 2 3
}
```

## Usage

```ts
constructor(bufferSize?: number)
```

buffer 사이즈를 지정합니다
- `undefined` : 무제한 버퍼, 버퍼 사이즈에 제한이 없으며 produce시 대기하지 않고 항상 즉시 반환됩니다.
- `0` : 동기식 채널, produce 시 즉시 block되고 consume되기 전까지 대기합니다.
- `양수` : produce 시 버퍼가 모두 찰 때까지 대기하지 않고 즉시 반환됩니다.


```ts
async produce(item: T): Promise<void>
```

채널에 데이터를 전송합니다.

```ts
async consume(): Promise<T>
```

채널에서 데이터를 수신합니다.

버퍼 크기에 관계없이 버퍼에 채널에 데이터가 없다면 대기합니다.

## License

MIT