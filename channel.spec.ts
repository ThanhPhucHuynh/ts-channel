import { Channel, ChannelState } from './channel'; // Import your Channel class and enums

describe('Channel', () => {
  let channel: Channel<number>; // Replace with the appropriate type if necessary

  beforeEach(() => {
    channel = new Channel<number>();
  });

  afterEach(() => {
    channel.close();
  });

  it('should send and receive messages', async () => {
    const sentValue = 42;
    channel.send(sentValue);

    const receivedValue = await channel.receive();


    expect(receivedValue).toBe(sentValue);
  });

  it('should handle multiple send and receive operations', async () => {
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

    // Start the receive operation in the background

    // Send values to the channel
    for (const value of valuesToSend) {
      channel.send(value);
    }

    await receivePromise();

    channel.close(); // Close the channel when done

    // Wait for the background receive operation to finish
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(receivedValues).toEqual(valuesToSend);
  });

  it('should throw an error when trying to send to a closed channel', () => {
    channel.close();

    try {
      channel.send(42);
    } catch (error: any) {
      expect(error.message).toBe('Channel is closed');
    }
  });

  it('should throw an error when trying to receive from a closed channel', async () => {
    channel.close();

    try {
      await channel.receive();
    } catch (error: any) {
      expect(error.message).toBe('Channel is closed');
    }
  });
});
