import path from "path";

export function storageKeyToAbsolutePath(storageKey: string) {
  return path.join(process.cwd(), "data", storageKey);
}

