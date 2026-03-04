const SW_CONTENT = `// Minimal service worker - prevents "Unexpected token '<'" when browser or extension requests this file.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => {});
`;

export function GET() {
  return new NextResponse(SW_CONTENT, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
      "Service-Worker-Allowed": "/",
    },
  });
}
