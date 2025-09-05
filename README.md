# GitMoni — Development Branch

This branch is for **code, scripts, and experiments**.  
It is **not** the canonical ledger (that’s `transactions`) and it is **not** the deployed site (that’s `gh-pages`).

### How to receive your free MONI
1) Star ⭐ this repo.
2) Every ~10 minutes, the faucet gives new stargazers a one-time grant:
   amount = floor(G1 / rank) where rank is your star order.
3) Check your balance on the Explorer (address = gh:YOUR_USERNAME).

---

## Branch roles in this repo
- `transactions` → append-only ledger of raw TX JSONs. Users submit PRs here.  
- `gh-pages` → public explorer site + compiled indexes, published at https://gitmoni.com.  
- `main` (or `develop`) → tooling, scripts, validators, experiments.

---

## Typical contents
- `utils/` → scripts for building indexes, balances, date shards.  
- `validate-tx.js` → local validation logic.  
- `merkle-tree.js` (optional) → demo of Merkle proofs.  
- `package.json` → defines build scripts.  
- README.md (this file).

---

## Common tasks

### Build indexes locally
    npm install
    npm run build:index    # build data/index.json, balances.json, txmeta.json
    npm run build:dates    # build data/index/by-date/*.json and dates.json

### Validate a transaction locally
    npm run validate

### Generate a Merkle tree (demo)
    npm run merkle

---

## Contribution guidelines
- Use this branch for **development work** (new scripts, features).  
- Do **not** add transactions here — those belong in `transactions`.  
- Do **not** commit site-only changes here — those belong in `gh-pages`.  
- Keep code clean and documented so CI jobs can run without surprises.

---

## Notes
- Think of `main`/`develop` as the **workbench**.  
- The real ledger lives in `transactions`.  
- The live explorer is served from `gh-pages`.  


