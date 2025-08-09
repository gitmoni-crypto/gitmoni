// keys.js
if (typeof elliptic === "undefined") {
  throw new Error("elliptic not loaded. Load CDN before keys.js");
}
const EC = elliptic.ec;
const ec = new EC("secp256k1");

let keyPair;

// Web Crypto SHA-256 → hex
async function sha256hex(str) {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// address = first 8 bytes of sha256(pubkeyHex)
async function pubkeyToAddress(pubkeyHex) {
  const data = new TextEncoder().encode(pubkeyHex);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  return hex.slice(0, 16);
}

function generateKeys() {
  keyPair = ec.genKeyPair();
  const priv = keyPair.getPrivate("hex");
  const pub = keyPair.getPublic(true, "hex");
  pubkeyToAddress(pub).then(addr => {
    document.getElementById("key-output").textContent =
      `Private Key:\n${priv}\n\nPublic Key:\n${pub}\n\nDerived Address:\n${addr}`;
  });
}

async function signTransaction(e) {
  e.preventDefault();
  if (!keyPair) return alert("Generate keys first!");

  const to = document.getElementById("to").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const pubkey = keyPair.getPublic(true, "hex");
  const from = await pubkeyToAddress(pubkey);
  const message = `${from}->${to}:${amount}`;
  const hashHex = await sha256hex(message);

  const sig = keyPair.sign(hashHex, { canonical: true });
  const derSig = sig.toDER("hex");

  const tx = { from, to, amount, pubkey, sig: derSig };
  document.getElementById("signed-output").textContent = JSON.stringify(tx, null, 2);
}

// (optional) expose for inline onclick handlers
window.generateKeys = generateKeys;
window.signTransaction = signTransaction;
