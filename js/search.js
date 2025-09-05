// js/search.js
export async function loadIndexes() {
  const [idx, bal] = await Promise.all([
    fetch('data/index.json').then(r => r.json()),
    fetch('data/balances.json').then(r => r.json()),
  ]);
  return { index: idx, balances: bal };
}

export async function fetchTx(txid, txidToFile) {
  const loc = txidToFile[txid];
  if (!loc) return null;

  // Folder mode: direct file
  if (!loc.includes('#')) {
    return fetch(loc).then(r => r.json());
  }

  // Log mode: fetch tx-log.json and pick the txid
  const [file, anchor] = loc.split('#'); // "data/tx-log.json", "txid"
  const list = await fetch(file).then(r => r.json());
  return list.find(t => t.txid === anchor) || null;
}

export async function txsForAddress(address, index) {
  return (index.addressToTxids[address] || []);
}
