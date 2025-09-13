import { describe, test, expect } from 'bun:test'
import { generateFaucetTxs } from '../faucet-mock.js'

// Mock input: 5 stargazers
const stars = [
  { login: 'alice',   starred_at: '2023-01-01T00:00:00Z' },
  { login: 'bob',     starred_at: '2023-01-01T01:00:00Z' },
  { login: 'carol',   starred_at: '2023-01-01T02:00:00Z' },
  { login: 'dave',    starred_at: '2023-01-01T03:00:00Z' },
  { login: 'eve',     starred_at: '2023-01-01T04:00:00Z' },
]

// Mock state
const paid = new Set(['gh:bob'])
const faucetNonce = 42
const G1 = BigInt("1618033989")
const FAUCET = 'gh:system'
const EXCLUDE = new Set(['eve'])

describe('faucet tx generation', () => {
  test('generates txs with correct rank and amount', () => {
    const out = generateFaucetTxs({ stars, paid, faucetNonce, FAUCET, G1, EXCLUDE })

    expect(out.length).toBe(3)

    expect(out[0].to).toBe('gh:alice')
    expect(out[0].amount).toBe(Number(G1 / BigInt(1)))
    expect(out[0].nonce).toBe(43)

    expect(out[1].to).toBe('gh:carol')
    expect(out[1].amount).toBe(Number(G1 / BigInt(3)))
    expect(out[1].nonce).toBe(44)

    expect(out[2].to).toBe('gh:dave')
    expect(out[2].amount).toBe(Number(G1 / BigInt(4)))
    expect(out[2].nonce).toBe(45)
  })
})
