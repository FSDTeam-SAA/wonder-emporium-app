/**
 * Utility functions for author name resolution and formatting across the app.
 */

export interface AuthorLike {
  authorName?: string | null;
  author?:
    | string
    | {
        id?: string;
        name?: string | null;
        authorName?: string | null;
        username?: string | null;
        profile?: {
          firstName?: string | null;
          lastName?: string | null;
          bio?: string | null;
          avatarUrl?: string | null;
        } | null;
        userProfile?: {
          firstName?: string | null;
          lastName?: string | null;
          bio?: string | null;
          avatarUrl?: string | null;
        } | null;
      }
    | null;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
  userProfile?: {
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
  name?: string | null;
  username?: string | null;
  [key: string]: unknown;
}

/**
 * Returns the actual author display name, prioritizing:
 * 1. Explicit `authorName` (e.g. "A.L Sykes")
 * 2. Explicit `name` (e.g. "A.L Sykes")
 * 3. Author as string (e.g. "A.L Sykes")
 * 4. Author object's `authorName` or `name`
 * 5. Profile's `firstName` + `lastName` (from profile or userProfile)
 * 6. Cleaned username fallback as last resort (avoiding raw technical IDs)
 */
export function getAuthorDisplayName(
  item?: unknown,
  defaultName = "Wonder Author",
): string {
  if (!item || typeof item !== "object") return defaultName;
  const candidate = item as AuthorLike;

  // 1. Direct authorName field on book/author
  if (
    typeof candidate.authorName === "string" &&
    candidate.authorName.trim().length > 0
  ) {
    return candidate.authorName.trim();
  }

  // 2. Direct name field
  if (typeof candidate.name === "string" && candidate.name.trim().length > 0) {
    return candidate.name.trim();
  }

  // 3. Item.author is directly a string
  if (
    typeof candidate.author === "string" &&
    candidate.author.trim().length > 0
  ) {
    return candidate.author.trim();
  }

  // 4. Nested author object properties
  if (candidate.author && typeof candidate.author === "object") {
    const authorObj = candidate.author;
    if (
      typeof authorObj.authorName === "string" &&
      authorObj.authorName.trim().length > 0
    ) {
      return authorObj.authorName.trim();
    }
    if (
      typeof authorObj.name === "string" &&
      authorObj.name.trim().length > 0
    ) {
      return authorObj.name.trim();
    }

    const nestedProfile = authorObj.profile || authorObj.userProfile;
    if (nestedProfile) {
      const first = (nestedProfile.firstName || "").trim();
      const last = (nestedProfile.lastName || "").trim();
      const full = `${first} ${last}`.trim();
      if (full.length > 0) return full;
    }
  }

  // 5. Item profile or userProfile
  const directProfile = candidate.profile || candidate.userProfile;
  if (directProfile) {
    const first = (directProfile.firstName || "").trim();
    const last = (directProfile.lastName || "").trim();
    const full = `${first} ${last}`.trim();
    if (full.length > 0) return full;
  }

  // 6. Username fallback (clean up technical strings like 'aerealesykes_u7r2')
  const rawUsername =
    (candidate.author && typeof candidate.author === "object"
      ? candidate.author.username
      : null) || candidate.username;

  if (typeof rawUsername === "string" && rawUsername.trim().length > 0) {
    const trimmed = rawUsername.trim();
    // If username looks like a formatted slug (e.g. name_xxxx), format it into title case
    if (
      /^[a-zA-Z]+(?:[._][a-zA-Z0-9]+)*$/.test(trimmed) &&
      trimmed.includes("_")
    ) {
      const baseName = trimmed.split("_")[0];
      if (baseName.length >= 3) {
        // e.g. "aerealesykes" -> "Aereale Sykes" or capital letters
        const formatted = baseName
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (str) => str.toUpperCase());
        return formatted;
      }
    }
    return trimmed;
  }

  return defaultName;
}
