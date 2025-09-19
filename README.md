# GitMoni — GitHub-Based Cryptocurrency

**GitMoni** is a cryptocurrency built on GitHub where users earn tokens by starring the repository. It uses GitHub's infrastructure for trust, identity, and transaction storage.tMoni — Development Branch

This branch is for **code, scripts, and experiments**.  
It is **not** the canonical ledger (that’s `transactions`) and it is **not** the deployed site (that’s `gh-pages`).

### How to receive your free MONI
1) Star ⭐ this repo.
2) Every ~10 minutes, the faucet gives new stargazers a one-time grant:
   amount = floor(G1 / rank) where rank is your star order.
3) Check your balance on the Explorer (address = gh:YOUR_USERNAME).

---

## Repository structure
- `transactions` → append-only ledger of raw transaction JSONs. The canonical blockchain.  
- `gh-pages` → public explorer website + compiled indexes, published at https://gitmoni.com.  
- `develop` → tooling, scripts, validators, and development work.

---

## Key components
- `scripts/` → build tools for generating indexes and balances from transaction data.  
- `validate-tx.js` → transaction validation logic.  
- `.github/workflows/` → automated faucet and index publishing workflows.  
- Transaction format: `{txid, from, to, amount, nonce, ts, memo}`

---

## How it works

### Automated Star Faucet
- GitHub Actions workflow runs every 10 minutes
- Detects new stargazers using GitHub API
- Creates transactions with rank-based amounts (G1 = 1,618,033,989)
- Pushes transactions to the `transactions` branch

### Index Generation
- Another workflow builds balances and transaction indexes
- Publishes updated data to `gh-pages` for the website
- Enables real-time balance checking and transaction history

### Transaction Economics
- **Rank 1**: 1,618,033,989 MONI (Golden ratio × 10^9)
- **Rank 2**: 809,016,994 MONI (G1 ÷ 2)
- **Rank 3**: 539,344,663 MONI (G1 ÷ 3)
- And so on... earlier stars get exponentially more tokens

---

## Development

### Build indexes locally
    node scripts/build-index.js

### Manual faucet testing
    node scripts/faucet-mock.js

### View transaction curves
    node scripts/rank-curve.js

---

## Contribution guidelines
- Use the `develop` branch for **development work** (new scripts, features).  
- Do **not** add transactions manually — those are created by the automated faucet.  
- Submit improvements via pull requests to enhance the automation or website.

---

## Notes
- **Decentralized**: Uses GitHub's distributed infrastructure  
- **Transparent**: All transactions visible in git history  
- **Automated**: No manual intervention needed for token distribution  
- **Fair**: Earlier supporters get more tokens, but everyone gets some  


