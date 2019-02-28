const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    nextRound: undefined,
    chickenDinner: undefined
};

const daemon = new TurtleCoind({
    host: '127.0.0.1',
    port: 11898,
    timeout: 2000,
    ssl: false
});

function initRound(x) {
    return (Math.ceil(x / 10) * 10);
}

async function update() {
    let currentHeight = await daemon.getBlockCount();
    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(currentHeight);
    }
    if (Globals.nextRound < currentHeight) {
        let blockHeader = await daemon.getBlockHeaderByHeight({
            height: Globals.nextRound
        })
        winningHash = blockHeader.hash;
        Globals.chickenDinner = winningHash.slice(-1);
        Globals.nextRound += 10;
    }
    console.log(Globals);
}

async function init() {
    await update();
    setInterval(update, 1000);
}

(async () => {
    await init();
})()