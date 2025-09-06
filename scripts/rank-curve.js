// scripts/rank-curve.js
import fs from 'fs';
import path from 'path';

const G1 = BigInt(process.env.G1 || '1618033989'); // default rank #1 grant
const MAX = Number(process.env.MAX_RANK || 100);   // number of ranks to graph
const OUT = process.env.OUTPUT || 'rank-curve.csv';

const reward = (rank) => G1 / BigInt(rank); // floor

const rows = [['rank', 'amount']];
for (let i = 1; i <= MAX; i++) {
  rows.push([i, reward(i).toString()]);
}

const format = (n) => n.toLocaleString('en-US');

fs.writeFileSync(
  OUT,
  rows.map(([rank, amt]) => `${rank}:${format(Number(amt))}`).join('\n')
);
console.log(`✅ Wrote reward curve to ${OUT}`);
