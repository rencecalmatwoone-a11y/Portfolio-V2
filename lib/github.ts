import { socials } from "@/data/socials";

export const github = socials.find((social) => social.label === "GitHub")!;
export const contributionsUrl = `https://github.com/users/${github.handle.slice(1)}/contributions`;

export type ContributionDay = { date: string; count: number; level: number };

export function parseContributions(value: unknown): ContributionDay[] {
  const days = (value as { contributions?: unknown } | null)?.contributions;
  if (!Array.isArray(days) || !days.length || days.length > 10_000) throw new Error("Invalid calendar");
  const result: ContributionDay[] = days.map((day: ContributionDay) => {
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
      !Number.isFinite(Date.parse(`${day.date}T00:00:00Z`)) ||
      new Date(`${day.date}T00:00:00Z`).toISOString().slice(0, 10) !== day.date ||
      !Number.isSafeInteger(day.count) || day.count < 0 ||
      !Number.isInteger(day.level) || day.level < 0 || day.level > 4) throw new Error("Invalid day");
    return { date: day.date, count: day.count, level: day.level };
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (result.some((day, index) => index > 0 && Date.parse(day.date) - Date.parse(result[index - 1].date) !== 86400000)) {
    throw new Error("Incomplete calendar");
  }
  return result.slice(-366);
}
