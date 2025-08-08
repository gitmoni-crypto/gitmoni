// utils/merkle.js - Merkle tree builder + proof
const crypto = require('crypto');

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function hashTx(tx) {
  const json = JSON.stringify(tx);
  return sha256(json);
}

function buildMerkleTree(txList) {
  let level = txList.map(hashTx);
  const tree = [level];

  while (level.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left;
      nextLevel.push(sha256(left + right));
    }
    level = nextLevel;
    tree.unshift(level);
  }

  return {
    root: tree[0][0],
    tree
  };
}

function getMerkleProof(tree, index) {
  const proof = [];
  let idx = index;

  for (let i = tree.length - 1; i > 0; i--) {
    const level = tree[i];
    const isRight = idx % 2;
    const pairIndex = isRight ? idx - 1 : idx + 1;
    const pairHash = level[pairIndex] || level[idx];

    proof.push({
      direction: isRight ? 'left' : 'right',
      hash: pairHash
    });

    idx = Math.floor(idx / 2);
  }

  return proof;
}

function verifyProof(leafHash, proof, root) {
  let hash = leafHash;
  for (const step of proof) {
    hash = step.direction === 'left'
      ? sha256(step.hash + hash)
      : sha256(hash + step.hash);
  }
  return hash === root;
}

module.exports = {
  hashTx,
  buildMerkleTree,
  getMerkleProof,
  verifyProof
};
