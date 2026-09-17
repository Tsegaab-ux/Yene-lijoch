// app/utils/avatarColors.ts
const AVATAR_COLORS = [
  "#E57373", "#F06292", "#BA68C8", "#9575CD",
  "#7986CB", "#64B5F6", "#4FC3F7", "#4DB6AC",
  "#81C784", "#AED581", "#FFB74D", "#FF8A65",
];

export function colorFor(seed?: string): string {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Compute initials from a full name.
 *   "Ruth Bekele"  → "RB"
 *   "Ruth"         → "RU"   (first two letters)
 *   ""/undefined   → "?"
 */
export function deriveInitials(name?: string): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}