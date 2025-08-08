const EC = elliptic.ec;
const ec = new EC('secp256k1');

let keyPair;

function sha256(msg) {
  const utf8 = new TextEncoder().encode(msg);
  return elliptic.utils.sha256(utf8);
}

function hex(buffer) {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

function pubkeyToAddress(pubkeyHex) {
  const pubBytes = new TextEncoder().encode(pubkeyHex);
  const hash = sha256(pubBytes);
  return hex(hash).slice(0, 16); // first 8 bytes as hex (16 chars)
}

function generateKeys() {
  keyPair = ec.genKeyPair();
  const priv = keyPair.getPrivate('hex');
  const pub = keyPair.getPublic(true, 'hex');
  const addr = pubkeyToAddress(pub);

  document.getElementById('key-output').textContent = `Private Key:\n${priv}\n\nPublic Key:\n${pub}\n\nDerived Address:\n${addr}`;
}

function signTransaction(event) {
  event.preventDefault();
  if (!keyPair) return alert("Generate keys first!");

  const to = document.getElementById('to').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const pubkey = keyPair.getPublic(true, 'hex');
  const from = pubkeyToAddress(pubkey);
  const message = `${from}->${to}:${amount}`;
  const hash = sha256(message);
  const sig = keyPair.sign(hash);
  const derSig = sig.toDER('hex');

  const tx = {
    from,
    to,
    amount,
    pubkey,
    sig: derSig
  };

  document.getElementById('signed-output').textContent = JSON.stringify(tx, null, 2);
}
