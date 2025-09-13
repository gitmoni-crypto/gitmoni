// test/faucet.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateFaucetTxs } from '../scripts/faucet-mock'

describe('Faucet Logic', () => {
  let mockStars, mockExistingTxs

  beforeEach(() => {
    // Simulate 3 stargazers, some already paid
    mockStars = [
      { login: 'alice', starred_at: '2023-01-01T00:00:00Z' },
      { login: 'bob', starred_at: '2023-01-02T00:00:00Z' },
      { login: 'carol', starred_at: '2023-01-03T00:00:00Z' },
    ]

    // Pretend bob already received a grant
    mockExistingTxs = [
      {
        from: 'gh:system',
        to: 'gh:bob',
        amount: 809016994, // rank 2 grant
        nonce: 1,
        ts: 1672617600000,
        memo: 'star:rank=2',
        txid: '2023-01-02T00:00:00Z-gh:system->gh:bob-809016994'
      }
    ]
  })

  it('creates new txs for unpaid stargazers', () => {
    const txs = generateFaucetTxs(mockStars, mockExistingTxs, {
      faucetAddr: 'gh:system',
      g1: 1618033989n
    })

    const toRecipients = txs.map(t => t.to)
    expect(toRecipients).toEqual(['gh:alice', 'gh:carol'])

    const aliceTx = txs.find(t => t.to === 'gh:alice')
    expect(aliceTx.amount).toBe(Number(1618033989n / 1n)) // rank 1

    const carolTx = txs.find(t => t.to === 'gh:carol')
    expect(carolTx.amount).toBe(Number(1618033989n / 3n)) // rank 3
  })

  it('skips users in exclude list', () => {
    const txs = generateFaucetTxs(mockStars, [], {
      faucetAddr: 'gh:system',
      g1: 1618033989n,
      exclude: new Set(['carol'])
    })

    expect(txs.map(t => t.to)).toEqual(['gh:alice', 'gh:bob'])
  })
})
