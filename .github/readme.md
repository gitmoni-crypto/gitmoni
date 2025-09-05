# GitMoni — Public Site (gh-pages)

Public site and explorer:
- https://gitmoni.com
- https://gitmoni-crypto.github.io/gitmoni/

Purpose:
- Host Explorer (explorer.html) and Submit (submit.html)
- Serve compiled indexes for fast lookups
- Optionally mirror data/txs/ from the transactions branch

Directory layout:
    index.html
    explorer.html
    submit.html
    styles.css
    data/
      txs/                 (optional mirror of raw txs)
      index.json           (txid → file)
      balances.json        (address → balance)
      txmeta.json          (summary rows)
      index/by-date/*.json (date-sharded indexes)

Workflow:
- Users PR to transactions → CI validates and merges.
- A separate CI job rebuilds indexes and pushes updates here.

Build indexes locally (optional):
    npm run build:index   # writes data/index.json, balances.json, txmeta.json
    npm run build:dates   # writes data/index/by-date/*.json and dates.json
    git add data/index* data/balances.json data/txmeta.json
    git commit -m "Update indexes"
    git push origin gh-pages

Notes:
- Keep gh-pages static-only (no node_modules, build tools).
- For custom domain: add CNAME with gitmoni.com, point DNS to GitHub Pages, enable Enforce HTTPS in Settings → Pages.
