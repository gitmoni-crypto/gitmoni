const EC = elliptic.ec;
const ec = new EC('secp256k1');

let keyPair;

function generateKeys() {
  keyPair = ec.genKeyPair();
  const priv = keyPair.getPrivate('hex');
  const pub = keyPair.getPublic(true, 'hex');
  document.getElementById('key-output').textContent = `Private Key:\n${priv}\n\nPublic Key:\n${pub}`;
}

function signTransaction(event) {
  event.preventDefault();
  if (!keyPair) return alert("Generate keys first!");

  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const message = `${from}->${to}:${amount}`;
  const hash = sha256(message);
  const sig = keyPair.sign(hash);
  const derSig = sig.toDER('hex');
  const pubkey = keyPair.getPublic(true, 'hex');

  const tx = {
    from,
    to,
    amount,
    pubkey,
    sig: derSig
  };

  document.getElementById('signed-output').textContent = JSON.stringify(tx, null, 2);
}
