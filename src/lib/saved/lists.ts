const LIKES_KEY = "elf_likes";
const WAITING_KEY = "elf_waiting";
const EVENT = "elf-saved";

function read(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSavedLists(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}

export function snapshotLikes() {
  return JSON.stringify(read(LIKES_KEY));
}

export function snapshotWaiting() {
  return JSON.stringify(read(WAITING_KEY));
}

export function serverSavedSnapshot() {
  return "[]";
}

export function toggleLike(productId: string) {
  const next = read(LIKES_KEY);
  const index = next.indexOf(productId);
  if (index >= 0) next.splice(index, 1);
  else next.push(productId);
  write(LIKES_KEY, next);
  return next.includes(productId);
}

export function addWaiting(productId: string) {
  const next = read(WAITING_KEY);
  if (!next.includes(productId)) next.push(productId);
  write(WAITING_KEY, next);
}

export function removeWaiting(productId: string) {
  write(
    WAITING_KEY,
    read(WAITING_KEY).filter((id) => id !== productId),
  );
}

export function parseIdList(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}
