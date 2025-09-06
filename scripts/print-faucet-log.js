// scripts/print-faucet-log.js
import fs from 'fs';
import path from 'path';

const txDir = 'data/txs';
const FAUCET = 'gh:system';

function loadFaucetTxs() {
  const files = fs.existsSync(txDir)
    ? fs.readdirSync(txDir).filter(f => f.endsWith('.json'))
    : [];

  const txs = [];

  for (const f of files.sort()) {
    try {
      const tx = JSON.parse(fs.readFileSync(path.join(txDir, f), 'utf8'));
      if (!tx || typeof tx !== 'object') continue;
      if (tx.from === FAUCET && tx.memo?.startsWith('star:rank=')) {
        const rank = parseInt(tx.memo.split('=')[1], 10);
        txs.push({
          to: tx.to,
          amount: tx.amount,
          rank,
          ts: new Date(tx.ts).toISOString()
        });
      }
    } catch (err) {
      console.warn(`⚠️ Skipping ${f}:`, err.message);
    }
  }

  return txs;
}

function printSummary(txs) {
  console.log(`\n🧾 Faucet Transaction Summary (${txs.length} txs):\n`);
  for (const tx of txs) {
    console.log(`- [Rank #${tx.rank}] → ${tx.to.padEnd(20)}  +${tx.amount.toString().padStart(6)}  @ ${tx.ts}`);
  }
}

const txs = loadFaucetTxs();
printSummary(txs);
