const db = require('quick.db');
const userName = 'testuser';
const bet = '123456';

db.push(`1291900.bets.${userName}`, `${bet}`);