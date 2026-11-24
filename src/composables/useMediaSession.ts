import type { Ref } from "vue";
import type { Track } from "@/types";

interface MediaSessionSource {
  track: Ref<Track | null>;
  coverUrl: Ref<string>;
  playing: Ref<boolean>;
  currentTime: Ref<number>;
  duration: Ref<number>;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
}

// Lock-screen / headphone / notification controls.
export const useMediaSession = (s: MediaSessionSource) => {
  if (!("mediaSession" in navigator)) return;
  const session = navigator.mediaSession;

  watch(
    [s.track, s.coverUrl],
    ([track, cover]) => {
      session.metadata = track
        ? new MediaMetadata({
            title: track.name,
            artist: track.artist ?? "",
            album: track.album ?? "",
            artwork: cover ? [{ src: cover }] : [],
          })
        : null;
    },
    { immediate: true },
  );

  watch(
    s.playing,
    (playing) => {
      session.playbackState = playing ? "playing" : "paused";
    },
    { immediate: true },
  );

  // Keeps the lock-screen scrubber in step (about once a second).
  watch(
    () => Math.floor(s.currentTime.value),
    () => {
      const duration = s.duration.value;
      if (!Number.isFinite(duration) || duration <= 0) return;
      try {
        session.setPositionState({
          duration,
          position: Math.min(s.currentTime.value, duration),
          playbackRate: 1,
        });
      } catch {
        // Some browsers reject inconsistent values mid-load.
      }
    },
  );

  const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
    ["play", s.play],
    ["pause", s.pause],
    ["nexttrack", s.next],
    ["previoustrack", s.prev],
    [
      "seekto",
      (d) => {
        if (d.seekTime != null) s.currentTime.value = d.seekTime;
      },
    ],
  ];
  for (const [action, handler] of handlers) {
    try {
      session.setActionHandler(action, handler);
    } catch {
      // Action not supported by this browser.
    }
  }
};
