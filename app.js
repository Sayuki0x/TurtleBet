const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    nextRound: undefined,
    chickenDinner: undefined
};

const daemon = new TurtleCoind({
    host: 'extrahash.tk',
    port: 11898,
    timeout: 10000,
    ssl: false
});

function initRound(x) {
    return (Math.ceil(x / 10) * 10);
}

async function update() {
    let currentHeight = await daemon.getBlockCount();
    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(currentHeight);
        console.log('Winning hash collector started...')
    }
    if (Globals.nextRound < currentHeight) {
        let blockHeader = await daemon.getBlockHeaderByHeight({
            height: Globals.nextRound
        })
        winningHash = blockHeader.hash;
        Globals.chickenDinner = winningHash.slice(-1);
        db.set(`${Globals.nextRound}`, { winningHash: `${winningHash}`});
        console.log(`Winner Winner Chicken Dinner! Stored round ${currentHeight} hash in database: ${winningHash}`)
        Globals.nextRound += 10;
    }
}

async function init() {
    await update();
    setInterval(update, 1000);
}

init();