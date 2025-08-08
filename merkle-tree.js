const fs = require('fs');
const path = require('path');
const { buildMerkleTree, getMerkleProof, hashTx, verifyProof } = require('./utils/merkle');

const txs = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data/txs.json')));
const { root, tree } = buildMerkleTree(txs);

console.log('🌲 Merkle Root:', root);

// Proof for tx 0
const index = 0;
const leaf = hashTx(txs[index]);
const proof = getMerkleProof(tree, index);
console.log('\n📜 Proof for tx[0]:', JSON.stringify(proof, null, 2));

const ok = verifyProof(leaf, proof, root);
console.log(ok ? '\n✅ Proof verified.' : '\n❌ Proof failed.');
