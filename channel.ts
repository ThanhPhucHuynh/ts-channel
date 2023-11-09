export enum ChannelState {
    EMPTY = 0,
    RECEIVER,
    DATA,
    CLOSED,
}

export class Channel<T> implements AsyncIterable<T> {
    private state: ChannelState = ChannelState.EMPTY;
    private dataQueue: T[] = [];
    private receiverQueue: ((value: T) => void)[] = [];

    get State(): ChannelState {
        return this.state;
    }

    send(data: T): void {
        if (this.state === ChannelState.CLOSED) {
            throw new ChannelError("Channel is closed");
        }

        if (this.state === ChannelState.RECEIVER) {
            const receiver = this.receiverQueue.shift();
            if (receiver) {
                receiver(data);
                if (this.receiverQueue.length === 0) {
                    this.state = ChannelState.EMPTY;
                }
            } else {
                this.dataQueue.push(data);
                this.state = ChannelState.DATA;
            }
        } else {
            this.dataQueue.push(data);
            this.state = ChannelState.DATA;
        }
    }

    async receive(): Promise<T> {
        if (this.state === ChannelState.CLOSED) {
            throw new ChannelError("Channel is closed");
        }

        if (this.state === ChannelState.DATA) {
            const data = this.dataQueue.shift();
            if (data !== undefined) {
                if (this.dataQueue.length === 0) {
                    this.state = ChannelState.EMPTY;
                }
                return data;
            }
        }

        return new Promise<T>((resolve, reject) => {
            this.receiverQueue.push(resolve);
            this.state = ChannelState.RECEIVER;
        });
    }

    close(): void {
        if (this.state !== ChannelState.CLOSED) {
            this.state = ChannelState.CLOSED;
            while (this.receiverQueue.length > 0) {
                this.receiverQueue.shift();
            }
        }
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return this;
    }

    async next(): Promise<IteratorResult<T, any>> {
        try {
            const value = await this.receive();
            return { value, done: false };
        } catch {
            this.close();
            return { value: undefined, done: true };
        }
    }
}

class ChannelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ChannelError";
    }
}
