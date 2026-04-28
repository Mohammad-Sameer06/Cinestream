"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PencilLine, Plus, Trash2, UserRound } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { UserProfile } from "@/types";
import { useProfileStore } from "@/store/profileStore";
import { useWatchlistStore } from "@/store/watchlistStore";

const AVATAR_GRADIENTS = [
  ["#f04d38", "#ff8c5a"],
  ["#38bdf8", "#6366f1"],
  ["#22c55e", "#14b8a6"],
  ["#c084fc", "#ec4899"],
  ["#f59e0b", "#fb7185"],
  ["#818cf8", "#22d3ee"],
];

export default function ProfilesPage() {
  const router = useRouter();
  const { setActiveProfile } = useProfileStore();
  const { setItems } = useWatchlistStore();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data } = await axios.get("/api/profiles");
        setProfiles(data);
      } catch {
        toast.error("Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfiles();
  }, []);

  const handleSelectProfile = async (profile: UserProfile) => {
    setActiveProfile(profile);

    try {
      const { data } = await axios.get(`/api/watchlist?profileId=${profile.id}`);
      setItems(data);
    } catch {
      toast.error("Could not load your saved titles");
    }

    router.push("/browse");
  };

  const handleCreateProfile = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast.error("Enter a profile name");
      return;
    }

    setCreating(true);

    try {
      await axios.post("/api/profiles", {
        name: trimmedName,
        avatarIndex: selectedAvatar,
      });

      const { data } = await axios.get("/api/profiles");
      setProfiles(data);
      setNewName("");
      setSelectedAvatar(0);
      setShowCreate(false);
      toast.success("Profile created");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to create profile");
      } else {
        toast.error("Failed to create profile");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProfile = async (profileId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!window.confirm("Delete this profile?")) {
      return;
    }

    try {
      await axios.delete(`/api/profiles/${profileId}`);
      setProfiles((current) => current.filter((profile) => profile.id !== profileId));
      toast.success("Profile deleted");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Cannot delete profile");
      } else {
        toast.error("Cannot delete profile");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[var(--cs-dark)] text-white">
      <div className="content-wrap flex min-h-screen flex-col justify-center py-12">
        <div className="mx-auto mb-10 text-center">
          <p className="section-eyebrow justify-center">Profiles</p>
          <h1
            className="mt-5 text-4xl font-black tracking-[0.08em] text-[var(--cs-red)]"
            style={{ fontFamily: "var(--cs-display-font)" }}
          >
            CINESTREAM
          </h1>
          <p className="mt-5 text-2xl font-semibold text-white sm:text-4xl">
            Who&apos;s watching?
          </p>
          <p className="mt-3 text-sm text-white/[0.58]">
            Pick a profile to continue where you left off.
          </p>
        </div>

        {loading ? (
          <div className="mx-auto flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-5 py-3 text-white/70">
            <Loader2 size={18} className="animate-spin" />
            Loading profiles
          </div>
        ) : (
          <div className="profile-grid mx-auto">
            {profiles.map((profile, index) => {
              const [from, to] =
                AVATAR_GRADIENTS[profile.avatarIndex % AVATAR_GRADIENTS.length];
              const initial = profile.name.trim().charAt(0).toUpperCase();

              return (
                <motion.button
                  key={profile.id}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleSelectProfile(profile)}
                  className="group relative rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-center transition hover:border-white/[0.18] hover:bg-white/[0.05]"
                >
                  <div
                    className="profile-avatar text-3xl font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {initial || <UserRound size={28} />}
                  </div>
                  <p className="mt-4 line-clamp-1 text-base font-semibold text-white">
                    {profile.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                    Continue
                  </p>

                  <button
                    type="button"
                    onClick={(event) => handleDeleteProfile(profile.id, event)}
                    className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white/65 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/15 hover:text-red-200"
                    aria-label={`Delete ${profile.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.button>
              );
            })}

            {profiles.length < 5 && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: profiles.length * 0.04 }}
                onClick={() => setShowCreate(true)}
                className="group rounded-lg border border-dashed border-white/14 bg-white/[0.02] p-4 text-center transition hover:border-white/24 hover:bg-white/[0.05]"
              >
                <div className="profile-avatar border-dashed border-white/18 bg-white/[0.05]">
                  <Plus size={34} className="text-white/[0.58] transition group-hover:text-white" />
                </div>
                <p className="mt-4 text-base font-semibold text-white">Add Profile</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                  New Viewer
                </p>
              </motion.button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setShowCreate(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="page-panel w-full max-w-md p-6"
            >
              <div className="flex items-center gap-2 text-white/70">
                <PencilLine size={16} />
                <p className="text-sm font-medium">Create profile</p>
              </div>

              <h2 className="mt-4 text-2xl font-semibold text-white">
                Add a new viewer
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/[0.56]">
                Give the profile a name and choose the look that fits.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {AVATAR_GRADIENTS.map(([from, to], index) => (
                  <button
                    key={`${from}-${to}`}
                    type="button"
                    onClick={() => setSelectedAvatar(index)}
                    className={`rounded-2xl border p-3 transition ${
                      selectedAvatar === index
                        ? "border-white/40 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className="mx-auto flex size-14 items-center justify-center rounded-2xl text-xl font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      A
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <div className="relative">
                  <input
                    type="text"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    maxLength={20}
                    placeholder=" "
                    className="cs-input peer"
                    autoFocus
                  />
                  <label className="cs-input-label">Profile name</label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary flex-1 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateProfile}
                  disabled={creating || !newName.trim()}
                  className="btn-red flex-1"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
