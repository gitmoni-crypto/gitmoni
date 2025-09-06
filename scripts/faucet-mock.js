// scripts/faucet-mock.js

export function generateFaucetTxs({ stars, paid, faucetNonce, FAUCET, G1, EXCLUDE }) {
  const grantForRank = (rank) => G1 / BigInt(rank); // floor

  const buildTx = ({ from, to, amount, nonce, rank }) => {
    const ts = Date.now();
    const iso = new Date(ts).toISOString().replace(/\.\d{3}Z/, 'Z');
    const txid = `${iso}-${from}->${to}-${amount}`;
    return {
      txid,
      from,
      to,
      amount: Number(amount),
      nonce,
      ts,
      memo: `star:rank=${rank}`
    };
  };

  // Sort stargazers chronologically
  const sorted = [...stars].sort((a, b) =>
    new Date(a.starred_at) - new Date(b.starred_at)
  );

  const txs = [];
  let nonce = faucetNonce;

  for (let i = 0; i < sorted.length; i++) {
    const login = (sorted[i].login || '').toLowerCase();
    const to = `gh:${login}`;
    const rank = i + 1;

    if (EXCLUDE.has(login)) continue;
    if (paid.has(to)) continue;

    const amount = grantForRank(rank);
    if (amount <= 0n) continue;

    nonce += 1;
    txs.push(buildTx({ from: FAUCET, to, amount, nonce, rank }));
  }

  return txs;
}
