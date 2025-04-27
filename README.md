# @hve/channel

> A buffered channel library for asynchronous data transmission
> 
> 비동기 데이터 전송을 위한 버퍼링된 채널 라이브러리

Go 언어의 채널(Channel)에서 영감을 받아 JavaScript/TypeScript에서 구현한 라이브러리입니다.

## Installation 

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

### Constructor

```ts
constructor(bufferSize?: number)
```

`bufferSize`는 채널의 버퍼 크기를 설정합니다.
- `undefined` : 무제한 버퍼
  - 버퍼 크기에 제한이 없으며, `produce`시 항상 즉시 반환됩니다.
- `0` : 동기식 채널
  - `produce` 시 즉시 블로킹되며, `consume` 전까지 대기합니다.
- `> 0` : 유한 버퍼
  - 버퍼가 가득 차기 전까지 `produce` 시 즉시 반환됩니다.
  - 버퍼가 가득 차면 대기합니다.

### Methods

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