import { decodeBytes, encodeBytes } from "./utils.js";

const algo = "AES-GCM"; //TODO: change this to AES-GCM

const pack = (buff: ArrayBufferLike) =>
  btoa(String.fromCharCode(...new Uint8Array(buff)));

const unpack = (packed: string) => {
  const str = window.atob(packed);

  return new Uint8Array(str.length).map((_, i) => str.charCodeAt(i)).buffer;
};

export const generateKeyPair = async (key: Uint8Array) =>
  crypto.subtle.importKey(
    "raw",
    await crypto.subtle.digest({ name: "SHA-256" }, key),
    { name: algo },
    false,
    ["encrypt", "decrypt"]
  );

export const genKey = async (secret: any, ns: any) =>
  generateKeyPair(encodeBytes(`${secret}:${ns}`));

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

// import {kyber} from 'kyber-crystals';

// const generateKyberKeyPair /*: {privateKey: Uint8Array; publicKey: Uint8Array} */ =
// 	await kyber.keyPair()
// ;

// const {cyphertext, secret} /*: {cyphertext: Uint8Array; secret: Uint8Array} */ =
// 	await kyber.encrypt(keyPair.publicKey)
// ;

// const decrypted /*: Uint8Array */ =
// 	await kyber.decrypt(cyphertext, keyPair.privateKey) // same as secret
// ;

//* flow description
// 1. bob send alice public key
//     - sendAlice(kyber.keyPair().publicKey)
// 2. alice generate cyphertext/shared secret from bob's public key
//     - const {cyphertext, secret} = encrypt(bobPublicKey)
//     - sendBob(cyphertext)
// 3. bob take cypertext and generate the same shared secret
//     - const secret = decrypt(aliceCyphertext)
