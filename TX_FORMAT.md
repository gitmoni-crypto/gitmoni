# GitMoni Transaction Format Spec

Each transaction must include the following fields:

- `from`: string — the sender's address (can be hash of pubkey or tag)
- `to`: string — the receiver's address
- `amount`: number — amount of Moni being sent
- `pubkey`: string — sender's public key (hex, 33 or 65 bytes)
- `sig`: string — ECDSA signature (DER-encoded, hex string)

### Message to Sign

The signature must be over the **SHA-256 hash** of the message:

```
`${from}->${to}:${amount}`
```

### Example:

```json
{
  "from": "user1",
  "to": "user2",
  "amount": 1000,
  "pubkey": "02dcc89d5d60826d2de232e11589d2623a55c660a25f6d481361f4de3790522ff5",
  "sig": "30440220714e6536b69ac619b947c680901e14b3cb29908a4fd88475a46721cf42310e16022020307fa6108ba0626980a293eb99a13d152676e03b62e687ab2f094952ca366301"
}
```

Verification fails if any of the above fields are missing or invalid.
