const TurtleCoind = require('turtlecoin-rpc').TurtleCoind;

const Globals = {
    currentHeight: undefined,
    blockHash: undefined,
    chickenDinner: undefined
};

const daemon = new TurtleCoind({
    host: '127.0.0.1',
    port: 11898,
    timeout: 2000,
    ssl: false
});

async function update() {
    Globals.currentHeight = await daemon.getBlockCount();
    Globals.blockHash = await daemon.getBlockHash({height: Globals.currentHeight});
    Globals.chickenDinner = Globals.blockHash.slice(-1);
    console.log(Globals);
}

async function init() {
    await update();
    setInterval(update, 1000);
}

(async () => {
    await init();
})()