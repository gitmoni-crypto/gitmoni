// Full validation of GitMoni transaction using ECDSA
const fs = require('fs');
const path = require('path');
const { ec: EC } = require('elliptic');
const crypto = require('crypto');

const ec = new EC('secp256k1');

function sha256(msg) {
  return crypto.createHash('sha256').update(msg).digest();
}

function verifyTx(tx) {
  const { from, to, amount, pubkey, sig } = tx;
  if (!from || !to || typeof amount !== 'number' || !pubkey || !sig) return false;

  const key = ec.keyFromPublic(pubkey, 'hex');
  const msg = `${from}->${to}:${amount}`;
  const hash = sha256(msg);

  return key.verify(hash, sig);
}

const txs = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/txs.json')));
let allValid = true;
for (const tx of txs) {
  const valid = verifyTx(tx);
  if (!valid) console.error('❌ Invalid TX:', tx);
  allValid &&= valid;
}
console.log(allValid ? '✅ All transactions valid.' : '❌ Some transactions invalid.');
