"use client";

import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  UID,
} from "agora-rtc-sdk-ng";

export type StreamMessage = { uid: UID; data: Uint8Array };

export type AgoraHandle = {
  client: IAgoraRTCClient;
  localMic: IMicrophoneAudioTrack;
  leave: () => Promise<void>;
  toggleMic: (muted: boolean) => Promise<void>;
};

/**
 * Join the RTC channel, matching the Android demo's configuration:
 *   - mode: "live" (CHANNEL_PROFILE_LIVE_BROADCASTING)
 *   - role: "host"  (CLIENT_ROLE_BROADCASTER)
 *   - publish microphone, subscribe all remote audio
 */
export async function joinChannel(opts: {
  appId: string;
  channel: string;
  token: string | null;
  uid: number;
  onRemoteUserAudio: (user: IAgoraRTCRemoteUser) => void;
  onRemoteUserLeft: (user: IAgoraRTCRemoteUser) => void;
  onStreamMessage: (msg: StreamMessage) => void;
}): Promise<AgoraHandle> {
  // SSR-safe dynamic import (the SDK touches window at module-init)
  const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
  AgoraRTC.setLogLevel(3);

  const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
  await client.setClientRole("host");

  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      user.audioTrack?.play();
      opts.onRemoteUserAudio(user);
    }
  });
  client.on("user-unpublished", (user) => {
    opts.onRemoteUserLeft(user);
  });
  client.on("user-left", (user) => {
    opts.onRemoteUserLeft(user);
  });
  // ConvoAI transcript comes through the RTC DataStream. The SDK event name
  // is "stream-message"; payload is a UTF-8 encoded pipe-delimited + base64
  // frame — callers route into lib/stream-message-parser.ts.
  client.on("stream-message", (uid: UID, data: Uint8Array) => {
    opts.onStreamMessage({ uid, data });
  });

  await client.join(opts.appId, opts.channel, opts.token, opts.uid);

  const localMic = await AgoraRTC.createMicrophoneAudioTrack();
  await client.publish(localMic);

  return {
    client,
    localMic,
    async leave() {
      try {
        localMic.stop();
        localMic.close();
      } catch {}
      try {
        await client.leave();
      } catch {}
    },
    async toggleMic(muted: boolean) {
      await localMic.setMuted(muted);
    },
  };
}
