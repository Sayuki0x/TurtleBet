const db = require('quick.db');
const userName = 'admin';
const bet = '1234567';

db.push(`1309670.bets.${userName}`, `${bet}`);