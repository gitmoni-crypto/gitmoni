// keys.js — module-friendly, no global elliptic needed
(async () => {
  // Load elliptic either from global (if you add a CDN later) or ESM CDN
  const ellipticLib =
    (typeof window !== "undefined" && window.elliptic)
      ? window.elliptic
      : (await import("https://esm.sh/elliptic@6.5.4")).default;

  const EC = ellipticLib.ec;
  const ec = new EC("secp256k1");

  let keyPair;

  async function sha256hex(str) {
    const data = new TextEncoder().encode(str);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function pubkeyToAddress(pubkeyHex) {
    const data = new TextEncoder().encode(pubkeyHex);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 16);
  }

  window.generateKeys = function generateKeys() {
    keyPair = ec.genKeyPair();
    const priv = keyPair.getPrivate("hex");
    const pub = keyPair.getPublic(true, "hex");
    pubkeyToAddress(pub).then(addr => {
      document.getElementById("key-output").textContent =
        `Private Key:\n${priv}\n\nPublic Key:\n${pub}\n\nDerived Address:\n${addr}`;
    });
  };

  window.signTransaction = async function signTransaction(e) {
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
  };
})();
