# GitMoni — Transactions Branch

Canonical ledger of user-submitted transactions.

This branch should only contain:
- data/txs/<txid>.json  (one file per transaction)
- .github/workflows/pr-validate.yml
- README.md

## How it works
1) Fork the repo.  
2) Add exactly one new file under data/txs/.  
3) Open a Pull Request into the transactions branch.  
4) CI validates:
   - Exactly one added file under data/txs/
   - Valid JSON fields
   - PR actor matches `from`
   - Correct nonce (count of prior outgoing txs)
   - Sufficient balance
5) If valid, the PR auto-merges.

## Transaction JSON (example)
    {
      "txid": "2025-09-04T20:45:10Z-gh:alice->gh:bob-50",
      "from": "gh:alice",
      "to":   "gh:bob",
      "amount": 50,
      "nonce": 3,
      "ts": 1693879510000,
      "memo": "optional note"
    }

Rules:
- from / to: use gh:USERNAME (e.g., gh:alice)
- amount: positive number
- nonce: number of previous outgoing txs from `from` (starting at 0)
- ts: Unix ms timestamp
- memo: optional

Notes:
- Append-only: no edits to past tx files.
- If a PR fails, fix nonce/amount and push again.
- This branch is tx-only to keep reviews clean.
