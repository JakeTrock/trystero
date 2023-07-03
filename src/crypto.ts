import { decodeBytes, encodeBytes } from "./utils.js";

const algo = "AES-CBC";

const pack = (buff: ArrayBufferLike) =>
  btoa(String.fromCharCode(...new Uint8Array(buff)));

const unpack = (packed: string) => {
  const str = window.atob(packed);

  return new Uint8Array(str.length).map((_, i) => str.charCodeAt(i)).buffer;
};

export const genKey = async (secret: any, ns: any) =>
  crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest(
      { name: "SHA-256" },
      encodeBytes(`${secret}:${ns}`)
    ),
    { name: algo },
    false,
    ["encrypt", "decrypt"]
  );

export const encrypt = async (
  keyP: CryptoKey | PromiseLike<CryptoKey>,
  plaintext: string
) => {
  const iv = crypto.getRandomValues(new Uint8Array(16));

  return JSON.stringify({
    c: pack(
      await crypto.subtle.encrypt(
        { name: algo, iv },
        await keyP,
        encodeBytes(plaintext)
      )
    ),
    iv: [...iv],
  });
};

export const decrypt = async (
  keyP: CryptoKey | PromiseLike<CryptoKey>,
  raw: string
) => {
  const { c, iv } = JSON.parse(raw);

  return decodeBytes(
    await crypto.subtle.decrypt(
      { name: algo, iv: new Uint8Array(iv) },
      await keyP,
      unpack(c)
    )
  );
};
