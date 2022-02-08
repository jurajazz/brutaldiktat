export function sha256(source) {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = crypto.subtle.digest("SHA-256", sourceBytes);
    console.log("sha256:",digest)
    const resultBytes = [...new Uint8Array(digest)];
    return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}

export function getHash(str, algo = "SHA-256") {
  let strBuf = new TextEncoder().encode(str);
  crypto.subtle.digest(algo, strBuf).then(hash => {
      window.hash = hash;
      // here hash is an arrayBuffer,
      // so we'll connvert it to its hex version
      let result = '';
      const view = new DataView(hash);
      for (let i = 0; i < hash.byteLength; i += 4) {
        result += ('00000000' + view.getUint32(i).toString(16)).slice(-8);
      }
      return result;
    });
}

export function cyrb53(str, seed = 0)
{
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    var hash = 4294967296 * (2097151 & h2) + (h1>>>0);
    return hash.toString(16)
};
