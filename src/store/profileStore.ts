"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserProfile } from "@/types";

interface ProfileState {
  activeProfile: UserProfile | null;
  setActiveProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      activeProfile: null,
      setActiveProfile: (profile) => set({ activeProfile: profile }),
      clearProfile: () => set({ activeProfile: null }),
    }),
    {
      name: "cinestream-profile",
    }
  )
);
