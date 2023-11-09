export declare enum ChannelState {
    EMPTY = 0,
    RECEIVER = 1,
    DATA = 2,
    CLOSED = 3
}
export declare class Channel<T> implements AsyncIterable<T> {
    private state;
    private dataQueue;
    private receiverQueue;
    get State(): ChannelState;
    send(data: T): void;
    receive(): Promise<T>;
    close(): void;
    [Symbol.asyncIterator](): AsyncIterator<T>;
    next(): Promise<IteratorResult<T, any>>;
}
