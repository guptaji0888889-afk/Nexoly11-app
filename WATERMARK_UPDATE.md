# Nexoly11 automatic watermark update

- New image uploads are rendered with a permanent `NEXOLY11 🇮🇳` + creator username watermark before upload.
- New video uploads (Reels and video Stories) are rendered in-browser with a permanent watermark using Canvas + MediaRecorder, then uploaded as WebM. Audio is copied from the browser's captured media stream where supported.
- Video rendering requires a modern browser with Canvas captureStream and MediaRecorder. Videos longer than 3 minutes are rejected by this MVP processor. Large videos can take approximately their playback duration to render.
- The app does not remove or obscure another platform's watermark or creator attribution. Use clean source files or content for which you have the required rights/permission.
- Existing posts/stories are not retroactively changed. Only new uploads receive the baked-in watermark.
- Production-grade MP4/H.264 processing, reliable audio preservation across all Android devices, and server-side transcoding require a backend media-processing service (e.g. FFmpeg worker).
