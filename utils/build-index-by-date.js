// utils/build-index-by-date.js
// Input:   data/txs/*.json  (each tx has { txid, ts, inputs[], outputs[] })
// Output:  data/index/by-date/YYYY-MM-DD.json (tiny shards)
//          data/index/dates.json (manifest: sorted dates + counts)

import fs from 'fs';
import path from 'path';

const TX_DIR = path.resolve('data/txs');
const OUT_DIR = path.resolve('data/index/by-date');
const MANIFEST = path.resolve('data/index/dates.json');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function ymd(ts) {
  const d = new Date(Number(ts) || ts); // supports ms or ISO
  const mm = String(d.getUTCMonth()+1).padStart(2,'0');
  const dd = String(d.getUTCDate()).padStart(2,'0');
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

function toFixed(n) {
  return Number.isInteger(n) ? n : Number.parseFloat(Number(n).toFixed(8));
}

(function main() {
  if (!fs.existsSync(TX_DIR)) throw new Error('Expected data/txs/*.json');

  const files = fs.readdirSync(TX_DIR).filter(f => f.endsWith('.json'));
  const byDate = new Map(); // date -> { txids:[], txmeta:[], addressToTxids:{}, txidToFile:{} }

  for (const f of files) {
    const tx = JSON.parse(fs.readFileSync(path.join(TX_DIR, f), 'utf8'));
    const { txid, ts, inputs = [], outputs = [] } = tx;
    if (!txid) continue;

    const date = ymd(ts);
    if (!byDate.has(date)) {
      byDate.set(date, { txids: [], txmeta: [], addressToTxids: {}, txidToFile: {} });
    }
    const bucket = byDate.get(date);

    bucket.txids.push(txid);
    bucket.txidToFile[txid] = `data/txs/${txid}.json`;

    let tin = 0, tout = 0;
    for (const i of inputs) {
      if (!i?.address || i.amount == null) continue;
      (bucket.addressToTxids[i.address] ||= []).push(txid);
      tin += Number(i.amount);
    }
    for (const o of outputs) {
      if (!o?.address || o.amount == null) continue;
      (bucket.addressToTxids[o.address] ||= []).push(txid);
      tout += Number(o.amount);
    }

    bucket.txmeta.push({ txid, ts, in: toFixed(tin), out: toFixed(tout) });
  }

  // dedupe + sort for stability
  const manifest = [];
  ensureDir(OUT_DIR);

  for (const [date, bucket] of byDate.entries()) {
    for (const addr of Object.keys(bucket.addressToTxids)) {
      bucket.addressToTxids[addr] = Array.from(new Set(bucket.addressToTxids[addr]));
    }
    bucket.txids.sort();
    bucket.txmeta.sort((a,b) => (Number(a.ts||0) - Number(b.ts||0)));

    const outFile = path.join(OUT_DIR, `${date}.json`);
    fs.writeFileSync(outFile, JSON.stringify(bucket, null, 2));
    manifest.push({ date, count: bucket.txids.length, file: `data/index/by-date/${date}.json` });
  }

  manifest.sort((a,b) => a.date.localeCompare(b.date));
  ensureDir(path.dirname(MANIFEST));
  fs.writeFileSync(MANIFEST, JSON.stringify({ dates: manifest }, null, 2));

  console.log(`✅ Wrote ${manifest.length} date shards to ${OUT_DIR}`);
  console.log(`✅ Wrote manifest -> ${MANIFEST}`);
})();
