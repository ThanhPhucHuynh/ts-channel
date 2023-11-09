"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const channel_1 = require("./channel"); // Import your Channel class and enums
describe('Channel', () => {
    let channel; // Replace with the appropriate type if necessary
    beforeEach(() => {
        channel = new channel_1.Channel();
    });
    afterEach(() => {
        channel.close();
    });
    it('should send and receive messages', () => __awaiter(void 0, void 0, void 0, function* () {
        const sentValue = 42;
        channel.send(sentValue);
        const receivedValue = yield channel.receive();
        expect(receivedValue).toBe(sentValue);
    }));
    it('should handle multiple send and receive operations', () => __awaiter(void 0, void 0, void 0, function* () {
        const valuesToSend = [1, 2, 3];
        const receivedValues = [];
        const receivePromise = () => __awaiter(void 0, void 0, void 0, function* () {
            while (channel.State != channel_1.ChannelState.EMPTY) {
                try {
                    const value = yield channel.receive();
                    receivedValues.push(value);
                }
                catch (_a) {
                    break; // Stop when the channel is closed
                }
            }
        });
        // Start the receive operation in the background
        // Send values to the channel
        for (const value of valuesToSend) {
            channel.send(value);
        }
        yield receivePromise();
        channel.close(); // Close the channel when done
        // Wait for the background receive operation to finish
        yield new Promise((resolve) => setTimeout(resolve, 0));
        expect(receivedValues).toEqual(valuesToSend);
    }));
    it('should throw an error when trying to send to a closed channel', () => {
        channel.close();
        try {
            channel.send(42);
        }
        catch (error) {
            expect(error.message).toBe('Channel is closed');
        }
    });
    it('should throw an error when trying to receive from a closed channel', () => __awaiter(void 0, void 0, void 0, function* () {
        channel.close();
        try {
            yield channel.receive();
        }
        catch (error) {
            expect(error.message).toBe('Channel is closed');
        }
    }));
});
