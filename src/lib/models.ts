import mongoose, { Schema, Document, Model } from "mongoose";

// ─── WatchlistItem subdocument ────────────────────────────────────────────────
export interface IWatchlistItem {
  _id?: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  addedAt: Date;
}

// ─── ContinueWatching subdocument ─────────────────────────────────────────────
export interface IContinueWatching {
  _id?: string;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  progress: number;
  duration: number;
  season: number | null;
  episode: number | null;
  updatedAt: Date;
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export interface IProfile extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatarIndex: number;
  userId: string;
  watchlist: IWatchlistItem[];
  continueWatching: IContinueWatching[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistItemSchema = new Schema<IWatchlistItem>(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    poster: { type: String, default: null },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ContinueWatchingSchema = new Schema<IContinueWatching>(
  {
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, required: true },
    poster: { type: String, default: null },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    season: { type: Number, default: null },
    episode: { type: Number, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    avatarIndex: { type: Number, default: 0 },
    userId: { type: String, required: true, index: true },
    watchlist: [WatchlistItemSchema],
    continueWatching: [ContinueWatchingSchema],
  },
  { timestamps: true }
);

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    hashedPassword: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Model Exports ────────────────────────────────────────────────────────────
export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export const Profile: Model<IProfile> =
  mongoose.models.Profile ??
  mongoose.model<IProfile>("Profile", ProfileSchema);
