const blocked = ["abuseword"];

export function hasProfanity(value: string) {
  const normalized = value.toLowerCase();
  return blocked.some((word) => normalized.includes(word));
}
