import Dexie, { type EntityTable } from "dexie";

interface BlobRow {
  id: string;
  data: Blob;
}

type TuneboxDb = Dexie & {
  blobs: EntityTable<BlobRow, "id">;
  covers: EntityTable<BlobRow, "id">;
};

export const db = new Dexie("tunebox") as TuneboxDb;
db.version(1).stores({ blobs: "id", covers: "id" });

// Earlier versions stored audio/cover blobs through idb-keyval, which keeps
// them in the "keyval-store" database under "track-blob:<id>" / "track-cover:<id>".
const LEGACY_DB = "keyval-store";
const MIGRATED_FLAG = "tunebox-dexie-migrated";

const migrateLegacy = async () => {
  try {
    if (localStorage.getItem(MIGRATED_FLAG)) return;
    if (await Dexie.exists(LEGACY_DB)) {
      const legacy = new Dexie(LEGACY_DB);
      await legacy.open(); // opens with whatever schema already exists
      const blobs: BlobRow[] = [];
      const covers: BlobRow[] = [];
      await legacy.table("keyval").each((value: Blob, cursor) => {
        const key = String(cursor.key);
        if (key.startsWith("track-blob:")) {
          blobs.push({ id: key.slice("track-blob:".length), data: value });
        } else if (key.startsWith("track-cover:")) {
          covers.push({ id: key.slice("track-cover:".length), data: value });
        }
      });
      await db.transaction("rw", db.blobs, db.covers, async () => {
        await db.blobs.bulkPut(blobs);
        await db.covers.bulkPut(covers);
      });
      legacy.close();
      await Dexie.delete(LEGACY_DB);
    }
    localStorage.setItem(MIGRATED_FLAG, "1");
  } catch {
    // Leave the flag unset so migration is retried on the next load.
  }
};

/** Resolves once any legacy data has been moved; await before reading. */
export const dbReady = migrateLegacy();
