import type { LockedSite } from "./LockedSite";

export type LockedSites = {
  [domain: string]: LockedSite;
};