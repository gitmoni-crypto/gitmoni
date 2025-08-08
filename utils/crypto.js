function sha256(msg) {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  return require('crypto').createHash('sha256').update(data).digest();
}

if (typeof window !== 'undefined') {
  window.sha256 = function (msg) {
    const utf8 = new TextEncoder().encode(msg);
    return elliptic.utils.sha256(utf8);
  };
}
