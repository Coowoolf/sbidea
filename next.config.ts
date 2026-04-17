import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Disable React strict mode to avoid Agora WebRTC double-mount in dev:
  // the second mount tears down WebSocket handshakes from the first before
  // they finish, leaving sessions in a half-connected state. Strict mode
  // doesn't run in production, so this is a dev-only consideration.
  reactStrictMode: false,
};

export default nextConfig;
