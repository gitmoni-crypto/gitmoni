// Build simple balances.json and txs.json from data/txs/*.json

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const TX_DIR = 'data/txs'
const OUT_DIR = 'index'

// Build raw txs list
const filenames = readdirSync(TX_DIR).filter(f => f.endsWith('.json'))

let txs = []
let balances = {}

for (const file of filenames) {
  const tx = JSON.parse(readFileSync(join(TX_DIR, file), 'utf8'))

  txs.push(tx)

  const { from, to, amount } = tx

  if (from !== 'gh:system') {
    balances[from] = (balances[from] || 0) - amount
  }

  balances[to] = (balances[to] || 0) + amount
}

// Save sorted txs
txs.sort((a, b) => b.ts - a.ts)

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'txs.json'), JSON.stringify(txs, null, 2))
writeFileSync(join(OUT_DIR, 'balances.json'), JSON.stringify(balances, null, 2))

console.log(`✅ Wrote ${txs.length} txs and ${Object.keys(balances).length} balances`)
