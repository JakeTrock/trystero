/* eslint-disable no-underscore-dangle */
import { SimplePeer } from "simple-peer";
import Peer from "simple-peer-light";
import { IpfsRoomConfig } from "./ipfs";
import { TorrentRoomConfig } from "./torrent";
import { BaseRoomConfig, Room } from "./types";

const charSet =
  "0123456789AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";

export const libName = "Trystero";

export const { keys, values, entries, fromEntries } = Object;

export const events = fromEntries(
  ["close", "connect", "data", "error", "signal", "stream", "track"].map(
    (k) => [k, k]
  )
);

export const initPeer = (
  initiator: boolean,
  trickle: boolean,
  config: RTCConfiguration | undefined
) => {
  const peer: SimplePeer = new Peer({ initiator, trickle, config });
  const onData = (data: any) => peer.__earlyDataBuffer.push(data); //TODO: resolve when network works

  peer.on(events.data, onData);
  peer.__earlyDataBuffer = [];
  peer.__drainEarlyData = (f: any) => {
    peer.off(events.data, onData);
    peer.__earlyDataBuffer.forEach(f);
    delete peer.__earlyDataBuffer;
    delete peer.__drainEarlyData;
  };

  return peer;
};

export const genId = (n: number) =>
  new Array(n)
    .fill("")
    .map(() => charSet[Math.floor(Math.random() * charSet.length)])
    .join("");

export const mkErr = (msg: string) => new Error(`${libName}: ${msg}`);

export const initGuard =
  (
    occupiedRooms: { [x: string]: any },
    f: {
      (config: any, ns: string): Room;
      (config: any, ns: string): Promise<string[]>;
      (config: BaseRoomConfig & TorrentRoomConfig, ns: string): Room;
      (config: BaseRoomConfig & IpfsRoomConfig, ns: string): Room;
      (arg0: any, arg1: any): any;
    }
  ) =>
  (config: { appId: any; firebaseApp: any }, ns: string | number) => {
    if (occupiedRooms[ns]) {
      throw mkErr(`already joined room ${ns}`);
    }

    if (!config) {
      throw mkErr("requires a config map as the first argument");
    }

    if (!config.appId && !config.firebaseApp) {
      throw mkErr("config map is missing appId field");
    }

    if (!ns) {
      throw mkErr("namespace argument required");
    }

    return f(config, ns);
  };

export const selfId = genId(20);

export const noOp = () => {};

export const encodeBytes = (txt: string | undefined) =>
  new TextEncoder().encode(txt);

export const decodeBytes = (txt: AllowSharedBufferSource | undefined) =>
  new TextDecoder().decode(txt);

export const combineChunks = (chunks: any[]) => {
  const full = new Uint8Array(
    chunks.reduce((a: any, c: { byteLength: any }) => a + c.byteLength, 0)
  );

  chunks.reduce((a: number | undefined, c) => {
    full.set(c, a);
    return a + c.byteLength;
  }, 0);

  return full;
};
