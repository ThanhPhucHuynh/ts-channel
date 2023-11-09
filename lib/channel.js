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
exports.Channel = exports.ChannelState = void 0;
var ChannelState;
(function (ChannelState) {
    ChannelState[ChannelState["EMPTY"] = 0] = "EMPTY";
    ChannelState[ChannelState["RECEIVER"] = 1] = "RECEIVER";
    ChannelState[ChannelState["DATA"] = 2] = "DATA";
    ChannelState[ChannelState["CLOSED"] = 3] = "CLOSED";
})(ChannelState || (exports.ChannelState = ChannelState = {}));
class Channel {
    constructor() {
        this.state = ChannelState.EMPTY;
        this.dataQueue = [];
        this.receiverQueue = [];
    }
    get State() {
        return this.state;
    }
    send(data) {
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
            }
            else {
                this.dataQueue.push(data);
                this.state = ChannelState.DATA;
            }
        }
        else {
            this.dataQueue.push(data);
            this.state = ChannelState.DATA;
        }
    }
    receive() {
        return __awaiter(this, void 0, void 0, function* () {
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
            return new Promise((resolve, reject) => {
                this.receiverQueue.push(resolve);
                this.state = ChannelState.RECEIVER;
            });
        });
    }
    close() {
        if (this.state !== ChannelState.CLOSED) {
            this.state = ChannelState.CLOSED;
            while (this.receiverQueue.length > 0) {
                this.receiverQueue.shift();
            }
        }
    }
    [Symbol.asyncIterator]() {
        return this;
    }
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const value = yield this.receive();
                return { value, done: false };
            }
            catch (_a) {
                this.close();
                return { value: undefined, done: true };
            }
        });
    }
}
exports.Channel = Channel;
class ChannelError extends Error {
    constructor(message) {
        super(message);
        this.name = "ChannelError";
    }
}
