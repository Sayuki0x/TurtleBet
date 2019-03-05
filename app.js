const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    currentHeight: undefined,
    nextRound: undefined,
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

function payRound() {
    // check if any user's bets match the winning hash
}

async function update() {
    try {
        currentHeight = await daemon.getBlockCount();
        Globals.currentHeight = currentHeight;
    } catch (err) {
        console.log(err);
        return;
    } 

    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(Globals.currentHeight);
        db.set(`${Globals.nextRound}`, { winningHash: undefined });
        console.log('** TurtleBet started...')
    }

    if (Globals.nextRound < Globals.currentHeight) {
        try {
            let blockHeader = await daemon.getBlockHeaderByHeight({
                height: Globals.nextRound
            })
            db.set(`${Globals.nextRound}`, { winningHash: `${blockHeader.hash}`});
            console.log(`** Winner Winner Chicken Dinner! Stored round ${Globals.nextRound} hash in database: ${blockHeader.hash}`);
            if (db.get(`${Globals.nextRound}`.winningHash) === winningHash) {
                Globals.nextRound += 10;
                db.set(`${Globals.nextRound}`, { winningHash: 'undefined'});
            }
        } catch (err) {
            console.log(err);
            return;
        }
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

init();