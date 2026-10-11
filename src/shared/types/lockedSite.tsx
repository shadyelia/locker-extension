export type LockedSite = {
  url: string;
  expiresAt: number | null; // null = blocked until manually removed
  createdAt?: number;
  mode?: "timed" | "date" | "forever";
};
