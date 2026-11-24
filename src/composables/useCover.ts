import type { Ref } from "vue";
import type { Track } from "@/types";

// Object URL of the track's cover art ("" when it has none).
export const useCover = (
  track: Ref<Track | null | undefined>,
  getCover: (id: string) => Promise<Blob | undefined>,
) => {
  const url = ref("");
  let objectUrl = "";

  const revoke = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  };

  watch(
    () => (track.value?.hasCover ? track.value.id : ""),
    async (id) => {
      revoke();
      url.value = "";
      if (!id) return;
      const blob = await getCover(id);
      // The song may have changed while the cover was loading.
      if (!blob || track.value?.id !== id) return;
      objectUrl = URL.createObjectURL(blob);
      url.value = objectUrl;
    },
    { immediate: true },
  );

  onScopeDispose(revoke);

  return url;
};
