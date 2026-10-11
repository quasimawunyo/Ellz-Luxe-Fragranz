"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addWaiting,
  parseIdList,
  removeWaiting,
  snapshotLikes,
  snapshotWaiting,
  subscribeSavedLists,
  toggleLike,
} from "@/lib/saved/lists";

export function useSavedLists() {
  const [likes, setLikes] = useState<string[]>([]);
  const [waiting, setWaiting] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setLikes(parseIdList(snapshotLikes()));
      setWaiting(parseIdList(snapshotWaiting()));
    };
    sync();
    return subscribeSavedLists(sync);
  }, []);

  return {
    likes,
    waiting,
    isLiked: useCallback((id: string) => likes.includes(id), [likes]),
    isWaiting: useCallback((id: string) => waiting.includes(id), [waiting]),
    toggleLike,
    addWaiting,
    removeWaiting,
  };
}
