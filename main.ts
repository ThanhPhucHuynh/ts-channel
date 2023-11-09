import { Channel } from "typescript-channel";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// printer waits for the messages on the channel until it closes
async function printer(chan: Channel<string>) {
    for await(const data of chan) { // use async iterator to receive data
        console.log(`Received: ${data}`);
    }
    console.log("Closed");
}

// sender sends some messages to the channel
async function sender(id: number, chan: Channel<string>) {
    await delay(id*2000);
    chan.send(`hello from ${id}`); // sends data, boundless channels don't block
    await delay(2800);
    chan.send(`bye from ${id}`); // sends some data again
}

async function main() {
    const chan = new Channel<string>(); // creates a new simple channel
    const p1 = printer(chan); // uses the channel to print the received data
    const p2 = [0, 1, 2, 3, 4].map(async i => sender(i, chan)); // creates and spawns senders

    await Promise.all(p2); // waits for the sender
    await p1; // waits for the channel to close on the receiver end too
    chan.close(); // closes the channel on the server end

}

main();