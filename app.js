const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const db = require('quick.db');

const Globals = {
    currentHeight: undefined,
    nextRound: undefined,
    winningHash: undefined,
};

const daemon = new TurtleCoind({
    host: 'localhost',
    port: 11898,
    timeout: 10000,
    ssl: false
});

function initRound(x) {
    return (Math.ceil(x / 10) * 10);
}

/* example response
{
    "bets": {
        "testuser": ["abcdef"],
        "admin": ["1234567"]
    },
    "winningHash": ["8e1b45d5e445b2f968226074c315354bd81e8537b99558f59494946a03603671"]
}
*/

function payRound(height) {
    const payoutRound = db.get(`${height}`);
    console.log(payoutRound);
    return undefined;
}

async function update() {
    try {
        currentHeight = await daemon.getBlockCount();
        Globals.currentHeight = currentHeight;
    } catch (err) {
        // console.log(err);
        console.log('Failed to get currentHeight');
        return;
    } 
    if (Globals.nextRound === undefined) {
        Globals.nextRound = initRound(Globals.currentHeight);
        db.set(`${Globals.nextRound}`, { undefined });
        console.log('** TurtleBet started...');
    }
    if (Globals.nextRound < Globals.currentHeight) {
        let winningRound = Globals.nextRound;
        Globals.nextRound += 10;
        console.log(`** Current height is greater than round height...`);
        console.log(`** Stored new round height = ${Globals.nextRound}`);
        try {
            let blockHeader = await daemon.getBlockHeaderByHeight({
                height: winningRound
            });
            Globals.winningHash = blockHeader.hash;
            db.push(`${winningRound}.winningHash`, `${Globals.winningHash}`);
            console.log(`Winning hash for round ${winningRound} = ${Globals.winningHash}`)
            db.set(`${Globals.nextRound}`, { undefined });
            payRound(winningRound);
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