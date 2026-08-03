/**
 * Helpers for rendering user media (feed posts, chat, lessons).
 *
 * media_urls can hold images *or* videos. Rendering a video URL in an <img>
 * produces a broken-image icon with no thumbnail, so callers must branch on
 * isVideoUrl() and render a <video> instead.
 */

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v|qt)(\?.*)?$/i;

/** True when the URL points at a directly playable video file. */
export function isVideoUrl(url: string | null | undefined): boolean {
  return !!url && VIDEO_EXT.test(url);
}

/**
 * Props that guarantee a visible thumbnail for a <video>.
 *
 * `preload="metadata"` makes the browser fetch and paint the first frame, so the
 * player shows a still instead of a black box before playback. The muted
 * background keeps it from flashing pure black while that frame loads, and
 * playsInline stops iOS from hijacking into fullscreen on tap.
 */
export const VIDEO_THUMB_PROPS = {
  preload: "metadata" as const,
  playsInline: true,
  controls: true,
};

/** Tailwind classes giving a video a soft branded backdrop while it loads. */
export const VIDEO_THUMB_BG =
  "bg-gradient-to-br from-primary/10 via-muted to-background";
