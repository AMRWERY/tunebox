import type { Track } from "@/types";

export interface PlayerSource {
  tracks: { value: Track[] };
  getBlob: (id: string) => Promise<Blob | undefined>;
}

export type RepeatMode = "off" | "all" | "one";