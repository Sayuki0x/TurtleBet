const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    currentHeight: undefined,
    nextRound: undefined,
    winningHash: undefined,
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

/*
function payRound() {
    for (const bet of data.bets) {
    const data = {
        winningHash: "ed1e2b3c6cfed1fc527d9691b3a61e0a8498686ada078d8d6249011dde369507",
        bets: [
            {
                user: "admin",
                bet: "abcdef"
            },
            {
                user: "testuser",
                bet: "1234567"
            }
        ]
    }
        if (Array.prototype.slice.call(bet.bet).some((char) => {
            return char === data.winningHash.slice(-1);
        })) {
            console.log(`${bet.user} made a correct bet!`);
        } else {
            console.log(`Unlucky, ${bet.user} did not make a correct bet...`);
        }
    }
}
*/

async function update() {
    try {
        currentHeight = await daemon.getBlockCount();
        console.log(`Successfully assigned temporary variable currentHeight: ${currentHeight}`);
        Globals.currentHeight = currentHeight;
        console.log(`Assigned Globals.currentHeight = ${Globals.currentHeight}`);
    } catch (err) {
        // console.log(err);
        console.log('Failed to get currentHeight');
        return;
    } 

    if (Globals.nextRound === undefined) {
        console.log(`Globals.nextRound is undefined, calculating first round height:`)
        Globals.nextRound = initRound(Globals.currentHeight);
        db.set(`${Globals.nextRound}`, { winningHash: undefined });
        console.log(`First round height set = ${Globals.nextRound}`);
        console.log('** TurtleBet started...');
    }

    if (Globals.nextRound < Globals.currentHeight) {
        console.log(`Current height is greater than round height...`)
        try {
            let blockHeader = await daemon.getBlockHeaderByHeight({
                height: Globals.nextRound
            });
            Globals.winningHash = blockHeader.hash;
            console.log(`Set Globals.winningHash: ${Globals.winningHash}`);
            db.push(`${Globals.nextRound}.winningHash`, `${Globals.winningHash}`);
            let doubleCheck = await db.get(`${Globals.nextRound}.winningHash`);
            console.log(`Discount Doublecheck: ${doubleCheck}`);
            if (doubleCheck === Globals.winningHash) {
                Globals.nextRound += 10;
                db.set(`${Globals.nextRound}`, { winningHash: 'undefined'});
                console.log(`Stored new round height: ${Globals.nextRound}`);
            } else {
                console.log('doubleCheck does not match Globals.winningHash');
                return;
            }
        } catch (err) {
            // console.log(err);
            return;
        }
    }

    // console.log(Globals);
}

async function init() {
    await update();
    setInterval(update, 5000);
}

(async () => {
    await init();
})()

init();