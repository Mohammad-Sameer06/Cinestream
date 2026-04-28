"use client";

import { create } from "zustand";
import { MediaType, WatchlistItem } from "@/types";

interface WatchlistState {
  items: WatchlistItem[];
  setItems: (items: WatchlistItem[]) => void;
  addItem: (item: WatchlistItem) => void;
  removeItem: (tmdbId: number, mediaType: MediaType) => void;
  isInList: (tmdbId: number, mediaType: MediaType) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),
  removeItem: (tmdbId, mediaType) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.tmdbId === tmdbId && i.mediaType === mediaType)
      ),
    })),
  isInList: (tmdbId, mediaType) =>
    get().items.some((i) => i.tmdbId === tmdbId && i.mediaType === mediaType),
}));
