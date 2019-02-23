const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;
const readline = require('readline');

const Globals = {
    currentHeight: undefined,
    nextRound: undefined,
    chickenDinner: undefined
};

const Bets = [];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const daemon = new TurtleCoind({
    host: '127.0.0.1',
    port: 11898,
    timeout: 2000,
    ssl: false
});

async function update() {
    Globals.currentHeight = await daemon.getBlockCount();
    Globals.nextRound = Math.ceil(Globals.currentHeight / 10) * 10;
    if (Globals.nextRound === Globals.currentHeight) {
        daemon.getBlockHash({
            height: Globals.currentHeight
        }).then((blockHash) => {
            Globals.chickenDinner = blockHash.slice(-1);
        })
    }
    //console.log(Globals);
    //console.log(Bets);
}

async function init() {
    await update();
    setInterval(update, 1000);
}

(async () => {
    await init();
})()

rl.question('What character will be the last digit of the next round block?', (answer) => {
    Bets.push(answer);
    console.log(`Your bet has been recorded: ${answer}`);
    rl.close();
  });