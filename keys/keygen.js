function generateKeys() {
  const key = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
  document.getElementById('output').textContent = 'Private Key:\n' + hex;
}
