// Browser polyfill for crypto utils
if (!window.crypto) {
  window.crypto = {
    getRandomValues: function(buf) {
      for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
      return buf;
    }
  };
}
