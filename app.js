const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    currentHeight: undefined,
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
    try {
        Globals.currentHeight = await daemon.getBlockCount();
    } catch (err) {
        // console.log(err);
        return;
    } 
    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(Globals.currentHeight);
        db.set(`${Globals.nextRound}`, { winningHash: undefined });
        console.log('** TurtleBet started...')
    }
    if (Globals.nextRound < Globals.currentHeight) {
        let blockHeader = await daemon.getBlockHeaderByHeight({
            height: Globals.nextRound
        })
        winningHash = blockHeader.hash;
        Globals.chickenDinner = winningHash.slice(-1);
        db.set(`${Globals.nextRound}`, { winningHash: `${winningHash}`});
        console.log(`** Winner Winner Chicken Dinner! Stored round ${Globals.nextRound} hash in database: ${winningHash}`)
        Globals.nextRound += 10;
        db.set(`${Globals.nextRound}`, { winningHash: undefined });
    }
}

async function init() {
    await update();
    setInterval(update, 1000);
}

init();