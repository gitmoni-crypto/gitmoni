# GitMoni Transaction Format Spec
- `from`: first 8 bytes (16 hex) of SHA-256(compressed_pubkey_hex)
- `to`: same format
- `amount`: number
- `pubkey`: compressed pubkey (hex)
- `sig`: DER-encoded ECDSA signature over SHA-256 of `${from}->${to}:${amount}`
