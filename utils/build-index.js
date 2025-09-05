// utils/build-index.js
// Build super-fast indexes for explorer: txid -> tx, address -> txids, balances

import fs from 'fs';
import path from 'path';

const TX_LOG = path.resolve('data/tx-log.json');
const TX_DIR = path.resolve('data/txs');
const OUT_INDEX = path.resolve('data/index.json');       // { txidToFile: {}, addressToTxids: {} }
const OUT_BAL = path.resolve('data/balances.json');      // { address: number }
const OUT_TXMETA = path.resolve('data/txmeta.json');     // lightweight list for tables

function readAllTxs() {
  if (fs.existsSync(TX_LOG)) {
    const raw = JSON.parse(fs.readFileSync(TX_LOG, 'utf8'));
    return raw;
  }
  if (fs.existsSync(TX_DIR)) {
    const files = fs.readdirSync(TX_DIR).filter(f => f.endsWith('.json'));
    return files.map(f => JSON.parse(fs.readFileSync(path.join(TX_DIR, f), 'utf8')));
  }
  throw new Error('No transactions found: expected data/tx-log.json or data/txs/*.json');
}

function toFixed(n) {
  // keep integers if possible; otherwise round to 8 decimals
  return Number.isInteger(n) ? n : Number.parseFloat(n.toFixed(8));
}

(function main () {
  const txs = readAllTxs();

  /** @type {Record<string,string>} */
  const txidToFile = {};              // txid -> relative path for fetch
  /** @type {Record<string,string[]>} */
  const addressToTxids = {};          // address -> [txid,...]
  /** @type {Record<string,number>} */
  const balances = {};                // address -> balance
  /** @type {{txid:string, ts?:number, in:number, out:number}[]} */
  const txmeta = [];                  // tiny list for tables (no heavy payload)

  // Decide where each tx file will live for the explorer to fetch:
  const isFolderMode = fs.existsSync(TX_DIR);
  for (const tx of txs) {
    const { txid, ts, inputs = [], outputs = [] } = tx;
    if (!txid) continue;

    // Map txid -> file
    const rel = isFolderMode ? `data/txs/${txid}.json` : `data/tx-log.json#${txid}`;
    txidToFile[txid] = rel;

    // Build address index + balances
    let totalIn = 0, totalOut = 0;

    for (const i of inputs) {
      if (!i?.address || i.amount == null) continue;
      addressToTxids[i.address] ||= [];
      addressToTxids[i.address].push(txid);
      balances[i.address] = toFixed((balances[i.address] || 0) - Number(i.amount));
      totalIn += Number(i.amount);
    }
    for (const o of outputs) {
      if (!o?.address || o.amount == null) continue;
      addressToTxids[o.address] ||= [];
      addressToTxids[o.address].push(txid);
      balances[o.address] = toFixed((balances[o.address] || 0) + Number(o.amount));
      totalOut += Number(o.amount);
    }

    txmeta.push({ txid, ts, in: toFixed(totalIn), out: toFixed(totalOut) });

    // If we’re in folder mode but the file isn’t written, write it now
    if (isFolderMode) {
      const f = path.join(TX_DIR, `${txid}.json`);
      if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify(tx, null, 2));
    }
  }

  // Sort arrays for consistency
  for (const a of Object.keys(addressToTxids)) {
    addressToTxids[a] = Array.from(new Set(addressToTxids[a]));
  }

  fs.writeFileSync(OUT_INDEX, JSON.stringify({ txidToFile, addressToTxids }, null, 2));
  fs.writeFileSync(OUT_BAL, JSON.stringify(balances, null, 2));
  fs.writeFileSync(OUT_TXMETA, JSON.stringify(txmeta, null, 2));
  console.log('✅ Built: data/index.json, data/balances.json, data/txmeta.json');
})();
