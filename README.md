[LINK TEST](https://thanhphuchuynh.github.io/ts-channel/coverage/lcov-report/index.html)

[typescript-channel - npm ](https://www.npmjs.com/package/typescript-channel)
```go

channel = new Channel<number>();

const valuesToSend = [1, 2, 3];
    const receivedValues: number[] = [];

    const receivePromise = async () => {
      while (channel.State != ChannelState.EMPTY) {
        try {
          const value = await channel.receive();
          receivedValues.push(value);
        } catch {
          break; // Stop when the channel is closed
        }
      }
    };

    // Send values to the channel
    for (const value of valuesToSend) {
      channel.send(value);
    }

    // Start the receive operation in the background
    await receivePromise();

    channel.close(); // Close the channel when done

    // Wait for the background receive operation to finish
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(receivedValues).toEqual(valuesToSend);

```
