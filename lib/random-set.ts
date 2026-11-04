// The "random set" study option: N cards picked from all lessons.
// The number comes from the URL (/study/random?count=20), so it's checked
// here: anyone can type any URL, not just use the form.

export const RANDOM_SET_MAX = 50;
export const RANDOM_SET_DEFAULT = 20;

// A whole number from 1 to 50, or null if it's anything else
// ("", "abc", "0", "2.5", "51"…).
export function parseCount(value: string | string[] | undefined): number | null {
  const text = (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  if (!/^\d+$/.test(text)) return null;
  const count = Number(text);
  return count >= 1 && count <= RANDOM_SET_MAX ? count : null;
}
