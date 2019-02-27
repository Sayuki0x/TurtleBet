const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;

const Globals = {
    currentHeight: undefined,
    nextRound: undefined,
    winningHash: undefined,
    chickenDinner: undefined
};

const daemon = new TurtleCoind({
    host: '127.0.0.1',
    port: 11898,
    timeout: 2000,
    ssl: false
});

function initRound(x) {
    return Math.ceil(x / 10) * 10;
}

async function update() {
    Globals.currentHeight = await daemon.getBlockCount(); 
    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(Globals.currentHeight);
    }
    if (Globals.nextRound <= Globals.currentHeight) {
        daemon.getBlockHash({
            height: Globals.nextRound
        }).then((blockHash) => {
            Globals.winningHash = blockHash;
            Globals.chickenDinner = blockHash.slice(-1);
            Globals.nextRound + 10;
        })
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